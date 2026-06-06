"""Generate and optionally upload canonical Umwero reference images from a catalog."""

import argparse
import json
from pathlib import Path

from main import _upload_reference_image
from src.font_renderer import FontRenderingService


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("catalog", type=Path, help="JSON array with characterId, fontInput, and metadata")
    parser.add_argument("--font", default="fonts/Umwero.ttf")
    parser.add_argument("--output-dir", type=Path, default=Path("generated-references"))
    parser.add_argument("--upload", action="store_true")
    args = parser.parse_args()

    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    renderer = FontRenderingService(args.font)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    results = []

    for entry in catalog:
        character_id = entry["characterId"]
        font_input = entry["fontInput"]
        image = renderer.render_character(font_input, 256)
        output_path = args.output_dir / f"{character_id}.png"
        image.save(output_path, format="PNG")
        image_url = (
            _upload_reference_image(image, f"characters/references/{character_id}.png")
            if args.upload
            else str(output_path)
        )
        results.append({**entry, "imageUrl": image_url})

    print(json.dumps(results, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
