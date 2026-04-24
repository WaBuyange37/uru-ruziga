"""
Data Collector Service for OCR Dataset Storage

Handles comprehensive data collection and storage for ML training:
- Image file management (local/cloud storage)
- Automatic labeling and quality assessment
- Feature vector extraction and storage
- Metadata collection and organization
- Export functionality for ML frameworks

Optimized for OCR training data pipeline and dataset management.
"""

import os
import json
import logging
import hashlib
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple, Union
from pathlib import Path
import base64

import cv2
import numpy as np
from PIL import Image

from .database_service import db_service
from .image_processor import ImageProcessor
from .feature_extractor import FeatureExtractor

logger = logging.getLogger(__name__)

class DataCollector:
    """Production-grade data collection service for OCR training datasets."""
    
    def __init__(
        self,
        storage_root: str = "data/ocr_dataset",
        use_cloud_storage: bool = False,
        cloud_config: Optional[Dict] = None
    ):
        """
        Initialize data collector with storage configuration.
        
        Args:
            storage_root: Root directory for local file storage
            use_cloud_storage: Whether to use cloud storage (S3/Cloudinary)
            cloud_config: Cloud storage configuration
        """
        self.storage_root = Path(storage_root)
        self.use_cloud_storage = use_cloud_storage
        self.cloud_config = cloud_config or {}
        
        # Initialize processors
        self.image_processor = ImageProcessor()
        self.feature_extractor = FeatureExtractor()
        
        # Create storage directories
        self._setup_storage_structure()
        
        logger.info(f"✅ DataCollector initialized with storage: {self.storage_root}")
    
    def _setup_storage_structure(self):
        """Create organized directory structure for dataset storage."""
        directories = [
            "raw_drawings",      # Original user drawings
            "reference_images",  # Font-rendered reference images
            "processed_images",  # Processed user drawings
            "skeleton_images",   # Skeleton analysis images
            "exports",          # ML framework exports
            "metadata"          # JSON metadata files
        ]
        
        for directory in directories:
            (self.storage_root / directory).mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories by character type
        for char_type in ["vowels", "consonants", "ligatures"]:
            for directory in directories[:4]:  # Skip exports and metadata
                (self.storage_root / directory / char_type).mkdir(parents=True, exist_ok=True)
    
    async def collect_evaluation_data(
        self,
        character: str,
        character_type: str,
        user_drawing_base64: str,
        reference_image_base64: str,
        processed_image_base64: str,
        evaluation_results: Dict[str, Any],
        feedback_data: Dict[str, Any],
        feature_vector: Dict[str, Any],
        user_context: Optional[Dict[str, Any]] = None,
        skeleton_image_base64: Optional[str] = None
    ) -> str:
        """
        Collect and store complete evaluation data for OCR training.
        
        Args:
            character: Target character
            character_type: "vowel", "consonant", or "ligature"
            user_drawing_base64: Base64 encoded user drawing
            reference_image_base64: Base64 encoded reference image
            processed_image_base64: Base64 encoded processed image
            evaluation_results: Complete evaluation results
            feedback_data: Generated feedback data
            feature_vector: Extracted feature vector
            user_context: Optional user/session context
            skeleton_image_base64: Optional skeleton analysis image
            
        Returns:
            Collection ID for tracking
        """
        try:
            # Generate unique collection ID
            collection_id = self._generate_collection_id(character, user_drawing_base64)
            
            # Store images and get file paths
            image_paths = await self._store_images(
                collection_id=collection_id,
                character=character,
                character_type=character_type,
                user_drawing_base64=user_drawing_base64,
                reference_image_base64=reference_image_base64,
                processed_image_base64=processed_image_base64,
                skeleton_image_base64=skeleton_image_base64
            )
            
            # Store in database
            drawing_attempt_id = await db_service.store_drawing_attempt(
                character=character,
                character_type=character_type,
                user_drawing_path=image_paths["user_drawing"],
                reference_image_path=image_paths["reference_image"],
                processed_image_path=image_paths["processed_image"],
                final_score=evaluation_results["final_score"],
                evaluation_results=evaluation_results,
                user_context=user_context,
                skeleton_image_path=image_paths.get("skeleton_image")
            )
            
            # Store feature vector
            await db_service.store_feature_vector(
                drawing_attempt_id=drawing_attempt_id,
                geometric_features=feature_vector.get("geometric", {}),
                topological_features=feature_vector.get("topological", {}),
                shape_features=feature_vector.get("shape", {}),
                complete_feature_vector=feature_vector.get("vector", [])
            )
            
            # Store feedback record
            await db_service.store_feedback_record(
                drawing_attempt_id=drawing_attempt_id,
                feedback_data=feedback_data
            )
            
            # Update character statistics
            await db_service.update_character_statistics(
                character=character,
                new_score=evaluation_results["final_score"]
            )
            
            # Store metadata file
            await self._store_metadata(
                collection_id=collection_id,
                character=character,
                character_type=character_type,
                drawing_attempt_id=drawing_attempt_id,
                evaluation_results=evaluation_results,
                feature_vector=feature_vector,
                feedback_data=feedback_data,
                image_paths=image_paths,
                user_context=user_context
            )
            
            logger.info(f"✅ Collected evaluation data: {collection_id} (character: {character}, score: {evaluation_results['final_score']})")
            return collection_id
            
        except Exception as e:
            logger.error(f"❌ Failed to collect evaluation data: {e}")
            raise
    
    async def _store_images(
        self,
        collection_id: str,
        character: str,
        character_type: str,
        user_drawing_base64: str,
        reference_image_base64: str,
        processed_image_base64: str,
        skeleton_image_base64: Optional[str] = None
    ) -> Dict[str, str]:
        """Store all images and return file paths."""
        image_paths = {}
        
        try:
            # Determine subdirectory based on character type
            subdir = f"{character_type}s"  # vowels, consonants, ligatures
            
            # Store user drawing
            user_drawing_path = await self._save_base64_image(
                base64_data=user_drawing_base64,
                directory=self.storage_root / "raw_drawings" / subdir,
                filename=f"{collection_id}_user_drawing.png"
            )
            image_paths["user_drawing"] = str(user_drawing_path.relative_to(self.storage_root))
            
            # Store reference image
            reference_path = await self._save_base64_image(
                base64_data=reference_image_base64,
                directory=self.storage_root / "reference_images" / subdir,
                filename=f"{collection_id}_reference.png"
            )
            image_paths["reference_image"] = str(reference_path.relative_to(self.storage_root))
            
            # Store processed image
            processed_path = await self._save_base64_image(
                base64_data=processed_image_base64,
                directory=self.storage_root / "processed_images" / subdir,
                filename=f"{collection_id}_processed.png"
            )
            image_paths["processed_image"] = str(processed_path.relative_to(self.storage_root))
            
            # Store skeleton image if provided
            if skeleton_image_base64:
                skeleton_path = await self._save_base64_image(
                    base64_data=skeleton_image_base64,
                    directory=self.storage_root / "skeleton_images" / subdir,
                    filename=f"{collection_id}_skeleton.png"
                )
                image_paths["skeleton_image"] = str(skeleton_path.relative_to(self.storage_root))
            
            return image_paths
            
        except Exception as e:
            logger.error(f"❌ Failed to store images for {collection_id}: {e}")
            raise
    
    async def _save_base64_image(
        self,
        base64_data: str,
        directory: Path,
        filename: str
    ) -> Path:
        """Save base64 encoded image to file."""
        try:
            # Remove data URL prefix if present
            if base64_data.startswith("data:image"):
                base64_data = base64_data.split(",", 1)[1]
            
            # Decode base64 data
            image_data = base64.b64decode(base64_data)
            
            # Ensure directory exists
            directory.mkdir(parents=True, exist_ok=True)
            
            # Save image file
            file_path = directory / filename
            
            if self.use_cloud_storage:
                # Upload to cloud storage (implement based on provider)
                cloud_url = await self._upload_to_cloud(image_data, str(file_path))
                # Still save locally for backup
                with open(file_path, "wb") as f:
                    f.write(image_data)
                return file_path
            else:
                # Save locally
                with open(file_path, "wb") as f:
                    f.write(image_data)
                return file_path
                
        except Exception as e:
            logger.error(f"❌ Failed to save image {filename}: {e}")
            raise
    
    async def _store_metadata(
        self,
        collection_id: str,
        character: str,
        character_type: str,
        drawing_attempt_id: str,
        evaluation_results: Dict[str, Any],
        feature_vector: Dict[str, Any],
        feedback_data: Dict[str, Any],
        image_paths: Dict[str, str],
        user_context: Optional[Dict[str, Any]] = None
    ):
        """Store comprehensive metadata for the collection."""
        try:
            metadata = {
                "collection_id": collection_id,
                "drawing_attempt_id": drawing_attempt_id,
                "character": character,
                "character_type": character_type,
                "timestamp": datetime.now().isoformat(),
                "evaluation_results": evaluation_results,
                "feature_vector": feature_vector,
                "feedback_data": feedback_data,
                "image_paths": image_paths,
                "user_context": user_context or {},
                "automatic_labels": {
                    "is_correct": evaluation_results["final_score"] >= 70.0,
                    "quality_label": self._determine_quality_label(evaluation_results["final_score"]),
                    "difficulty_estimate": self._estimate_difficulty(character)
                },
                "ml_ready": True,
                "export_formats": ["tensorflow", "pytorch", "csv", "json"]
            }
            
            # Save metadata file
            metadata_path = self.storage_root / "metadata" / f"{collection_id}_metadata.json"
            with open(metadata_path, "w") as f:
                json.dump(metadata, f, indent=2)
            
            logger.debug(f"✅ Stored metadata for {collection_id}")
            
        except Exception as e:
            logger.error(f"❌ Failed to store metadata for {collection_id}: {e}")
            raise
    
    def _generate_collection_id(self, character: str, user_drawing_base64: str) -> str:
        """Generate unique collection ID based on character and drawing hash."""
        # Create hash from character and drawing data
        content = f"{character}_{user_drawing_base64[:100]}_{datetime.now().isoformat()}"
        hash_object = hashlib.md5(content.encode())
        hash_hex = hash_object.hexdigest()
        
        # Format: CHAR_TIMESTAMP_HASH
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{character.upper()}_{timestamp}_{hash_hex[:8]}"
    
    def _determine_quality_label(self, score: float) -> str:
        """Determine quality label based on score."""
        if score >= 90:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 40:
            return "poor"
        else:
            return "invalid"
    
    def _estimate_difficulty(self, character: str) -> float:
        """Estimate character difficulty for ML labeling."""
        # Simple heuristic - can be improved with actual difficulty data
        base_difficulty = min(len(character), 5)
        return float(base_difficulty)
    
    async def _upload_to_cloud(self, image_data: bytes, file_path: str) -> str:
        """Upload image to cloud storage (placeholder for cloud integration)."""
        # Implement based on cloud provider (S3, Cloudinary, etc.)
        # For now, return local path
        return file_path
    
    # ─── Export Functions for ML Frameworks ──────────────────────────────────
    
    async def export_dataset(
        self,
        export_format: str,
        output_path: str,
        filters: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Export dataset in specified format for ML frameworks.
        
        Args:
            export_format: "tensorflow", "pytorch", "csv", "json"
            output_path: Output file/directory path
            filters: Optional filters for data selection
            
        Returns:
            Path to exported dataset
        """
        try:
            # Get training data from database
            training_data = await db_service.get_training_data(
                character_types=filters.get("character_types") if filters else None,
                quality_labels=filters.get("quality_labels") if filters else None,
                min_score=filters.get("min_score") if filters else None,
                max_score=filters.get("max_score") if filters else None,
                limit=filters.get("limit") if filters else None
            )
            
            if export_format.lower() == "csv":
                return await self._export_csv(training_data, output_path)
            elif export_format.lower() == "json":
                return await self._export_json(training_data, output_path)
            elif export_format.lower() == "tensorflow":
                return await self._export_tensorflow(training_data, output_path)
            elif export_format.lower() == "pytorch":
                return await self._export_pytorch(training_data, output_path)
            else:
                raise ValueError(f"Unsupported export format: {export_format}")
                
        except Exception as e:
            logger.error(f"❌ Failed to export dataset: {e}")
            raise
    
    async def _export_csv(self, training_data: List, output_path: str) -> str:
        """Export dataset as CSV for analysis and simple ML frameworks."""
        import pandas as pd
        
        try:
            # Prepare data for CSV export
            csv_data = []
            for attempt in training_data:
                row = {
                    "id": attempt.id,
                    "character": attempt.character,
                    "character_type": attempt.characterType,
                    "final_score": attempt.finalScore,
                    "is_correct": attempt.isCorrect,
                    "quality_label": attempt.qualityLabel,
                    "user_drawing_path": attempt.userDrawing,
                    "reference_image_path": attempt.referenceImage,
                    "processed_image_path": attempt.processedImage,
                    "submitted_at": attempt.submittedAt.isoformat()
                }
                
                # Add feature vector data if available
                if attempt.featureVector:
                    fv = attempt.featureVector
                    row.update({
                        "contour_area": fv.contourArea,
                        "aspect_ratio": fv.aspectRatio,
                        "stroke_count": fv.strokeCount,
                        "loop_count": fv.loopCount,
                        "complexity_score": fv.complexityScore
                    })
                
                csv_data.append(row)
            
            # Create DataFrame and save
            df = pd.DataFrame(csv_data)
            df.to_csv(output_path, index=False)
            
            logger.info(f"✅ Exported {len(csv_data)} records to CSV: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Failed to export CSV: {e}")
            raise
    
    async def _export_json(self, training_data: List, output_path: str) -> str:
        """Export dataset as JSON for flexible ML frameworks."""
        try:
            json_data = {
                "metadata": {
                    "export_timestamp": datetime.now().isoformat(),
                    "total_samples": len(training_data),
                    "format_version": "1.0"
                },
                "samples": []
            }
            
            for attempt in training_data:
                sample = {
                    "id": attempt.id,
                    "character": attempt.character,
                    "character_type": attempt.characterType,
                    "evaluation": {
                        "final_score": attempt.finalScore,
                        "is_correct": attempt.isCorrect,
                        "quality_label": attempt.qualityLabel,
                        "ssim_score": attempt.ssimScore,
                        "contour_score": attempt.contourScore,
                        "skeleton_score": attempt.skeletonScore
                    },
                    "images": {
                        "user_drawing": attempt.userDrawing,
                        "reference_image": attempt.referenceImage,
                        "processed_image": attempt.processedImage,
                        "skeleton_image": attempt.skeletonImage
                    },
                    "timestamp": attempt.submittedAt.isoformat()
                }
                
                # Add feature vector if available
                if attempt.featureVector:
                    sample["features"] = {
                        "geometric": {
                            "contour_area": attempt.featureVector.contourArea,
                            "aspect_ratio": attempt.featureVector.aspectRatio,
                            "bbox_width": attempt.featureVector.boundingBoxWidth,
                            "bbox_height": attempt.featureVector.boundingBoxHeight
                        },
                        "topological": {
                            "stroke_count": attempt.featureVector.strokeCount,
                            "loop_count": attempt.featureVector.loopCount,
                            "endpoint_count": attempt.featureVector.endpointCount
                        },
                        "vector": attempt.featureVector.featureVector
                    }
                
                json_data["samples"].append(sample)
            
            # Save JSON file
            with open(output_path, "w") as f:
                json.dump(json_data, f, indent=2)
            
            logger.info(f"✅ Exported {len(training_data)} records to JSON: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"❌ Failed to export JSON: {e}")
            raise
    
    async def _export_tensorflow(self, training_data: List, output_path: str) -> str:
        """Export dataset as TensorFlow TFRecord format."""
        try:
            import tensorflow as tf
            
            logger.info(f"Exporting {len(training_data)} samples to TensorFlow format...")
            
            # Create TFRecord writer
            with tf.io.TFRecordWriter(output_path) as writer:
                for attempt in training_data:
                    # Load images
                    user_image_path = self.storage_root / attempt.userDrawing
                    reference_image_path = self.storage_root / attempt.referenceImage
                    
                    if user_image_path.exists() and reference_image_path.exists():
                        # Read image files
                        user_image_bytes = user_image_path.read_bytes()
                        reference_image_bytes = reference_image_path.read_bytes()
                        
                        # Create feature dictionary
                        feature = {
                            'id': tf.train.Feature(bytes_list=tf.train.BytesList(value=[attempt.id.encode()])),
                            'character': tf.train.Feature(bytes_list=tf.train.BytesList(value=[attempt.character.encode()])),
                            'character_type': tf.train.Feature(bytes_list=tf.train.BytesList(value=[attempt.characterType.encode()])),
                            'user_image': tf.train.Feature(bytes_list=tf.train.BytesList(value=[user_image_bytes])),
                            'reference_image': tf.train.Feature(bytes_list=tf.train.BytesList(value=[reference_image_bytes])),
                            'final_score': tf.train.Feature(float_list=tf.train.FloatList(value=[attempt.finalScore])),
                            'is_correct': tf.train.Feature(int64_list=tf.train.Int64List(value=[int(attempt.isCorrect)])),
                            'quality_label': tf.train.Feature(bytes_list=tf.train.BytesList(value=[attempt.qualityLabel.encode()])),
                        }
                        
                        # Add feature vector if available
                        if attempt.featureVector and attempt.featureVector.featureVector:
                            feature['feature_vector'] = tf.train.Feature(
                                float_list=tf.train.FloatList(value=attempt.featureVector.featureVector)
                            )
                            
                            # Add individual features
                            feature.update({
                                'contour_area': tf.train.Feature(float_list=tf.train.FloatList(value=[attempt.featureVector.contourArea])),
                                'aspect_ratio': tf.train.Feature(float_list=tf.train.FloatList(value=[attempt.featureVector.aspectRatio])),
                                'stroke_count': tf.train.Feature(int64_list=tf.train.Int64List(value=[attempt.featureVector.strokeCount])),
                                'loop_count': tf.train.Feature(int64_list=tf.train.Int64List(value=[attempt.featureVector.loopCount])),
                                'complexity_score': tf.train.Feature(float_list=tf.train.FloatList(value=[attempt.featureVector.complexityScore])),
                            })
                        
                        # Create example and write to TFRecord
                        example = tf.train.Example(features=tf.train.Features(feature=feature))
                        writer.write(example.SerializeToString())
            
            logger.info(f"✅ TensorFlow export completed: {output_path}")
            return output_path
            
        except ImportError:
            logger.error("TensorFlow not installed. Install with: pip install tensorflow")
            raise
        except Exception as e:
            logger.error(f"❌ TensorFlow export failed: {e}")
            raise
    
    async def _export_pytorch(self, training_data: List, output_path: str) -> str:
        """Export dataset as PyTorch Dataset format."""
        try:
            import torch
            import pickle
            from pathlib import Path
            
            logger.info(f"Exporting {len(training_data)} samples to PyTorch format...")
            
            # Prepare data for PyTorch
            dataset = {
                'metadata': {
                    'total_samples': len(training_data),
                    'export_timestamp': datetime.now().isoformat(),
                    'format': 'pytorch_dataset',
                    'version': '1.0'
                },
                'samples': []
            }
            
            for attempt in training_data:
                # Load and process images
                user_image_path = self.storage_root / attempt.userDrawing
                reference_image_path = self.storage_root / attempt.referenceImage
                
                if user_image_path.exists() and reference_image_path.exists():
                    # Read images as tensors
                    import cv2
                    user_image = cv2.imread(str(user_image_path), cv2.IMREAD_GRAYSCALE)
                    reference_image = cv2.imread(str(reference_image_path), cv2.IMREAD_GRAYSCALE)
                    
                    # Convert to PyTorch tensors
                    user_tensor = torch.from_numpy(user_image).float() / 255.0
                    reference_tensor = torch.from_numpy(reference_image).float() / 255.0
                    
                    sample = {
                        'id': attempt.id,
                        'character': attempt.character,
                        'character_type': attempt.characterType,
                        'user_image': user_tensor,
                        'reference_image': reference_tensor,
                        'final_score': torch.tensor(attempt.finalScore),
                        'is_correct': torch.tensor(int(attempt.isCorrect)),
                        'quality_label': attempt.qualityLabel,
                        'submitted_at': attempt.submittedAt.isoformat()
                    }
                    
                    # Add feature vector if available
                    if attempt.featureVector and attempt.featureVector.featureVector:
                        sample['feature_vector'] = torch.tensor(attempt.featureVector.featureVector)
                        sample['geometric_features'] = {
                            'contour_area': torch.tensor(attempt.featureVector.contourArea),
                            'aspect_ratio': torch.tensor(attempt.featureVector.aspectRatio),
                            'bbox_width': torch.tensor(attempt.featureVector.boundingBoxWidth),
                            'bbox_height': torch.tensor(attempt.featureVector.boundingBoxHeight)
                        }
                        sample['topological_features'] = {
                            'stroke_count': torch.tensor(attempt.featureVector.strokeCount),
                            'loop_count': torch.tensor(attempt.featureVector.loopCount),
                            'endpoint_count': torch.tensor(attempt.featureVector.endpointCount),
                            'intersection_count': torch.tensor(attempt.featureVector.intersectionCount)
                        }
                    
                    dataset['samples'].append(sample)
            
            # Save as PyTorch pickle file
            with open(output_path, 'wb') as f:
                pickle.dump(dataset, f)
            
            logger.info(f"✅ PyTorch export completed: {output_path}")
            return output_path
            
        except ImportError:
            logger.error("PyTorch not installed. Install with: pip install torch")
            raise
        except Exception as e:
            logger.error(f"❌ PyTorch export failed: {e}")
            raise

# Global data collector instance
data_collector = DataCollector()