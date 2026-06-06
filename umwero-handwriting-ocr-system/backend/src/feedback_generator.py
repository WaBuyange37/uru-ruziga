"""
Production-grade feedback generator for Umwero handwriting evaluation.

Produces specific, actionable feedback — never vague messages like "Looks bad."

Response shape (mirrors the required API contract):
  {
    "strengths": ["..."],
    "issues":    ["..."],
    "tips":      ["..."]
  }
"""

import logging
from typing import List, Tuple, Optional
from dataclasses import dataclass
import numpy as np

from .image_processor import ProcessedImage
from .comparison_algorithm import ComparisonResult, SkeletonAnalysis

logger = logging.getLogger(__name__)


# ─── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class FeedbackItem:
    """Single feedback item (kept for backward-compat with evaluation_engine)."""
    category: str
    severity: str
    message: str
    suggestion: str
    confidence: float

    def __post_init__(self):
        self.confidence = max(0.0, min(1.0, self.confidence))


@dataclass
class FeedbackReport:
    """Complete feedback report returned by generate_feedback()."""
    score: float
    passed: bool
    # Flat list used by evaluation_engine.py
    primary_feedback: List[str]
    detailed_feedback: List[FeedbackItem]
    positive_aspects: List[str]
    improvement_priority: List[str]
    # Structured dict for the new /api/evaluate endpoint
    structured: dict
    # Convenience alias used by data_collector
    summary: str
    encouragement: str
    practice_areas: List[str]


@dataclass
class FeedbackConfig:
    """Configuration for feedback generation."""
    min_confidence_threshold: float = 0.55
    max_feedback_items: int = 6
    include_positive_feedback: bool = True
    pass_mark: float = 70.0


# ─── Thresholds ───────────────────────────────────────────────────────────────

_EXCELLENT = 90.0
_GOOD      = 70.0
_FAIR      = 50.0


# ─── Main class ───────────────────────────────────────────────────────────────

class FeedbackGenerator:
    """
    Generates specific, actionable feedback from comparison results.

    All messages are concrete and character-aware — no generic "try again" text.
    """

    def __init__(self, feedback_config: FeedbackConfig = None):
        self.config = feedback_config or FeedbackConfig()
        logger.info("FeedbackGenerator initialised (production mode)")

    # ── Public API ────────────────────────────────────────────────────────────

    def generate_feedback(
        self,
        comparison_result: ComparisonResult,
        processed_images: Tuple[ProcessedImage, ProcessedImage],
        character: str = "",
    ) -> FeedbackReport:
        """
        Generate a complete FeedbackReport from comparison results.

        Args:
            comparison_result: Output of HybridComparisonAlgorithm.compare_images()
            processed_images:  (reference, user_drawing) ProcessedImage tuple
            character:         The character being evaluated (e.g. "K")

        Returns:
            FeedbackReport with structured feedback for the API response.
        """
        try:
            reference_img, user_img = processed_images
            score = comparison_result.final_score
            char_label = f'"{character}"' if character else "this character"

            strengths: List[str] = []
            issues:    List[str] = []
            tips:      List[str] = []
            items:     List[FeedbackItem] = []

            # ── 1. SSIM — overall pixel-level structure ────────────────────
            ssim = comparison_result.ssim_score
            if ssim >= 0.80:
                strengths.append("Overall shape structure closely matches the reference.")
            elif ssim >= 0.60:
                issues.append(
                    f"The overall shape of {char_label} differs from the reference — "
                    "some areas are misaligned or missing."
                )
                tips.append(
                    "Trace the reference character slowly, paying attention to where "
                    "each stroke starts and ends."
                )
            else:
                issues.append(
                    f"The shape of {char_label} is significantly different from the reference. "
                    "Focus on reproducing the basic outline before adding detail."
                )
                tips.append(
                    "Start by drawing just the main body of the character without "
                    "worrying about fine details."
                )

            # ── 2. Contour — outline and proportions ──────────────────────
            contour = comparison_result.contour_score
            if contour >= 0.80:
                strengths.append("Stroke proportions and outline are accurate.")
            elif contour >= 0.55:
                issues.append(
                    "The outline proportions of your character differ from the reference — "
                    "check the width-to-height ratio."
                )
                tips.append(
                    "Compare the bounding box of your drawing to the reference: "
                    "is it too wide, too narrow, or too tall?"
                )
            else:
                issues.append(
                    "The character outline is quite different from the reference. "
                    "The curves or angles may be incorrect."
                )
                tips.append(
                    "Focus on the dominant curves and angles of the character. "
                    "Use the stroke guide to see the correct shape."
                )

            # ── 3. Skeleton — stroke topology ─────────────────────────────
            skeleton = comparison_result.skeleton_score
            if skeleton >= 0.80:
                strengths.append("Stroke connectivity and topology are correct.")
            elif skeleton >= 0.55:
                issues.append(
                    "Some strokes are not connected where they should be, "
                    "or extra strokes are present."
                )
                tips.append(
                    "Make sure each stroke meets cleanly at junction points — "
                    "avoid gaps or overlapping lines."
                )
            else:
                issues.append(
                    "The stroke structure is quite different from the reference. "
                    "Check whether all required strokes are present and connected."
                )
                tips.append(
                    "Count the number of strokes in the reference and match that "
                    "in your drawing before refining the shape."
                )

            # ── 4. Stroke direction ────────────────────────────────────────
            stroke_dir = getattr(comparison_result, "stroke_direction_score", None)
            if stroke_dir is not None:
                if stroke_dir >= 0.80:
                    strengths.append("Stroke angles and directions are well-matched.")
                elif stroke_dir >= 0.55:
                    issues.append(
                        "The angle of one or more strokes differs from the reference — "
                        "the top stroke angle may be off."
                    )
                    tips.append(
                        "Pay attention to the direction each stroke travels: "
                        "diagonal strokes should match the reference angle."
                    )
                else:
                    issues.append(
                        "Stroke directions are significantly different from the reference. "
                        "Several strokes appear to be drawn at the wrong angle."
                    )
                    tips.append(
                        "Use the stroke-order guide to see the exact direction "
                        "each stroke should travel."
                    )

            # ── 5. Shape alignment ────────────────────────────────────────
            shape_align = getattr(comparison_result, "shape_alignment_score", None)
            if shape_align is not None:
                if shape_align >= 0.80:
                    strengths.append("Character is well-centred and spatially aligned.")
                elif shape_align >= 0.55:
                    issues.append(
                        "The character is slightly off-centre or shifted — "
                        "try to centre it within the drawing area."
                    )
                    tips.append(
                        "Draw the character in the middle of the canvas, "
                        "leaving roughly equal space on all sides."
                    )
                else:
                    issues.append(
                        "The character is noticeably shifted or misaligned compared "
                        "to the reference position."
                    )
                    tips.append(
                        "Centre your drawing: the character should occupy the middle "
                        "of the canvas, not be pushed to one side."
                    )

            # ── 6. Positioning check (bounding-box centre distance) ────────
            try:
                ref_cx = reference_img.bounding_box[0] + reference_img.bounding_box[2] / 2
                ref_cy = reference_img.bounding_box[1] + reference_img.bounding_box[3] / 2
                usr_cx = user_img.bounding_box[0] + user_img.bounding_box[2] / 2
                usr_cy = user_img.bounding_box[1] + user_img.bounding_box[3] / 2
                dist = np.sqrt((ref_cx - usr_cx) ** 2 + (ref_cy - usr_cy) ** 2)
                if dist > 40:  # pixels in 256×256 space
                    direction = ""
                    if usr_cx < ref_cx - 20:
                        direction = "left"
                    elif usr_cx > ref_cx + 20:
                        direction = "right"
                    if usr_cy < ref_cy - 20:
                        direction += (" and upward" if direction else "upward")
                    elif usr_cy > ref_cy + 20:
                        direction += (" and downward" if direction else "downward")
                    if direction:
                        issues.append(
                            f"Your character is shifted {direction} relative to the reference."
                        )
                        tips.append(
                            "Centre the character on the canvas — "
                            "the reference sits in the middle of the drawing area."
                        )
            except Exception:
                pass  # Non-critical

            # ── 7. Size check ─────────────────────────────────────────────
            try:
                ref_area = reference_img.bounding_box[2] * reference_img.bounding_box[3]
                usr_area = user_img.bounding_box[2] * user_img.bounding_box[3]
                if ref_area > 0 and usr_area > 0:
                    ratio = usr_area / ref_area
                    if ratio < 0.45:
                        issues.append(
                            "Your character is drawn too small — "
                            "it should fill more of the canvas."
                        )
                        tips.append(
                            "Draw larger strokes so the character occupies at least "
                            "half the available drawing area."
                        )
                    elif ratio > 2.2:
                        issues.append(
                            "Your character is drawn too large — "
                            "some strokes may be cut off at the edges."
                        )
                        tips.append(
                            "Scale down your drawing so the entire character fits "
                            "comfortably within the canvas."
                        )
            except Exception:
                pass

            # ── 8. Score-level summary ────────────────────────────────────
            if score >= _EXCELLENT:
                summary = (
                    f"Excellent work on {char_label}! "
                    "Your handwriting is very close to the reference."
                )
                encouragement = "Keep it up — you're mastering this character!"
            elif score >= _GOOD:
                summary = (
                    f"Good job on {char_label}. "
                    "Your character is recognisable with a few areas to refine."
                )
                encouragement = "You're on the right track — a little more practice will perfect it."
            elif score >= _FAIR:
                summary = (
                    f"You're making progress on {char_label}. "
                    "Focus on the specific issues below to improve your score."
                )
                encouragement = "Every attempt builds muscle memory — keep practising!"
            else:
                summary = (
                    f"Your drawing of {char_label} needs more work. "
                    "Review the stroke guide and try again."
                )
                encouragement = (
                    "Don't be discouraged — even small improvements count. "
                    "Use the stroke guide to understand the correct form."
                )

            # ── 9. Practice areas ─────────────────────────────────────────
            practice_areas: List[str] = []
            if ssim < 0.60:
                practice_areas.append("overall shape")
            if contour < 0.60:
                practice_areas.append("proportions and outline")
            if skeleton < 0.60:
                practice_areas.append("stroke connectivity")
            if stroke_dir is not None and stroke_dir < 0.60:
                practice_areas.append("stroke direction")
            if shape_align is not None and shape_align < 0.60:
                practice_areas.append("character alignment")

            # ── 10. Build FeedbackItem list (backward-compat) ─────────────
            for msg in issues:
                items.append(FeedbackItem(
                    category="structure",
                    severity="major",
                    message=msg,
                    suggestion=tips[issues.index(msg)] if issues.index(msg) < len(tips) else "",
                    confidence=0.85,
                ))
            for msg in strengths:
                items.append(FeedbackItem(
                    category="positive",
                    severity="positive",
                    message=msg,
                    suggestion="",
                    confidence=0.90,
                ))

            # Primary feedback list (flat, for evaluation_engine)
            primary: List[str] = [summary] + issues[:2]

            structured = {
                "strengths": strengths,
                "issues":    issues,
                "tips":      tips,
            }

            return FeedbackReport(
                score=score,
                passed=score >= self.config.pass_mark,
                primary_feedback=primary,
                detailed_feedback=items,
                positive_aspects=strengths,
                improvement_priority=tips[:3],
                structured=structured,
                summary=summary,
                encouragement=encouragement,
                practice_areas=practice_areas,
            )

        except Exception as exc:
            logger.error(f"FeedbackGenerator failed: {exc}")
            return FeedbackReport(
                score=comparison_result.final_score,
                passed=comparison_result.final_score >= self.config.pass_mark,
                primary_feedback=["Unable to generate detailed feedback — please try again."],
                detailed_feedback=[],
                positive_aspects=[],
                improvement_priority=[],
                structured={"strengths": [], "issues": [], "tips": []},
                summary="Evaluation completed.",
                encouragement="Keep practising!",
                practice_areas=[],
            )


# ── Standalone test ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("FeedbackGenerator (production) initialised successfully.")
