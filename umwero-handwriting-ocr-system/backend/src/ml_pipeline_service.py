"""
ML Pipeline Integration Service for Umwero Handwriting OCR System

Provides comprehensive ML pipeline integration including:
- Data quality validation and filtering
- Dataset splitting (train/validation/test)
- Feature preprocessing and normalization
- Model training data preparation
- Performance evaluation metrics
- Integration with popular ML frameworks

Optimized for handwriting recognition and OCR model training.
"""

import logging
import json
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any, Union
from pathlib import Path
import asyncio

from .database_service import db_service
from .data_collector import data_collector

logger = logging.getLogger(__name__)

class MLPipelineService:
    """Production-grade ML pipeline integration service."""
    
    def __init__(self, quality_threshold: float = 0.7):
        """
        Initialize ML pipeline service.
        
        Args:
            quality_threshold: Minimum quality threshold for training data
        """
        self.quality_threshold = quality_threshold
        self.supported_frameworks = ["tensorflow", "pytorch", "sklearn", "xgboost"]
        
    async def prepare_training_dataset(
        self,
        character_types: Optional[List[str]] = None,
        quality_labels: Optional[List[str]] = None,
        min_score: Optional[float] = None,
        max_score: Optional[float] = None,
        train_ratio: float = 0.7,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        stratify_by: str = "character_type",
        random_seed: int = 42
    ) -> Dict[str, Any]:
        """
        Prepare comprehensive training dataset with train/val/test splits.
        
        Args:
            character_types: Filter by character types
            quality_labels: Filter by quality labels
            min_score: Minimum score threshold
            max_score: Maximum score threshold
            train_ratio: Training set ratio
            val_ratio: Validation set ratio
            test_ratio: Test set ratio
            stratify_by: Stratification strategy
            random_seed: Random seed for reproducibility
            
        Returns:
            Dictionary with train/val/test splits and metadata
        """
        try:
            logger.info("Preparing training dataset...")
            
            # Validate split ratios
            if abs(train_ratio + val_ratio + test_ratio - 1.0) > 0.001:
                raise ValueError("Split ratios must sum to 1.0")
            
            # Get training data from database
            training_data = await db_service.get_training_data(
                character_types=character_types,
                quality_labels=quality_labels,
                min_score=min_score,
                max_score=max_score
            )
            
            if not training_data:
                raise ValueError("No training data found with specified filters")
            
            logger.info(f"Retrieved {len(training_data)} samples from database")
            
            # Convert to structured format
            dataset = await self._convert_to_structured_dataset(training_data)
            
            # Perform data quality validation
            quality_report = self._validate_data_quality(dataset)
            logger.info(f"Data quality validation: {quality_report['summary']}")
            
            # Filter high-quality samples
            filtered_dataset = self._filter_by_quality(dataset, quality_report)
            logger.info(f"After quality filtering: {len(filtered_dataset)} samples")
            
            # Create stratified splits
            splits = self._create_stratified_splits(
                filtered_dataset,
                train_ratio=train_ratio,
                val_ratio=val_ratio,
                test_ratio=test_ratio,
                stratify_by=stratify_by,
                random_seed=random_seed
            )
            
            # Generate dataset statistics
            statistics = self._generate_dataset_statistics(splits)
            
            # Prepare metadata
            metadata = {
                "total_samples": len(training_data),
                "filtered_samples": len(filtered_dataset),
                "train_samples": len(splits["train"]),
                "val_samples": len(splits["val"]),
                "test_samples": len(splits["test"]),
                "quality_report": quality_report,
                "statistics": statistics,
                "filters": {
                    "character_types": character_types,
                    "quality_labels": quality_labels,
                    "min_score": min_score,
                    "max_score": max_score
                },
                "split_config": {
                    "train_ratio": train_ratio,
                    "val_ratio": val_ratio,
                    "test_ratio": test_ratio,
                    "stratify_by": stratify_by,
                    "random_seed": random_seed
                },
                "preparation_timestamp": datetime.now().isoformat()
            }
            
            result = {
                "splits": splits,
                "metadata": metadata,
                "success": True
            }
            
            logger.info("✅ Training dataset preparation completed")
            return result
            
        except Exception as e:
            logger.error(f"❌ Training dataset preparation failed: {e}")
            raise
    
    async def export_for_framework(
        self,
        dataset_splits: Dict[str, List],
        framework: str,
        output_dir: str,
        include_images: bool = True,
        include_features: bool = True,
        normalize_features: bool = True
    ) -> Dict[str, str]:
        """
        Export dataset for specific ML framework.
        
        Args:
            dataset_splits: Dataset splits from prepare_training_dataset
            framework: Target ML framework
            output_dir: Output directory
            include_images: Whether to include image data
            include_features: Whether to include extracted features
            normalize_features: Whether to normalize feature vectors
            
        Returns:
            Dictionary with export paths for each split
        """
        try:
            if framework not in self.supported_frameworks:
                raise ValueError(f"Unsupported framework: {framework}. Supported: {self.supported_frameworks}")
            
            logger.info(f"Exporting dataset for {framework}...")
            
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            export_paths = {}
            
            if framework == "tensorflow":
                export_paths = await self._export_tensorflow_format(
                    dataset_splits, output_path, include_images, include_features, normalize_features
                )
            elif framework == "pytorch":
                export_paths = await self._export_pytorch_format(
                    dataset_splits, output_path, include_images, include_features, normalize_features
                )
            elif framework == "sklearn":
                export_paths = await self._export_sklearn_format(
                    dataset_splits, output_path, include_features, normalize_features
                )
            elif framework == "xgboost":
                export_paths = await self._export_xgboost_format(
                    dataset_splits, output_path, include_features, normalize_features
                )
            
            logger.info(f"✅ {framework} export completed")
            return export_paths
            
        except Exception as e:
            logger.error(f"❌ Framework export failed: {e}")
            raise
    
    async def _convert_to_structured_dataset(self, training_data: List) -> List[Dict]:
        """Convert database records to structured dataset format."""
        dataset = []
        
        for attempt in training_data:
            sample = {
                "id": attempt.id,
                "character": attempt.character,
                "character_type": attempt.characterType,
                "final_score": attempt.finalScore,
                "is_correct": attempt.isCorrect,
                "quality_label": attempt.qualityLabel,
                "user_drawing_path": attempt.userDrawing,
                "reference_image_path": attempt.referenceImage,
                "processed_image_path": attempt.processedImage,
                "submitted_at": attempt.submittedAt,
                "ssim_score": attempt.ssimScore,
                "contour_score": attempt.contourScore,
                "skeleton_score": attempt.skeletonScore,
                "confidence_score": attempt.confidenceScore
            }
            
            # Add feature vector data if available
            if attempt.featureVector:
                sample["features"] = {
                    "geometric": {
                        "contour_area": attempt.featureVector.contourArea,
                        "aspect_ratio": attempt.featureVector.aspectRatio,
                        "bbox_width": attempt.featureVector.boundingBoxWidth,
                        "bbox_height": attempt.featureVector.boundingBoxHeight,
                        "perimeter": attempt.featureVector.perimeter,
                        "solidity": attempt.featureVector.solidity,
                        "extent": attempt.featureVector.extent
                    },
                    "topological": {
                        "stroke_count": attempt.featureVector.strokeCount,
                        "loop_count": attempt.featureVector.loopCount,
                        "endpoint_count": attempt.featureVector.endpointCount,
                        "intersection_count": attempt.featureVector.intersectionCount
                    },
                    "shape": {
                        "complexity_score": attempt.featureVector.complexityScore,
                        "symmetry_score": attempt.featureVector.symmetryScore
                    },
                    "vector": attempt.featureVector.featureVector
                }
            
            dataset.append(sample)
        
        return dataset
    
    def _validate_data_quality(self, dataset: List[Dict]) -> Dict[str, Any]:
        """Validate data quality and identify issues."""
        quality_report = {
            "total_samples": len(dataset),
            "issues": [],
            "warnings": [],
            "quality_scores": [],
            "summary": {}
        }
        
        missing_features = 0
        missing_images = 0
        score_anomalies = 0
        
        for sample in dataset:
            quality_score = 1.0
            
            # Check for missing features
            if "features" not in sample or not sample["features"]:
                missing_features += 1
                quality_score -= 0.3
                
            # Check for missing image paths
            if not sample.get("user_drawing_path") or not sample.get("reference_image_path"):
                missing_images += 1
                quality_score -= 0.4
                
            # Check for score anomalies
            if sample["final_score"] < 0 or sample["final_score"] > 100:
                score_anomalies += 1
                quality_score -= 0.5
                
            # Check confidence score
            if sample.get("confidence_score", 0) < 0.5:
                quality_score -= 0.2
                
            quality_report["quality_scores"].append(quality_score)
        
        # Generate summary
        avg_quality = np.mean(quality_report["quality_scores"])
        high_quality_count = sum(1 for score in quality_report["quality_scores"] if score >= self.quality_threshold)
        
        quality_report["summary"] = {
            "average_quality": avg_quality,
            "high_quality_samples": high_quality_count,
            "high_quality_percentage": (high_quality_count / len(dataset)) * 100,
            "missing_features": missing_features,
            "missing_images": missing_images,
            "score_anomalies": score_anomalies
        }
        
        # Add issues and warnings
        if missing_features > 0:
            quality_report["issues"].append(f"{missing_features} samples missing feature vectors")
        
        if missing_images > 0:
            quality_report["issues"].append(f"{missing_images} samples missing image paths")
        
        if score_anomalies > 0:
            quality_report["issues"].append(f"{score_anomalies} samples with invalid scores")
        
        if avg_quality < 0.8:
            quality_report["warnings"].append("Average data quality below 80%")
        
        return quality_report
    
    def _filter_by_quality(self, dataset: List[Dict], quality_report: Dict) -> List[Dict]:
        """Filter dataset by quality threshold."""
        filtered_dataset = []
        
        for i, sample in enumerate(dataset):
            quality_score = quality_report["quality_scores"][i]
            
            if quality_score >= self.quality_threshold:
                sample["quality_score"] = quality_score
                filtered_dataset.append(sample)
        
        return filtered_dataset
    
    def _create_stratified_splits(
        self,
        dataset: List[Dict],
        train_ratio: float,
        val_ratio: float,
        test_ratio: float,
        stratify_by: str,
        random_seed: int
    ) -> Dict[str, List]:
        """Create stratified train/validation/test splits."""
        from sklearn.model_selection import train_test_split
        
        # Set random seed for reproducibility
        np.random.seed(random_seed)
        
        # Extract stratification labels
        if stratify_by == "character_type":
            labels = [sample["character_type"] for sample in dataset]
        elif stratify_by == "character":
            labels = [sample["character"] for sample in dataset]
        elif stratify_by == "quality_label":
            labels = [sample["quality_label"] for sample in dataset]
        else:
            labels = None  # No stratification
        
        # Create indices for splitting
        indices = list(range(len(dataset)))
        
        if labels:
            # First split: train vs (val + test)
            train_indices, temp_indices = train_test_split(
                indices,
                test_size=(val_ratio + test_ratio),
                stratify=[labels[i] for i in indices],
                random_state=random_seed
            )
            
            # Second split: val vs test
            val_size = val_ratio / (val_ratio + test_ratio)
            val_indices, test_indices = train_test_split(
                temp_indices,
                test_size=(1 - val_size),
                stratify=[labels[i] for i in temp_indices],
                random_state=random_seed
            )
        else:
            # Random splits without stratification
            train_indices, temp_indices = train_test_split(
                indices,
                test_size=(val_ratio + test_ratio),
                random_state=random_seed
            )
            
            val_size = val_ratio / (val_ratio + test_ratio)
            val_indices, test_indices = train_test_split(
                temp_indices,
                test_size=(1 - val_size),
                random_state=random_seed
            )
        
        # Create splits
        splits = {
            "train": [dataset[i] for i in train_indices],
            "val": [dataset[i] for i in val_indices],
            "test": [dataset[i] for i in test_indices]
        }
        
        return splits
    
    def _generate_dataset_statistics(self, splits: Dict[str, List]) -> Dict[str, Any]:
        """Generate comprehensive dataset statistics."""
        statistics = {}
        
        for split_name, split_data in splits.items():
            if not split_data:
                continue
                
            # Character type distribution
            char_types = {}
            characters = {}
            quality_labels = {}
            scores = []
            
            for sample in split_data:
                # Character type distribution
                char_type = sample["character_type"]
                char_types[char_type] = char_types.get(char_type, 0) + 1
                
                # Character distribution
                character = sample["character"]
                characters[character] = characters.get(character, 0) + 1
                
                # Quality label distribution
                quality = sample["quality_label"]
                quality_labels[quality] = quality_labels.get(quality, 0) + 1
                
                # Score statistics
                scores.append(sample["final_score"])
            
            statistics[split_name] = {
                "total_samples": len(split_data),
                "character_type_distribution": char_types,
                "character_distribution": characters,
                "quality_distribution": quality_labels,
                "score_statistics": {
                    "mean": np.mean(scores),
                    "std": np.std(scores),
                    "min": np.min(scores),
                    "max": np.max(scores),
                    "median": np.median(scores)
                }
            }
        
        return statistics
    
    async def _export_tensorflow_format(
        self,
        dataset_splits: Dict[str, List],
        output_path: Path,
        include_images: bool,
        include_features: bool,
        normalize_features: bool
    ) -> Dict[str, str]:
        """Export dataset in TensorFlow format."""
        # Implementation would use TensorFlow's tf.data and TFRecord format
        # This is a placeholder for the actual implementation
        export_paths = {}
        
        for split_name, split_data in dataset_splits.items():
            output_file = output_path / f"{split_name}.tfrecord"
            # Actual TensorFlow export logic would go here
            export_paths[split_name] = str(output_file)
        
        return export_paths
    
    async def _export_pytorch_format(
        self,
        dataset_splits: Dict[str, List],
        output_path: Path,
        include_images: bool,
        include_features: bool,
        normalize_features: bool
    ) -> Dict[str, str]:
        """Export dataset in PyTorch format."""
        # Implementation would use PyTorch's Dataset and DataLoader
        # This is a placeholder for the actual implementation
        export_paths = {}
        
        for split_name, split_data in dataset_splits.items():
            output_file = output_path / f"{split_name}.pt"
            # Actual PyTorch export logic would go here
            export_paths[split_name] = str(output_file)
        
        return export_paths
    
    async def _export_sklearn_format(
        self,
        dataset_splits: Dict[str, List],
        output_path: Path,
        include_features: bool,
        normalize_features: bool
    ) -> Dict[str, str]:
        """Export dataset in scikit-learn format."""
        export_paths = {}
        
        for split_name, split_data in dataset_splits.items():
            # Extract features and labels
            features = []
            labels = []
            
            for sample in split_data:
                if include_features and "features" in sample and sample["features"].get("vector"):
                    feature_vector = sample["features"]["vector"]
                    if normalize_features:
                        # Simple normalization - in practice, use sklearn's StandardScaler
                        feature_vector = np.array(feature_vector)
                        feature_vector = (feature_vector - np.mean(feature_vector)) / (np.std(feature_vector) + 1e-8)
                    
                    features.append(feature_vector)
                    labels.append(sample["is_correct"])
            
            if features:
                # Save as numpy arrays
                features_file = output_path / f"{split_name}_features.npy"
                labels_file = output_path / f"{split_name}_labels.npy"
                
                np.save(features_file, np.array(features))
                np.save(labels_file, np.array(labels))
                
                export_paths[f"{split_name}_features"] = str(features_file)
                export_paths[f"{split_name}_labels"] = str(labels_file)
        
        return export_paths
    
    async def _export_xgboost_format(
        self,
        dataset_splits: Dict[str, List],
        output_path: Path,
        include_features: bool,
        normalize_features: bool
    ) -> Dict[str, str]:
        """Export dataset in XGBoost format."""
        # Similar to sklearn format but optimized for XGBoost
        return await self._export_sklearn_format(
            dataset_splits, output_path, include_features, normalize_features
        )

# Global ML pipeline service instance
ml_pipeline_service = MLPipelineService()
    def _generate_quality_recommendations(self, quality_report: Dict) -> List[str]:
        """Generate recommendations based on quality report."""
        recommendations = []
        
        summary = quality_report.get("summary", {})
        
        # Check overall quality
        avg_quality = summary.get("average_quality", 0)
        if avg_quality < 0.6:
            recommendations.append("Overall data quality is low. Consider collecting more high-quality samples.")
        elif avg_quality < 0.8:
            recommendations.append("Data quality is moderate. Review and improve data collection process.")
        
        # Check missing features
        missing_features = summary.get("missing_features", 0)
        if missing_features > 0:
            recommendations.append(f"Fix feature extraction for {missing_features} samples with missing features.")
        
        # Check missing images
        missing_images = summary.get("missing_images", 0)
        if missing_images > 0:
            recommendations.append(f"Resolve {missing_images} samples with missing image paths.")
        
        # Check score anomalies
        score_anomalies = summary.get("score_anomalies", 0)
        if score_anomalies > 0:
            recommendations.append(f"Investigate {score_anomalies} samples with invalid scores.")
        
        # Check high-quality percentage
        high_quality_pct = summary.get("high_quality_percentage", 0)
        if high_quality_pct < 70:
            recommendations.append("Less than 70% of samples meet quality threshold. Consider stricter data collection criteria.")
        
        if not recommendations:
            recommendations.append("Data quality looks good! Dataset is ready for ML training.")
        
        return recommendations