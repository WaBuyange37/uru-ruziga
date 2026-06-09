import base64
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from src.comparison_algorithm import HybridComparisonAlgorithm
from src.font_renderer import FontRenderingService
from src.image_processor import ImageProcessingPipeline


def _services():
    renderer = FontRenderingService("fonts/Umwero.ttf")
    processor = ImageProcessingPipeline()
    algorithm = HybridComparisonAlgorithm()
    return renderer, processor, algorithm


def test_renders_single_and_compound_font_inputs():
    renderer, _, _ = _services()

    assert renderer.render_character('"', 256).getbbox() is not None
    assert renderer.render_character("BBG", 256).getbbox() is not None


def test_wrong_a_is_below_60_and_close_a_is_above_80():
    renderer, processor, algorithm = _services()
    reference = renderer.render_character('"', 256)
    close = reference.filter(ImageFilter.GaussianBlur(0.35))
    wrong = Image.new("L", (256, 256), 0)
    ImageDraw.Draw(wrong).line((30, 220, 220, 30), fill=255, width=8)

    reference_processed = processor.preprocess_image(reference)
    close_result = algorithm.compare_images(reference_processed, processor.preprocess_image(close))
    wrong_result = algorithm.compare_images(reference_processed, processor.preprocess_image(wrong))

    assert close_result.final_score > 80
    assert wrong_result.final_score <= 60


def test_svg_reference_is_rasterized_and_scores_like_rendered_a():
    renderer, processor, algorithm = _services()
    svg_bytes = Path("umwero_character_images/U+0022_quotedbl.svg").read_bytes()
    svg_data_url = f"data:image/svg+xml;base64,{base64.b64encode(svg_bytes).decode()}"
    reference = processor.preprocess_image(svg_data_url)
    identical = algorithm.compare_images(reference, processor.preprocess_image(svg_data_url))
    close = algorithm.compare_images(
        reference,
        processor.preprocess_image(renderer.render_character('"', 256).filter(ImageFilter.GaussianBlur(0.35))),
    )
    wrong = Image.new("RGB", (256, 256), "white")
    ImageDraw.Draw(wrong).line((30, 220, 220, 30), fill="black", width=8)
    wrong_result = algorithm.compare_images(reference, processor.preprocess_image(wrong))

    assert identical.final_score >= 95
    assert close.final_score > 80
    assert wrong_result.final_score < 60


def test_extra_or_missing_strokes_reduce_score():
    renderer, processor, algorithm = _services()
    reference = renderer.render_character('"', 256)
    result = algorithm.compare_images(
        processor.preprocess_image(reference),
        processor.preprocess_image(reference),
    )
    result = algorithm.apply_stroke_evidence(
        result,
        user_strokes=[{"points": [{"x": 0, "y": 0}, {"x": 100, "y": 100}]}],
        expected_stroke_count=3,
    )

    assert result.final_score < 100
    assert result.processing_metadata["stroke_evidence"]["stroke_count_difference"] == 2
