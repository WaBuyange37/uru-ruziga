"""
Stroke Direction and Shape Alignment Analyzer

Computes two new metrics required by the production evaluation pipeline:
  - stroke_direction_score  (0-1): how well the dominant stroke angles match
  - shape_alignment_score   (0-1): how well the spatial mass distribution aligns

These are pure-numpy / OpenCV computations — no external ML dependencies.
"""

import logging
from typing import Tuple
import numpy as np
import cv2

logger = logging.getLogger(__name__)


# ─── Stroke Direction ─────────────────────────────────────────────────────────

def _gradient_orientation_histogram(binary: np.ndarray, bins: int = 18) -> np.ndarray:
    """
    Build a histogram of gradient orientations (0-180°) from a binary image.
    Uses Sobel derivatives so it works on any binary image without needing
    raw stroke data.
    """
    # Compute Sobel gradients
    gx = cv2.Sobel(binary.astype(np.float32), cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(binary.astype(np.float32), cv2.CV_32F, 0, 1, ksize=3)

    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    angle = np.arctan2(gy, gx) * 180.0 / np.pi  # -180 to 180
    angle = angle % 180.0                          # fold to 0-180 (unsigned)

    # Weight histogram by gradient magnitude so strong edges count more
    hist, _ = np.histogram(
        angle[magnitude > 5],          # ignore near-zero gradients
        bins=bins,
        range=(0, 180),
        weights=magnitude[magnitude > 5],
    )

    total = hist.sum()
    if total > 0:
        hist = hist / total
    return hist


def compute_stroke_direction_score(ref_binary: np.ndarray, user_binary: np.ndarray) -> float:
    """
    Compare dominant stroke directions between reference and user drawing.

    Returns a similarity score in [0, 1].
    Uses histogram intersection — a standard, fast similarity measure.
    """
    try:
        hist_ref  = _gradient_orientation_histogram(ref_binary)
        hist_user = _gradient_orientation_histogram(user_binary)

        # Histogram intersection: sum of min values
        intersection = np.minimum(hist_ref, hist_user).sum()
        # Normalise by the smaller histogram sum (both are already normalised to 1)
        score = float(np.clip(intersection, 0.0, 1.0))
        return score

    except Exception as exc:
        logger.warning(f"stroke_direction_score failed: {exc}")
        return 0.0


# ─── Shape Alignment ──────────────────────────────────────────────────────────

def _spatial_mass_grid(binary: np.ndarray, grid: int = 4) -> np.ndarray:
    """
    Divide the image into a grid×grid grid and compute the fraction of
    foreground pixels in each cell.  Returns a normalised flat vector.
    """
    h, w = binary.shape
    cell_h = h // grid
    cell_w = w // grid
    cells = []

    for r in range(grid):
        for c in range(grid):
            y0, y1 = r * cell_h, (r + 1) * cell_h
            x0, x1 = c * cell_w, (c + 1) * cell_w
            cell = binary[y0:y1, x0:x1]
            cells.append(float(np.sum(cell > 0)) / max(cell.size, 1))

    vec = np.array(cells, dtype=np.float32)
    norm = vec.sum()
    if norm > 0:
        vec /= norm
    return vec


def compute_shape_alignment_score(ref_binary: np.ndarray, user_binary: np.ndarray) -> float:
    """
    Compare spatial mass distribution between reference and user drawing.

    A 4×4 grid captures coarse spatial layout without being sensitive to
    pixel-level noise.  Returns cosine similarity in [0, 1].
    """
    try:
        vec_ref  = _spatial_mass_grid(ref_binary)
        vec_user = _spatial_mass_grid(user_binary)

        # Cosine similarity
        dot   = float(np.dot(vec_ref, vec_user))
        norm  = float(np.linalg.norm(vec_ref) * np.linalg.norm(vec_user))
        if norm < 1e-9:
            return 0.0

        score = float(np.clip(dot / norm, 0.0, 1.0))
        return score

    except Exception as exc:
        logger.warning(f"shape_alignment_score failed: {exc}")
        return 0.0
