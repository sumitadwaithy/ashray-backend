import os
import uuid
import hashlib
from pathlib import Path
from typing import Optional

import aiofiles

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
ORIGINALS_DIR = UPLOAD_DIR / "originals"
OPTIMIZED_DIR = UPLOAD_DIR / "optimized"
THUMBNAILS_DIR = UPLOAD_DIR / "thumbnails"
TEMP_DIR = UPLOAD_DIR / "temp"

for _dir in [UPLOAD_DIR, ORIGINALS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR, TEMP_DIR]:
    _dir.mkdir(parents=True, exist_ok=True)


def _ensure_dir(path: str) -> None:
    Path(path).parent.mkdir(parents=True, exist_ok=True)


def _generate_stored_filename(original_name: str) -> str:
    ext = Path(original_name).suffix.lower() if original_name else ""
    return f"{uuid.uuid4().hex}{ext}"


async def _compute_sha256(file_path: Path) -> str:
    sha256 = hashlib.sha256()
    async with aiofiles.open(file_path, "rb") as f:
        while True:
            chunk = await f.read(65536)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()


async def save_upload(file_content: bytes, original_name: str, mime_type: str) -> dict:
    stored_filename = _generate_stored_filename(original_name)
    original_path = ORIGINALS_DIR / stored_filename

    async with aiofiles.open(original_path, "wb") as f:
        await f.write(file_content)

    sha256 = await _compute_sha256(original_path)
    size = len(file_content)

    return {
        "stored_filename": stored_filename,
        "file_path": str(original_path),
        "sha256_hash": sha256,
        "size": size,
        "mime_type": mime_type,
        "original_name": original_name,
    }


async def save_optimized(file_content: bytes, stored_filename: str) -> Optional[str]:
    name = Path(stored_filename).stem
    ext = Path(stored_filename).suffix
    optimized_filename = f"{name}_optimized{ext}"
    optimized_path = OPTIMIZED_DIR / optimized_filename

    async with aiofiles.open(optimized_path, "wb") as f:
        await f.write(file_content)

    return str(optimized_path)


async def save_thumbnail(file_content: bytes, stored_filename: str) -> Optional[str]:
    name = Path(stored_filename).stem
    thumb_filename = f"{name}_thumb.webp"
    thumb_path = THUMBNAILS_DIR / thumb_filename

    async with aiofiles.open(thumb_path, "wb") as f:
        await f.write(file_content)

    return str(thumb_path)


async def read_file(file_path: str) -> Optional[bytes]:
    try:
        async with aiofiles.open(file_path, "rb") as f:
            return await f.read()
    except (FileNotFoundError, OSError):
        return None


def delete_file(file_path: str) -> bool:
    try:
        p = Path(file_path)
        if p.exists():
            p.unlink()
            return True
    except OSError:
        pass
    return False


def get_file_size(file_path: str) -> Optional[int]:
    try:
        p = Path(file_path)
        return p.stat().st_size if p.exists() else None
    except OSError:
        return None


async def migrate_from_base64(file_data_b64: str, original_name: str) -> Optional[dict]:
    try:
        header, encoded = file_data_b64.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0]
        file_content = hashlib.new("sha256", encoded.encode()).digest()
        from base64 import b64decode
        file_content = b64decode(encoded)
    except (ValueError, IndexError, Exception):
        return None

    result = await save_upload(file_content, original_name, mime_type)
    return result
