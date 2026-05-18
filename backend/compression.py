import os
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image

MAX_IMAGE_WIDTH = 1920
MAX_IMAGE_HEIGHT = 1080
THUMBNAIL_SIZE = (300, 200)
JPEG_QUALITY = 85
WEBP_QUALITY = 80
THUMB_QUALITY = 60
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"}


def compress_image(input_path: str, output_path: Optional[str] = None) -> Tuple[Optional[str], int, float]:
    if output_path is None:
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_optimized.webp")

    try:
        img = Image.open(input_path)
        original_size = os.path.getsize(input_path)

        if img.mode == "RGBA":
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode == "P":
            img = img.convert("RGB")

        if img.width > MAX_IMAGE_WIDTH or img.height > MAX_IMAGE_HEIGHT:
            img.thumbnail((MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT), Image.LANCZOS)

        _ensure_dir(output_path)
        img.save(output_path, "WEBP", quality=WEBP_QUALITY, optimize=True)
        compressed_size = os.path.getsize(output_path)
        ratio = compressed_size / original_size if original_size > 0 else 1.0

        return output_path, compressed_size, ratio
    except Exception:
        return None, 0, 1.0


def generate_thumbnail(input_path: str, output_path: Optional[str] = None) -> Optional[str]:
    if output_path is None:
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_thumb.webp")

    try:
        img = Image.open(input_path)

        if img.mode == "RGBA":
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode == "P":
            img = img.convert("RGB")

        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

        _ensure_dir(output_path)
        img.save(output_path, "WEBP", quality=THUMB_QUALITY, optimize=True)
        return output_path
    except Exception:
        return None


def compress_pdf(input_path: str, output_path: Optional[str] = None) -> Tuple[Optional[str], int, float]:
    original_size = os.path.getsize(input_path)

    if output_path is None:
        p = Path(input_path)
        output_path = str(p.parent / f"{p.stem}_optimized.pdf")

    try:
        import pikepdf

        with pikepdf.open(input_path) as pdf:
            pdf.save(output_path, compress_streams=True)

        compressed_size = os.path.getsize(output_path)
        ratio = compressed_size / original_size if original_size > 0 else 1.0
        return output_path, compressed_size, ratio
    except ImportError:
        import shutil
        shutil.copy2(input_path, output_path)
        compressed_size = os.path.getsize(output_path)
        ratio = compressed_size / original_size if original_size > 0 else 1.0
        return output_path, compressed_size, ratio
    except Exception:
        import shutil
        shutil.copy2(input_path, output_path)
        compressed_size = os.path.getsize(output_path)
        ratio = compressed_size / original_size if original_size > 0 else 1.0
        return output_path, compressed_size, ratio


async def auto_compress(input_path: str, mime_type: str, stored_filename: str) -> dict:
    result = {
        "optimized_path": None,
        "thumbnail_path": None,
        "compressed_size": None,
        "compression_ratio": None,
        "is_compressed": False,
        "preview_ready": False,
    }

    if mime_type in ALLOWED_IMAGE_TYPES:
        opt_path, comp_size, ratio = compress_image(input_path)
        if opt_path:
            result["optimized_path"] = opt_path
            result["compressed_size"] = comp_size
            result["compression_ratio"] = round(ratio, 4)
            result["is_compressed"] = True
            result["preview_ready"] = True

        thumb_path = generate_thumbnail(input_path)
        if thumb_path:
            result["thumbnail_path"] = thumb_path
            result["preview_ready"] = True

    elif mime_type == "application/pdf":
        opt_path, comp_size, ratio = compress_pdf(input_path)
        if opt_path:
            result["optimized_path"] = opt_path
            result["compressed_size"] = comp_size
            result["compression_ratio"] = round(ratio, 4)
            result["is_compressed"] = True
            result["preview_ready"] = True

    return result


def _ensure_dir(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)
