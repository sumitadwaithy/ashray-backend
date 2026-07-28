import base64
import json
import urllib.parse
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, DateTime, Integer, JSON, text
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
import os
import logging
import asyncio
import httpx
import uuid
import hashlib
from pathlib import Path
import sys
import platform
import traceback
import subprocess

# Configure Playwright to use project-local cache if available
base_dir = Path(__file__).parent.resolve()
local_cache = base_dir / "playwright_browsers"
if local_cache.exists():
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(local_cache)

try:
    from .storage import (
        save_upload, save_optimized, save_thumbnail, read_file,
        delete_file, ORIGINALS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR, TEMP_DIR
    )
    from .media_compression import auto_compress
except ImportError:
    from storage import (
        save_upload, save_optimized, save_thumbnail, read_file,
        delete_file, ORIGINALS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR, TEMP_DIR
    )
    from media_compression import auto_compress

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# -------------------------
# ROOT / HEALTH CHECK
# -------------------------
@app.get("/")
@app.head("/")
async def root():
    return {"status": "ok", "service": "ashray-backend"}

# -------------------------
# CORS CONFIGURATION
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# SEO & HEALTH ROUTERS (SAFE INTEGRATION)
# -------------------------
try:
    try:
        from .routers import seo as seo_router, analytics as analytics_router, pagespeed as pagespeed_router, health as health_router
    except ImportError:
        from routers import seo as seo_router, analytics as analytics_router, pagespeed as pagespeed_router, health as health_router
    app.include_router(seo_router.router)
    app.include_router(analytics_router.router)
    app.include_router(pagespeed_router.router)
    app.include_router(health_router.router)
except Exception as e:
    logger.error(f"Failed to load SEO routers: {e}")

# -------------------------
# DATABASE SETUP
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL")

# Fallback for local testing or if env var is missing
if not DATABASE_URL:
    logger.warning("⚠️ DATABASE_URL not set! Using local SQLite. Data will be LOST on restart!")
    logger.warning("→ Set DATABASE_URL env var to a persistent PostgreSQL URL.")
    DATABASE_URL = "sqlite:///./test.db"
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    # For SQLite, we need check_same_thread=False
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
except Exception as e:
    logger.error(f"❌ Failed to initialize database engine: {str(e)}")
    raise e

# -------------------------
# MODELS
# -------------------------
class PropertyModel(Base):
    __tablename__ = "properties"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class ClientModel(Base):
    __tablename__ = "clients"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class ReferralModel(Base):
    __tablename__ = "referrals"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class DocModel(Base):
    __tablename__ = "docs"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class TransactionModel(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class InvestorModel(Base):
    __tablename__ = "investors"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class KissanModel(Base):
    __tablename__ = "kissans"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class LoanModel(Base):
    __tablename__ = "loans"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class BankModel(Base):
    __tablename__ = "banks"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class StaffModel(Base):
    __tablename__ = "staff"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class FolderModel(Base):
    __tablename__ = "folders"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class MasterPropertyModel(Base):
    __tablename__ = "master_properties"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class PendingReceiptModel(Base):
    __tablename__ = "pending_receipts"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class DocumentModel(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    original_name = Column(String, nullable=False)
    stored_filename = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    optimized_path = Column(String, nullable=True)
    thumbnail_path = Column(String, nullable=True)
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    compressed_size = Column(Integer, nullable=True)
    sha256_hash = Column(String, nullable=True)
    compression_ratio = Column(String, nullable=True)
    is_compressed = Column(Integer, default=0)
    preview_ready = Column(Integer, default=0)
    clientId = Column(String, nullable=True, index=True)
    investorId = Column(String, nullable=True, index=True)
    loanId = Column(String, nullable=True, index=True)
    kissanId = Column(String, nullable=True, index=True)
    staffId = Column(String, nullable=True, index=True)
    category_id = Column(String, nullable=True)
    folder_id = Column(String, nullable=True)
    category = Column(String, nullable=True)
    date = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)
    is_deleted = Column(Integer, default=0)
    is_virtual = Column(Integer, default=0)
    virtual_data = Column(JSON, nullable=True)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables initialized.")
except Exception as e:
    logger.error(f"❌ Failed to create tables: {str(e)}")

# Migration: add virtual_data column to documents table if missing
try:
    dialect = engine.dialect.name
    if dialect == "sqlite":
        engine.execute(text("ALTER TABLE documents ADD COLUMN virtual_data TEXT"))
        logger.info("✅ Added virtual_data column to documents (SQLite)")
    else:
        engine.execute(text("ALTER TABLE documents ADD COLUMN virtual_data JSON"))
        logger.info("✅ Added virtual_data column to documents (PostgreSQL)")
except Exception:
    logger.info("ℹ️ virtual_data column already exists (or not applicable)")

# --- DATABASE ENGINE ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- HEALTH CHECK ---
@app.get("/api/health")
@app.head("/api/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": str(e)}

@app.get("/api/active-backend")
async def active_backend():
    return {
        "available": True,
        "machines": [],
        "message": "Cloud backend is active and serving requests."
    }

# --- KEEP-ALIVE BACKGROUND TASK (prevents server spin-down on free-tier hosts) ---
KEEP_ALIVE_URL = os.getenv("KEEP_ALIVE_URL", "")

async def keep_alive():
    if not KEEP_ALIVE_URL:
        logger.info("⏸️ Keep-alive disabled (KEEP_ALIVE_URL not configured)")
        return
    while True:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(KEEP_ALIVE_URL)
                logger.info(
                    f"✅ Self-ping success | "
                    f"status={response.status_code}"
                )
        except Exception as e:
            logger.error(
                f"❌ Self-ping failed: {str(e)}"
            )
        await asyncio.sleep(300)

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting keep-alive background task...")
    asyncio.create_task(keep_alive())

    try:
        try:
            from .services.seo.playwright_check import check_playwright
        except ImportError:
            from services.seo.playwright_check import check_playwright

        result = await check_playwright()
        if result["chromium_available"] and result["playwright_installed"]:
            for msg in result["messages"]:
                logger.info(msg)
        else:
            for msg in result["messages"]:
                logger.critical(msg)
    except ImportError:
        logger.info("SEO Validator: playwright_check module not available (seo service directory may not be deployed)")

# --- HELPER FOR GENERIC CRUD ---
async def generic_upsert(request: Request, model, db: Session):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    item_id = str(data.get("id"))
    if not item_id or item_id == "None":
        raise HTTPException(status_code=400, detail="ID missing")
    
    existing = db.query(model).filter(model.id == item_id).first()
    if existing:
        existing.data = data
    else:
        new_item = model(id=item_id, data=data)
        db.add(new_item)
    
    db.commit()
    return {"status": "success", "id": item_id}

async def generic_bulk_upsert(request: Request, model, db: Session):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list")
        
        for data in data_list:
            item_id = str(data.get("id"))
            if not item_id: continue
            existing = db.query(model).filter(model.id == item_id).first()
            if existing:
                existing.data = data
            else:
                db.add(model(id=item_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- INVESTOR ENDPOINTS ---
@app.get("/api/investor/all")
def get_all_investors(db: Session = Depends(get_db)):
    items = db.query(InvestorModel).all()
    return [i.data for i in items if i.data is not None and not i.data.get('is_deleted')]

@app.post("/api/investor/upsert")
async def upsert_investor(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, InvestorModel, db)

@app.post("/api/investor/bulk-upsert")
async def bulk_upsert_investors(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, InvestorModel, db)

@app.delete("/api/investor/delete/{item_id}")
def delete_investor(item_id: str, db: Session = Depends(get_db)):
    item = db.query(InvestorModel).filter(InvestorModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- KISSAN ENDPOINTS ---
@app.get("/api/kissan/all")
def get_all_kissans(db: Session = Depends(get_db)):
    items = db.query(KissanModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/kissan/upsert")
async def upsert_kissan(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, KissanModel, db)

@app.post("/api/kissan/bulk-upsert")
async def bulk_upsert_kissans(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, KissanModel, db)

@app.delete("/api/kissan/delete/{item_id}")
def delete_kissan(item_id: str, db: Session = Depends(get_db)):
    item = db.query(KissanModel).filter(KissanModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- LOAN ENDPOINTS ---
@app.get("/api/loan/all")
def get_all_loans(db: Session = Depends(get_db)):
    items = db.query(LoanModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/loan/upsert")
async def upsert_loan(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, LoanModel, db)

@app.post("/api/loan/bulk-upsert")
async def bulk_upsert_loans(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, LoanModel, db)

@app.delete("/api/loan/delete/{item_id}")
def delete_loan(item_id: str, db: Session = Depends(get_db)):
    item = db.query(LoanModel).filter(LoanModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- BANK ENDPOINTS ---
@app.get("/api/bank/all")
def get_all_banks(db: Session = Depends(get_db)):
    items = db.query(BankModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/bank/upsert")
async def upsert_bank(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, BankModel, db)

@app.post("/api/bank/bulk-upsert")
async def bulk_upsert_banks(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, BankModel, db)

@app.delete("/api/bank/delete/{item_id}")
def delete_bank(item_id: str, db: Session = Depends(get_db)):
    item = db.query(BankModel).filter(BankModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- STAFF ENDPOINTS ---
@app.get("/api/staff/all")
def get_all_staff(db: Session = Depends(get_db)):
    items = db.query(StaffModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/staff/upsert")
async def upsert_staff(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, StaffModel, db)

@app.post("/api/staff/bulk-upsert")
async def bulk_upsert_staff(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, StaffModel, db)

@app.delete("/api/staff/delete/{item_id}")
def delete_staff(item_id: str, db: Session = Depends(get_db)):
    item = db.query(StaffModel).filter(StaffModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- FOLDER ENDPOINTS ---
@app.get("/api/folder/all")
def get_all_folders(db: Session = Depends(get_db)):
    items = db.query(FolderModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/folder/upsert")
async def upsert_folder(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, FolderModel, db)

@app.post("/api/folder/bulk-upsert")
async def bulk_upsert_folders(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, FolderModel, db)

@app.delete("/api/folder/delete/{item_id}")
def delete_folder(item_id: str, db: Session = Depends(get_db)):
    item = db.query(FolderModel).filter(FolderModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- MASTER PROPERTY ENDPOINTS ---
@app.get("/api/master-properties/all")
def get_all_master_properties(db: Session = Depends(get_db)):
    items = db.query(MasterPropertyModel).all()
    return [i.data for i in items if i.data is not None]

@app.post("/api/master-properties/upsert")
async def upsert_master_property(request: Request, db: Session = Depends(get_db)):
    return await generic_upsert(request, MasterPropertyModel, db)

@app.post("/api/master-properties/bulk-upsert")
async def bulk_upsert_master_properties(request: Request, db: Session = Depends(get_db)):
    return await generic_bulk_upsert(request, MasterPropertyModel, db)

@app.delete("/api/master-properties/delete/{item_id}")
def delete_master_property(item_id: str, db: Session = Depends(get_db)):
    item = db.query(MasterPropertyModel).filter(MasterPropertyModel.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"status": "deleted"}

# --- DOCUMENT/FILE ENDPOINTS (Filesystem Storage) ---
@app.get("/api/doc/all")
@app.get("/api/files")
def get_all_docs(db: Session = Depends(get_db)):
    all_docs = []
    physical = db.query(DocumentModel).filter(DocumentModel.is_deleted == 0).all()
    for d in physical:
        doc_dict = {
            "id": d.id,
            "name": d.original_name,
            "file_name": d.original_name,
            "clientId": d.clientId,
            "investorId": d.investorId,
            "loanId": d.loanId,
            "kissanId": d.kissanId,
            "staffId": d.staffId,
            "category": d.category,
            "category_id": d.category_id,
            "folder_id": d.folder_id,
            "type": "virtual" if d.is_virtual else "file",
            "date": d.date,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
            "mime_type": d.mime_type,
            "size": d.size,
            "compressed_size": d.compressed_size,
            "has_file": d.file_path is not None,
            "preview_ready": d.preview_ready == 1,
            "stored_filename": d.stored_filename,
            "sha256_hash": d.sha256_hash,
            "fileData": None,
        }
        if d.virtual_data and isinstance(d.virtual_data, dict):
            for k, v in d.virtual_data.items():
                if k not in ("fileData", "data") and v is not None:
                    doc_dict[k] = v
        all_docs.append(doc_dict)
    migrated_ids = {r[0] for r in db.query(DocumentModel.id).all()}
    old_docs = db.query(DocModel).all()
    for d in old_docs:
        if d.data is None or d.id in migrated_ids:
            continue
        all_docs.append(d.data)
    return all_docs

@app.post("/api/doc/upsert")
@app.post("/api/documents")
async def upsert_doc(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception:
        return await upload_document_v2(request, db)
    if data.get("type") == "virtual" or data.get("is_virtual"):
        doc_id = data.get("id") or f"doc_{int(datetime.utcnow().timestamp())}"
        data["id"] = doc_id
        existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
        if existing:
            existing.data = data
        else:
            db.add(DocModel(id=doc_id, data=data))
        db.commit()
        return data
    doc_id = data.get("id") or f"doc_{int(datetime.utcnow().timestamp())}"
    existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    now = datetime.utcnow().isoformat()
    if existing:
        for field in ["clientId", "investorId", "loanId", "kissanId", "staffId", "category", "category_id", "folder_id", "date"]:
            if field in data:
                setattr(existing, field, data[field])
        existing.updated_at = now
        existing.virtual_data = data
        db.commit()
    else:
        db.add(DocumentModel(
            id=doc_id,
            original_name=data.get("name") or data.get("file_name") or doc_id,
            clientId=data.get("clientId"),
            investorId=data.get("investorId"),
            loanId=data.get("loanId"),
            kissanId=data.get("kissanId"),
            staffId=data.get("staffId"),
            category=data.get("category"),
            category_id=data.get("category_id"),
            folder_id=data.get("folder_id"),
            date=data.get("date"),
            created_at=now, updated_at=now, mime_type=data.get("mime_type"), is_virtual=0,
            virtual_data=data,
        ))
        db.commit()
    # Handle fileData base64: save to disk if present
    file_data_raw = data.get("fileData")
    if file_data_raw and isinstance(file_data_raw, str) and len(file_data_raw) > 100:
        try:
            import base64
            if file_data_raw.startswith("data:"):
                mime_from_data = file_data_raw.split(";")[0].split(":")[1] if ";" in file_data_raw else "application/octet-stream"
                raw_b64 = file_data_raw.split(",", 1)[1] if "," in file_data_raw else file_data_raw
            else:
                mime_from_data = data.get("mime_type") or "application/octet-stream"
                raw_b64 = file_data_raw
            file_bytes = base64.b64decode(raw_b64)
            original_name = data.get("name") or data.get("file_name") or doc_id
            sr = await save_upload(file_bytes, original_name, mime_from_data)
            cr = await auto_compress(sr["file_path"], mime_from_data, sr["stored_filename"])
            doc_rec = existing or db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
            if doc_rec:
                doc_rec.stored_filename = sr["stored_filename"]
                doc_rec.file_path = sr["file_path"]
                doc_rec.optimized_path = cr.get("optimized_path")
                doc_rec.thumbnail_path = cr.get("thumbnail_path")
                doc_rec.mime_type = doc_rec.mime_type or mime_from_data
                doc_rec.size = sr["size"]
                doc_rec.compressed_size = cr.get("compressed_size")
                doc_rec.sha256_hash = sr["sha256_hash"]
                doc_rec.compression_ratio = str(cr["compression_ratio"]) if cr.get("compression_ratio") else None
                doc_rec.is_compressed = 1 if cr["is_compressed"] else 0
                doc_rec.preview_ready = 1 if cr["preview_ready"] else 0
                db.commit()
        except Exception as e:
            logger.error(f"Failed to save fileData for doc {doc_id}: {e}")
    return {
        "id": doc_id, "name": data.get("name") or doc_id, "file_name": data.get("file_name") or doc_id,
        "clientId": data.get("clientId"), "fileData": None, "category": data.get("category"),
        "type": "file", "date": data.get("date"),
    }

@app.patch("/api/files/{doc_id}")
async def patch_doc(doc_id: str, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if existing:
        for field in ["clientId", "investorId", "loanId", "kissanId", "staffId", "category", "category_id", "folder_id", "date", "original_name"]:
            if field in data:
                setattr(existing, field, data[field])
        existing.updated_at = datetime.utcnow().isoformat()
        db.commit()
        return {"id": existing.id, "name": existing.original_name, "clientId": existing.clientId, "category": existing.category}
    existing_old = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not existing_old:
        raise HTTPException(status_code=404, detail="File not found")
    current_data = existing_old.data or {}
    current_data.update(data)
    existing_old.data = current_data
    db.commit()
    return existing_old.data

@app.delete("/api/doc/delete/{doc_id}")
@app.delete("/api/files/{doc_id}")
def delete_doc(doc_id: str, permanent: bool = False, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if doc:
        if permanent:
            delete_file(doc.file_path); delete_file(doc.optimized_path); delete_file(doc.thumbnail_path)
            db.delete(doc)
        else:
            doc.is_deleted = 1; doc.updated_at = datetime.utcnow().isoformat()
        db.commit()
        return {"status": "deleted" if permanent else "moved_to_trash"}
    doc_old = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if doc_old:
        if permanent:
            db.delete(doc_old)
        else:
            d = doc_old.data or {}; d["is_deleted"] = 1; doc_old.data = d
        db.commit()
    return {"status": "deleted" if permanent else "moved_to_trash"}

@app.get("/api/files/{doc_id}/content")
async def get_file_content(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if doc:
        fp = doc.optimized_path or doc.file_path
        if not fp:
            raise HTTPException(status_code=404, detail="File not found")
        content = await read_file(fp)
        if content is None:
            raise HTTPException(status_code=404, detail="File not found on disk")
        return Response(content=content, media_type=doc.mime_type or "application/octet-stream")
    doc_old = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not doc_old or not doc_old.data.get("fileData"):
        raise HTTPException(status_code=404, detail="File not found")
    fd = doc_old.data["fileData"]; h, e = fd.split(",", 1); d = base64.b64decode(e)
    return Response(content=d, media_type=h.split(":")[1].split(";")[0])

async def upload_document_v2(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    file = form.get("file")
    if not isinstance(file, UploadFile):
        raise HTTPException(status_code=400, detail="No file uploaded")
    name = form.get("name") or file.filename
    mime = form.get("type") or file.content_type
    content = await file.read()
    sr = await save_upload(content, name, mime)
    cr = await auto_compress(sr["file_path"], mime, sr["stored_filename"])
    doc_id = form.get("id") or f"doc_{int(datetime.utcnow().timestamp())}"
    now = datetime.utcnow().isoformat()
    doc = DocumentModel(
        id=doc_id, original_name=name, stored_filename=sr["stored_filename"],
        file_path=sr["file_path"], optimized_path=cr.get("optimized_path"),
        thumbnail_path=cr.get("thumbnail_path"), mime_type=mime, size=sr["size"],
        compressed_size=cr.get("compressed_size"), sha256_hash=sr["sha256_hash"],
        compression_ratio=str(cr["compression_ratio"]) if cr.get("compression_ratio") else None,
        is_compressed=1 if cr["is_compressed"] else 0, preview_ready=1 if cr["preview_ready"] else 0,
        clientId=form.get("clientId"), category_id=form.get("category_id"), folder_id=form.get("folder_id"),
        date=datetime.utcnow().strftime("%Y-%m-%d"), created_at=now, updated_at=now, is_virtual=0,
    )
    db.add(doc); db.commit()
    return {"id": doc.id, "name": doc.original_name, "file_name": doc.original_name,
            "clientId": doc.clientId, "type": "file", "date": doc.date,
            "mime_type": doc.mime_type, "size": doc.size, "fileData": None}

@app.delete("/api/trash/empty")
def empty_trash(db: Session = Depends(get_db)):
    for d in db.query(DocumentModel).filter(DocumentModel.is_deleted == 1).all():
        delete_file(d.file_path); delete_file(d.optimized_path); delete_file(d.thumbnail_path)
        db.delete(d)
    for d in db.query(DocModel).all():
        if d.data and d.data.get("is_deleted"):
            db.delete(d)
    db.commit()
    return {"status": "success"}

@app.post("/api/files/{doc_id}/duplicate")
def duplicate_file(doc_id: str, db: Session = Depends(get_db)):
    existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
    if existing:
        new_id = f"doc_{int(datetime.utcnow().timestamp())}_copy_{existing.id}"
        now = datetime.utcnow().isoformat()
        nd = DocumentModel(
            id=new_id, original_name=f"Copy of {existing.original_name}",
            stored_filename=existing.stored_filename, file_path=existing.file_path,
            optimized_path=existing.optimized_path, thumbnail_path=existing.thumbnail_path,
            mime_type=existing.mime_type, size=existing.size, compressed_size=existing.compressed_size,
            sha256_hash=existing.sha256_hash, compression_ratio=existing.compression_ratio,
            is_compressed=existing.is_compressed, preview_ready=existing.preview_ready,
            clientId=existing.clientId, investorId=existing.investorId, loanId=existing.loanId,
            kissanId=existing.kissanId, staffId=existing.staffId, category=existing.category,
            category_id=existing.category_id, folder_id=existing.folder_id, date=existing.date,
            created_at=now, updated_at=now, is_virtual=existing.is_virtual,
        )
        db.add(nd); db.commit()
        return {"id": nd.id, "name": nd.original_name, "file_name": nd.original_name, "fileData": None}
    existing_old = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not existing_old:
        raise HTTPException(status_code=404, detail="File not found")
    nd = existing_old.data.copy(); nd["id"] = f"doc_{int(datetime.utcnow().timestamp())}_copy_{doc_id}"
    nd["name"] = f"Copy of {nd['name']}"; nd["created_at"] = datetime.utcnow().isoformat()
    db.add(DocModel(id=nd["id"], data=nd)); db.commit()
    return nd

# --- PROPERTY ENDPOINTS ---
@app.post("/api/property/upsert")
async def upsert_property(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    prop_id = data.get("id")
    if not prop_id:
        raise HTTPException(status_code=400, detail="Property ID missing")
    
    existing = db.query(PropertyModel).filter(PropertyModel.id == prop_id).first()
    if existing:
        existing.data = data
    else:
        new_prop = PropertyModel(id=prop_id, data=data)
        db.add(new_prop)
    
    db.commit()
    return {"status": "success", "id": prop_id}

@app.get("/api/property/all")
def get_all_properties(db: Session = Depends(get_db)):
    props = db.query(PropertyModel).all()
    return [p.data for p in props if p.data is not None]

@app.post("/api/property/bulk-upsert")
async def bulk_upsert_properties(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of properties")
        
        for data in data_list:
            prop_id = data.get("id")
            if not prop_id: continue
            existing = db.query(PropertyModel).filter(PropertyModel.id == prop_id).first()
            if existing:
                existing.data = data
            else:
                db.add(PropertyModel(id=prop_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/property/delete/{prop_id}")
def delete_property(prop_id: str, db: Session = Depends(get_db)):
    if not prop_id:
        raise HTTPException(status_code=400, detail="Property ID missing")
        
    prop = db.query(PropertyModel).filter(PropertyModel.id == prop_id).first()
    if prop:
        db.delete(prop)
        db.commit()
    return {"status": "deleted"}

# --- CLIENT ENDPOINTS ---
@app.post("/api/client/upsert")
async def upsert_client(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    client_id = data.get("id")
    if not client_id:
        raise HTTPException(status_code=400, detail="Client ID missing")
    
    existing = db.query(ClientModel).filter(ClientModel.id == client_id).first()
    if existing:
        existing.data = data
    else:
        new_client = ClientModel(id=client_id, data=data)
        db.add(new_client)
    
    db.commit()
    return {"status": "success", "id": client_id}

@app.get("/api/client/all")
def get_all_clients(db: Session = Depends(get_db)):
    clients = db.query(ClientModel).filter(
        ClientModel.id != "main",
        ~ClientModel.id.like("mu_%"),
        ~ClientModel.id.like("staff_%"),
        ~ClientModel.id.like("app_%"),
    ).all()
    return [c.data for c in clients if c.data is not None and c.data.get('id') and not c.data.get('is_deleted')]

@app.post("/api/client/bulk-upsert")
async def bulk_upsert_clients(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of clients")
        
        for data in data_list:
            client_id = data.get("id")
            if not client_id: continue
            existing = db.query(ClientModel).filter(ClientModel.id == client_id).first()
            if existing:
                existing.data = data
            else:
                db.add(ClientModel(id=client_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- REFERRAL ENDPOINTS ---
@app.post("/api/referral/upsert")
async def upsert_referral(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    ref_id = data.get("id")
    if not ref_id:
        raise HTTPException(status_code=400, detail="Referral ID missing")
    
    existing = db.query(ReferralModel).filter(ReferralModel.id == ref_id).first()
    if existing:
        existing.data = data
    else:
        new_ref = ReferralModel(id=ref_id, data=data)
        db.add(new_ref)
    
    db.commit()
    return {"status": "success", "id": ref_id}

@app.get("/api/referral/all")
def get_all_referrals(db: Session = Depends(get_db)):
    refs = db.query(ReferralModel).all()
    return [r.data for r in refs if r.data is not None]

@app.post("/api/referral/bulk-upsert")
async def bulk_upsert_referrals(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of referrals")
        logger.info(f"Bulk Upsert Referrals: Received {len(data_list)} items")
        
        for data in data_list:
            ref_id = data.get("id")
            if not ref_id: continue
            existing = db.query(ReferralModel).filter(ReferralModel.id == ref_id).first()
            if existing:
                existing.data = data
            else:
                db.add(ReferralModel(id=ref_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Referrals Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/referral/delete/{ref_id}")
def delete_referral(ref_id: str, db: Session = Depends(get_db)):
    if not ref_id:
        raise HTTPException(status_code=400, detail="Referral ID missing")
    ref = db.query(ReferralModel).filter(ReferralModel.id == ref_id).first()
    if ref:
        db.delete(ref)
        db.commit()
    return {"status": "deleted"}

@app.delete("/api/doc/cleanup-reports")
def cleanup_report_docs(db: Session = Depends(get_db)):
    deleted = 0
    for d in db.query(DocumentModel).all():
        if d.category == "REPORT" or (d.is_virtual and d.virtual_data and d.virtual_data.get("type") == "virtual"):
            delete_file(d.file_path); delete_file(d.optimized_path); delete_file(d.thumbnail_path)
            db.delete(d); deleted += 1
    for d in db.query(DocModel).all():
        if (d.data or {}).get("category") == "REPORT" or (d.data or {}).get("type") == "virtual":
            db.delete(d); deleted += 1
    db.commit()
    return {"status": "success", "deleted": deleted}

@app.post("/api/doc/bulk-upsert")
async def bulk_upsert_docs(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of docs")
        logger.info(f"Bulk Upsert Docs: Received {len(data_list)} items")
        for data in data_list:
            doc_id = data.get("id")
            if not doc_id: continue
            if data.get("type") == "virtual" or data.get("is_virtual"):
                existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
                if existing: existing.data = data
                else: db.add(DocModel(id=doc_id, data=data))
                continue
            fdb64 = data.get("fileData")
            if fdb64 and isinstance(fdb64, str):
                try:
                    if fdb64.startswith("data:"):
                        mime = fdb64.split(":")[1].split(";")[0]
                        raw = base64.b64decode(fdb64.split(",", 1)[1])
                    else:
                        mime = "application/pdf"
                        raw = base64.b64decode(fdb64)
                except Exception:
                    raw = b""
                    mime = "application/octet-stream"
                sr = await save_upload(raw, data.get("name") or data.get("file_name") or doc_id, mime)
                cr = await auto_compress(sr["file_path"], mime, sr["stored_filename"])
                now = datetime.utcnow().isoformat()
                existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
                if existing:
                    for k, v in {"original_name": data.get("name") or existing.original_name,
                        "stored_filename": sr["stored_filename"], "file_path": sr["file_path"],
                        "optimized_path": cr.get("optimized_path"), "thumbnail_path": cr.get("thumbnail_path"),
                        "mime_type": mime, "size": sr["size"],
                        "compressed_size": cr.get("compressed_size"), "sha256_hash": sr["sha256_hash"],
                        "is_compressed": 1 if cr["is_compressed"] else 0,
                        "preview_ready": 1 if cr["preview_ready"] else 0,
                        "compression_ratio": str(cr["compression_ratio"]) if cr.get("compression_ratio") else None}.items():
                        setattr(existing, k, v)
                    for f in ["clientId", "investorId", "loanId", "kissanId", "staffId", "category", "category_id", "folder_id", "date"]:
                        if f in data: setattr(existing, f, data[f])
                    existing.updated_at = now
                    existing.virtual_data = data
                else:
                    db.add(DocumentModel(
                        id=doc_id, original_name=data.get("name") or data.get("file_name") or doc_id,
                        stored_filename=sr["stored_filename"], file_path=sr["file_path"],
                        optimized_path=cr.get("optimized_path"), thumbnail_path=cr.get("thumbnail_path"),
                        mime_type=mime, size=sr["size"], compressed_size=cr.get("compressed_size"),
                        sha256_hash=sr["sha256_hash"],
                        compression_ratio=str(cr["compression_ratio"]) if cr.get("compression_ratio") else None,
                        is_compressed=1 if cr["is_compressed"] else 0, preview_ready=1 if cr["preview_ready"] else 0,
                        clientId=data.get("clientId"), investorId=data.get("investorId"),
                        loanId=data.get("loanId"), kissanId=data.get("kissanId"), staffId=data.get("staffId"),
                        category=data.get("category"), category_id=data.get("category_id"), folder_id=data.get("folder_id"),
                        date=data.get("date"), created_at=data.get("created_at") or now, updated_at=now, is_virtual=0,
                        virtual_data=data,
                    ))
                old = db.query(DocModel).filter(DocModel.id == doc_id).first()
                if old: db.delete(old)
            else:
                now = datetime.utcnow().isoformat()
                existing = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
                if existing:
                    for f in ["clientId", "investorId", "loanId", "kissanId", "staffId", "category", "category_id", "folder_id", "date", "original_name"]:
                        if f in data: setattr(existing, f, data[f])
                    existing.updated_at = now
                    existing.virtual_data = data
                else:
                    db.add(DocumentModel(
                        id=doc_id, original_name=data.get("name") or data.get("file_name") or doc_id,
                        clientId=data.get("clientId"), investorId=data.get("investorId"),
                        loanId=data.get("loanId"), kissanId=data.get("kissanId"), staffId=data.get("staffId"),
                        category=data.get("category"), category_id=data.get("category_id"), folder_id=data.get("folder_id"),
                        date=data.get("date"), created_at=data.get("created_at") or now, updated_at=now,
                        mime_type=data.get("mime_type"), is_virtual=0, virtual_data=data,
                    ))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Docs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/doc/upload")
async def upload_document(
    file: UploadFile = File(...), clientId: str = None, db: Session = Depends(get_db)
):
    content = await file.read()
    mime = file.content_type or "application/octet-stream"
    sr = await save_upload(content, file.filename, mime)
    cr = await auto_compress(sr["file_path"], mime, sr["stored_filename"])
    doc_id = f"doc_{int(datetime.utcnow().timestamp())}"
    now = datetime.utcnow().isoformat()
    doc = DocumentModel(
        id=doc_id, original_name=file.filename, stored_filename=sr["stored_filename"],
        file_path=sr["file_path"], optimized_path=cr.get("optimized_path"),
        thumbnail_path=cr.get("thumbnail_path"), mime_type=mime, size=sr["size"],
        compressed_size=cr.get("compressed_size"), sha256_hash=sr["sha256_hash"],
        compression_ratio=str(cr["compression_ratio"]) if cr.get("compression_ratio") else None,
        is_compressed=1 if cr["is_compressed"] else 0, preview_ready=1 if cr["preview_ready"] else 0,
        clientId=clientId, date=datetime.utcnow().strftime("%Y-%m-%d"), created_at=now, updated_at=now, is_virtual=0,
    )
    db.add(doc); db.commit()
    return {"id": doc.id, "name": doc.original_name, "file_name": doc.original_name,
            "clientId": doc.clientId, "date": doc.date, "mime_type": doc.mime_type,
            "size": doc.size, "has_file": True, "fileData": None}

@app.get("/api/doc/view/{filename}")
async def view_document(filename: str, db: Session = Depends(get_db)):
    logger.info(f"🔍 Attempting to view document: {filename}")
    doc = db.query(DocumentModel).filter(
        (DocumentModel.original_name == filename) | (DocumentModel.id == filename) | (DocumentModel.stored_filename == filename)
    ).first()
    if not doc or not (doc.optimized_path or doc.file_path):
        for d in db.query(DocModel).all():
            dd = d.data or {}
            if dd.get("name") == filename or dd.get("file_name") == filename or dd.get("id") == filename:
                fd = dd.get("fileData")
                if not fd: break
                h, e = fd.split(",", 1); dec = base64.b64decode(e)
                return Response(content=dec, media_type=h.split(":")[1].split(";")[0])
        raise HTTPException(status_code=404, detail="File not found")
    fp = doc.optimized_path or doc.file_path
    content = await read_file(fp)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found on disk")
    return Response(content=content, media_type=doc.mime_type or "application/octet-stream")

@app.get("/api/doc/serve/{doc_id}")
async def serve_document(doc_id: str, db: Session = Depends(get_db)):
    doc_id = urllib.parse.unquote(doc_id)
    logger.info(f"🔍 Serving document: {doc_id}")

    doc_rec = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()

    if doc_rec:
        fp = doc_rec.file_path or doc_rec.optimized_path
        if fp:
            content = await read_file(fp)
            if content is not None:
                ct = doc_rec.mime_type or "application/octet-stream"
                return Response(
                    content=content, media_type=ct,
                    headers={
                        "Content-Disposition": f'inline; filename="{doc_rec.original_name}"',
                        "Cache-Control": "public, max-age=86400"
                    }
                )
        vd = doc_rec.virtual_data or {}
        fd = vd.get("fileData")
        if fd and isinstance(fd, str):
            try:
                if fd.startswith("data:"):
                    h, e = fd.split(",", 1)
                    dec = base64.b64decode(e)
                    ct = h.split(":")[1].split(";")[0]
                else:
                    dec = base64.b64decode(fd)
                    ct = doc_rec.mime_type or "application/octet-stream"
                return Response(
                    content=dec, media_type=ct,
                    headers={
                        "Content-Disposition": f'inline; filename="{doc_rec.original_name}"',
                        "Cache-Control": "public, max-age=86400"
                    }
                )
            except Exception as ex:
                logger.warning(f"Base64 decode failed for {doc_id}: {ex}")

    old = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if old and old.data:
        dd = old.data
        fp = dd.get("file_path")
        if fp:
            content = await read_file(fp)
            if content is not None:
                ct = dd.get("mime_type") or "application/octet-stream"
                return Response(
                    content=content, media_type=ct,
                    headers={"Content-Disposition": f'inline; filename="{dd.get("name", doc_id)}"', "Cache-Control": "public, max-age=86400"}
                )
        fd = dd.get("fileData")
        if fd and isinstance(fd, str):
            try:
                if fd.startswith("data:"):
                    h, e = fd.split(",", 1)
                    dec = base64.b64decode(e)
                    ct = h.split(":")[1].split(";")[0]
                else:
                    dec = base64.b64decode(fd)
                    ct = dd.get("mime_type") or "application/octet-stream"
                return Response(
                    content=dec, media_type=ct,
                    headers={"Content-Disposition": f'inline; filename="{dd.get("name", doc_id)}"', "Cache-Control": "public, max-age=86400"}
                )
            except Exception as ex:
                logger.warning(f"Base64 decode failed for legacy doc {doc_id}: {ex}")

    raise HTTPException(status_code=404, detail="Not Found")

@app.get("/api/doc/download/{filename}")
async def download_document(filename: str, db: Session = Depends(get_db)):
    logger.info(f"🔍 Attempting to download document: {filename}")
    doc = db.query(DocumentModel).filter(
        (DocumentModel.original_name == filename) | (DocumentModel.id == filename) | (DocumentModel.stored_filename == filename)
    ).first()
    if not doc or not (doc.file_path or doc.optimized_path):
        for d in db.query(DocModel).all():
            dd = d.data or {}
            if dd.get("name") == filename or dd.get("file_name") == filename or dd.get("id") == filename:
                fd = dd.get("fileData")
                if not fd: break
                h, e = fd.split(",", 1); dec = base64.b64decode(e)
                dn = dd.get("name") or dd.get("file_name") or filename
                return Response(content=dec, media_type=h.split(":")[1].split(";")[0],
                                headers={"Content-Disposition": f"attachment; filename={dn}"})
        raise HTTPException(status_code=404, detail="File not found")
    fp = doc.file_path or doc.optimized_path
    content = await read_file(fp)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found on disk")
    return Response(content=content, media_type=doc.mime_type or "application/octet-stream",
                    headers={"Content-Disposition": f"attachment; filename={doc.original_name}"})

@app.post("/api/doc/migrate-to-filesystem")
async def migrate_docs_to_filesystem(request: Request, db: Session = Depends(get_db)):
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    dry_run = body.get("dry_run", False) or request.query_params.get("dry_run", "false").lower() == "true"

    logger.info(f"🚀 Doc migration {'(DRY RUN)' if dry_run else ''}: base64 DB → filesystem storage")
    logger.info(f"   dry_run={dry_run}")

    total = 0; migrated = 0; skipped = 0; failed = 0; already_migrated = 0; verified = 0
    errors = []

    old_docs = db.query(DocModel).all()
    total = len(old_docs)
    logger.info(f"   Found {total} docs in old `docs` table")

    for idx, d in enumerate(old_docs, 1):
        doc_id = d.id
        dd = d.data or {}

        # --- Skip virtual docs ---
        if dd.get("type") == "virtual":
            logger.info(f"   [{idx}/{total}] SKIP (virtual): {doc_id}")
            skipped += 1
            continue

        # --- Check already migrated (has DocumentModel entry) ---
        if db.query(DocumentModel).filter(DocumentModel.id == doc_id).first():
            logger.info(f"   [{idx}/{total}] SKIP (already migrated): {doc_id}")
            already_migrated += 1
            if not dry_run:
                db.delete(d)
            continue

        fdb64 = dd.get("fileData")
        if not fdb64 or not isinstance(fdb64, str) or not fdb64.startswith("data:"):
            logger.warning(f"   [{idx}/{total}] SKIP (no fileData): {doc_id}")
            skipped += 1
            continue

        try:
            header, encoded = fdb64.split(",", 1)
            mime = header.split(":")[1].split(";")[0]
            raw = base64.b64decode(encoded)
            original_name = dd.get("name") or dd.get("file_name") or doc_id

            # --- Compute SHA256 of original content ---
            content_hash = hashlib.sha256(raw).hexdigest()

            if dry_run:
                logger.info(f"   [{idx}/{total}] WOULD MIGRATE: {doc_id} | name={original_name} | "
                            f"mime={mime} | size={len(raw)} bytes | sha256={content_hash[:16]}...")
                migrated += 1
                continue

            # --- Save to filesystem ---
            sr = await save_upload(raw, original_name, mime)

            # --- Verify SHA256 integrity ---
            if sr["sha256_hash"] != content_hash:
                logger.error(f"   [{idx}/{total}] SHA256 MISMATCH: {doc_id} — expected {content_hash}, got {sr['sha256_hash']}")
                failed += 1
                errors.append({"id": doc_id, "error": "SHA256 mismatch after save"})
                delete_file(sr["file_path"])
                continue

            # --- Auto-compress ---
            cr = await auto_compress(sr["file_path"], mime, sr["stored_filename"])

            now = datetime.utcnow().isoformat()

            # --- Create DocumentModel record ---
            doc = DocumentModel(
                id=doc_id, original_name=original_name,
                stored_filename=sr["stored_filename"], file_path=sr["file_path"],
                optimized_path=cr.get("optimized_path"), thumbnail_path=cr.get("thumbnail_path"),
                mime_type=mime, size=sr["size"], compressed_size=cr.get("compressed_size"),
                sha256_hash=sr["sha256_hash"],
                compression_ratio=str(cr["compression_ratio"]) if cr.get("compression_ratio") else None,
                is_compressed=1 if cr["is_compressed"] else 0, preview_ready=1 if cr["preview_ready"] else 0,
                clientId=dd.get("clientId"), investorId=dd.get("investorId"),
                loanId=dd.get("loanId"), kissanId=dd.get("kissanId"), staffId=dd.get("staffId"),
                category=dd.get("category"), category_id=dd.get("category_id"), folder_id=dd.get("folder_id"),
                date=dd.get("date"), created_at=dd.get("created_at") or now, updated_at=now, is_virtual=0,
            )
            db.add(doc)

            # --- Verify integrity after write ---
            saved = db.query(DocumentModel).filter(DocumentModel.id == doc_id).first()
            if saved and saved.sha256_hash == content_hash:
                verified += 1

            # --- Remove old DocModel record ---
            db.delete(d)
            migrated += 1
            logger.info(f"   [{idx}/{total}] MIGRATED: {doc_id} | {original_name} | {sr['size']} bytes"
                        f"{' → compressed ' + str(cr.get('compressed_size')) + ' bytes' if cr.get('compressed_size') else ''}")

        except Exception as e:
            logger.error(f"   [{idx}/{total}] FAILED: {doc_id} — {str(e)}")
            failed += 1
            errors.append({"id": doc_id, "error": str(e)})

    db.commit()

    # --- Summary ---
    summary = {
        "status": "success" if failed == 0 else "partial",
        "dry_run": dry_run,
        "total": total,
        "migrated": migrated,
        "skipped": skipped,
        "already_migrated": already_migrated,
        "failed": failed,
        "verified": verified,
        "errors": errors[:20],
        "details": {
            "virtual_docs_skipped": skipped,
            "records_removed_from_old_table": migrated + already_migrated,
            "records_created_in_new_table": migrated,
            "sha256_verified": verified,
        }
    }

    log_level = "✅" if failed == 0 else "⚠️"
    logger.info(f"{log_level} Migration complete (dry_run={dry_run}): "
                f"{migrated} migrated, {skipped} skipped, "
                f"{already_migrated} already migrated, {failed} failed, {verified} verified")

    return summary

# --- TRANSACTION ENDPOINTS ---
@app.post("/api/transaction/upsert")
async def upsert_transaction(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    tx_id = data.get("id")
    if not tx_id:
        raise HTTPException(status_code=400, detail="Transaction ID missing")
    
    existing = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if existing:
        existing.data = data
    else:
        new_tx = TransactionModel(id=tx_id, data=data)
        db.add(new_tx)
    
    db.commit()
    return {"status": "success", "id": tx_id}

@app.get("/api/transaction/all")
def get_all_transactions(db: Session = Depends(get_db)):
    txs = db.query(TransactionModel).all()
    return [t.data for t in txs if t.data is not None]

@app.post("/api/transaction/bulk-upsert")
async def bulk_upsert_transactions(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of transactions")
        
        for data in data_list:
            tx_id = data.get("id")
            if not tx_id: continue
            existing = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
            if existing:
                existing.data = data
            else:
                db.add(TransactionModel(id=tx_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/transaction/delete/{tx_id}")
def delete_transaction(tx_id: str, db: Session = Depends(get_db)):
    if not tx_id:
        raise HTTPException(status_code=400, detail="Transaction ID missing")
    tx = db.query(TransactionModel).filter(TransactionModel.id == tx_id).first()
    if tx:
        db.delete(tx)
        db.commit()
    return {"status": "deleted"}

# --- PENDING RECEIPT ENDPOINTS ---
@app.get("/api/pending-receipt/all")
def get_all_pending_receipts(db: Session = Depends(get_db)):
    items = db.query(PendingReceiptModel).all()
    return [r.data for r in items if r.data is not None]

@app.post("/api/pending-receipt/bulk-upsert")
async def bulk_upsert_pending_receipts(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list")
        for data in data_list:
            item_id = data.get("id")
            if not item_id: continue
            existing = db.query(PendingReceiptModel).filter(PendingReceiptModel.id == item_id).first()
            if existing: existing.data = data
            else: db.add(PendingReceiptModel(id=item_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Pending Receipt Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- UNIFIED LOGIN ENDPOINT ---
@app.post("/api/auth/login")
async def unified_login(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        login_id = str(data.get("username") or "").strip()
        password = data.get("password")
        normalized_login = login_id.lower()
        login_digits = "".join(ch for ch in login_id if ch.isdigit())

        def matches_login(value):
            if value is None:
                return False
            candidate = str(value).strip()
            candidate_digits = "".join(ch for ch in candidate if ch.isdigit())
            return (
                candidate.lower() == normalized_login or
                (login_digits and candidate_digits and (
                    candidate_digits == login_digits or
                    candidate_digits.endswith(login_digits) or
                    login_digits.endswith(candidate_digits)
                ))
            )

        logger.info(f"🔐 Login attempt: {login_id}")

        if not login_id or not password:
            return JSONResponse(status_code=400, content={"message": "ID and Password required"})

        # =========================================================
        # 1. CHECK INVESTORS (checked first so investor credentials
        #    don't accidentally match a client record via digit substrings)
        # =========================================================
        all_investors = db.query(InvestorModel).all()
        logger.info(f"📋 Total investors in DB: {len(all_investors)}")

        for investor in all_investors:
            i = investor.data
            if not isinstance(i, dict):
                logger.warning(f"⚠️ Investor {investor.id} has non-dict data: {type(i)}")
                continue

            if matches_login(i.get("id")) or matches_login(i.get("username")) or matches_login(i.get("phone")) or matches_login(i.get("email")):
                stored_password = i.get("password")
                if stored_password == password or not stored_password:
                    investor_id = i.get("id")

                    # Attach transactions
                    all_txs = db.query(TransactionModel).all()
                    i["transactions"] = [
                        t.data for t in all_txs
                        if t.data and t.data.get("investorId") == investor_id
                    ]

                    # Attach docs (both new DocumentModel and old DocModel)
                    all_docs_new = db.query(DocumentModel).filter(
                        DocumentModel.investorId == investor_id, DocumentModel.is_deleted == 0
                    ).all()
                    all_docs_old = db.query(DocModel).all()
                    i["docs"] = [d.data for d in all_docs_old if d.data and d.data.get("investorId") == investor_id]
                    for d in all_docs_new:
                        i["docs"].append({
                            "id": d.id, "name": d.original_name, "file_name": d.original_name,
                            "investorId": d.investorId, "category": d.category, "type": "file",
                            "date": d.date, "mime_type": d.mime_type, "size": d.size,
                            "has_file": True, "fileData": None,
                        })

                    # Attach pending receipts
                    all_pr = db.query(PendingReceiptModel).all()
                    i["pending_receipts"] = [
                        r.data for r in all_pr
                        if r.data and (
                            (r.data.get("partyId") == investor_id and r.data.get("partyType") == "investor") or
                            r.data.get("transactionId") in [tx.get("id") for tx in i.get("transactions", [])]
                        )
                    ]

                    logger.info(f"✅ INVESTOR LOGIN SUCCESS: {investor_id}")

                    return {
                        "status": "success",
                        "role": "investor",
                        "data": i
                    }

                else:
                    logger.warning(f"❌ Investor password mismatch: {login_id}")

        # =========================================================
        # 2. CHECK CLIENTS
        # =========================================================
        all_clients = db.query(ClientModel).all()
        logger.info(f"📋 Total clients in DB: {len(all_clients)}")

        for client in all_clients:
            c = client.data
            if not isinstance(c, dict):
                logger.warning(f"⚠️ Client {client.id} has non-dict data: {type(c)}")
                continue

            if matches_login(c.get("id")) or matches_login(c.get("username")) or matches_login(c.get("phone")) or matches_login(c.get("email")) or matches_login(c.get("name")):
                stored_password = c.get("password")
                if stored_password == password or not stored_password:
                    client_id = c.get("id")

                    # Attach transactions
                    all_txs = db.query(TransactionModel).all()
                    c["transactions"] = [
                        t.data for t in all_txs
                        if t.data and t.data.get("clientId") == client_id
                    ]

                    # Attach referrals
                    all_refs = db.query(ReferralModel).all()
                    c["referrals"] = [
                        r.data for r in all_refs
                        if r.data and r.data.get("referrerClientId") == client_id
                    ]

                    # Attach docs (both new DocumentModel and old DocModel)
                    all_docs_new = db.query(DocumentModel).filter(
                        DocumentModel.clientId == client_id, DocumentModel.is_deleted == 0
                    ).all()
                    all_docs_old = db.query(DocModel).all()
                    c["docs"] = [d.data for d in all_docs_old if d.data and d.data.get("clientId") == client_id]
                    for d in all_docs_new:
                        c["docs"].append({
                            "id": d.id, "name": d.original_name, "file_name": d.original_name,
                            "clientId": d.clientId, "category": d.category, "type": "file",
                            "date": d.date, "mime_type": d.mime_type, "size": d.size,
                            "has_file": d.file_path is not None, "fileData": None,
                        })

                    # Attach pending receipts
                    all_pr = db.query(PendingReceiptModel).all()
                    c["pending_receipts"] = [
                        r.data for r in all_pr
                        if r.data and (
                            (r.data.get("partyId") == client_id and r.data.get("partyType") == "client") or
                            r.data.get("transactionId") in [tx.get("id") for tx in c.get("transactions", [])]
                        )
                    ]

                    logger.info(f"✅ CLIENT LOGIN SUCCESS: {client_id}")

                    return {
                        "status": "success",
                        "role": "client",
                        "data": c
                    }

                else:
                    logger.warning(f"❌ Client password mismatch: {login_id}")

        # =========================================================
        # 3. NOT FOUND
        # =========================================================
        client_ids = [c.data.get("id") or c.id for c in all_clients if isinstance(c.data, dict)]
        client_usernames = [c.data.get("username") for c in all_clients if isinstance(c.data, dict)]
        investor_ids = [i.data.get("id") or i.id for i in all_investors if isinstance(i.data, dict)]
        logger.warning(f"❌ LOGIN FAILED: {login_id} — available client usernames: {client_usernames[:20]}, client IDs: {client_ids[:20]}, investor IDs: {investor_ids[:20]}")
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})

    except Exception as e:
        logger.error(f"❌ LOGIN ERROR: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})
    

# =========================================================
# SETTINGS ENDPOINTS
# =========================================================
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    try:
        row = db.query(ClientModel).filter(ClientModel.id == "main").first()
        return row.data if row and row.data else {}
    except:
        return {}

@app.post("/api/settings")
async def upsert_settings(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        existing = db.query(ClientModel).filter(ClientModel.id == "main").first()
        if existing:
            existing.data = data
        else:
            db.add(ClientModel(id="main", data=data))
        db.commit()
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Settings Upsert Error: {type(e).__name__}: {str(e) or '(empty)'}")
        logger.exception("Settings Upsert traceback:")
        raise HTTPException(status_code=500, detail=str(e) or type(e).__name__)

# =========================================================
# STAFF ENDPOINTS (passthrough)
# =========================================================
@app.get("/api/staff/all")
def get_all_staff(db: Session = Depends(get_db)):
    try:
        rows = db.query(ClientModel).filter(ClientModel.id.like("staff_%")).all()
        return [r.data for r in rows if r.data is not None]
    except Exception as e:
        logger.warning(f"Staff query failed: {str(e)}")
        return []

@app.post("/api/staff/bulk-upsert")
async def bulk_upsert_staff(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list")
        for item in data_list:
            item_id = item.get("id")
            if not item_id: continue
            existing = db.query(ClientModel).filter(ClientModel.id == f"staff_{item_id}").first()
            if existing:
                existing.data = item
            else:
                db.add(ClientModel(id=f"staff_{item_id}", data=item))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Staff Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# MARKET UPDATES ENDPOINTS (passthrough)
# =========================================================
@app.get("/api/market-updates/all")
def get_all_market_updates(db: Session = Depends(get_db)):
    try:
        rows = db.query(ClientModel).filter(ClientModel.id.like("mu_%")).all()
        return [r.data for r in rows if r.data is not None]
    except Exception as e:
        logger.warning(f"Market updates query failed: {str(e)}")
        return []

@app.post("/api/market-updates/bulk-upsert")
async def bulk_upsert_market_updates(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list")
        for item in data_list:
            item_id = item.get("id")
            if not item_id: continue
            existing = db.query(ClientModel).filter(ClientModel.id == f"mu_{item_id}").first()
            if existing:
                existing.data = item
            else:
                db.add(ClientModel(id=f"mu_{item_id}", data=item))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Market Updates Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# APPLICATION ENDPOINTS (passthrough)
# =========================================================
@app.get("/api/application/all")
def get_all_applications(db: Session = Depends(get_db)):
    try:
        rows = db.query(ClientModel).filter(ClientModel.id.like("app_%")).all()
        return [r.data for r in rows if r.data is not None]
    except Exception as e:
        logger.warning(f"Applications query failed: {str(e)}")
        return []

@app.post("/api/application/bulk-upsert")
async def bulk_upsert_applications(request: Request, db: Session = Depends(get_db)):
    try:
        data_list = await request.json()
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list")
        for item in data_list:
            item_id = item.get("id")
            if not item_id: continue
            existing = db.query(ClientModel).filter(ClientModel.id == f"app_{item_id}").first()
            if existing:
                existing.data = item
            else:
                db.add(ClientModel(id=f"app_{item_id}", data=item))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Applications Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# RESET LEDGER ENDPOINT
# =========================================================
@app.post("/api/reset-ledger")
async def reset_ledger(request: Request, db: Session = Depends(get_db)):
    try:
        try:
            body = await request.json()
        except Exception:
            body = {}
        
        reset_ongoing = body.get("resetOngoingAccounts")
        if reset_ongoing is None:
            reset_ongoing = True

        logger.info(f"🔄 Reset Ledger request on cloud backend. resetOngoingAccounts={reset_ongoing}")

        if reset_ongoing:
            # Full Reset: delete everything from all tables, keeping only settings (id='main' in ClientModel)
            db.query(PropertyModel).delete()
            db.query(ReferralModel).delete()
            db.query(DocModel).delete()
            db.query(TransactionModel).delete()
            db.query(InvestorModel).delete()
            db.query(PendingReceiptModel).delete()
            db.query(DocumentModel).delete()
            db.query(KissanModel).delete()
            db.query(LoanModel).delete()
            db.query(BankModel).delete()
            db.query(StaffModel).delete()
            db.query(MasterPropertyModel).delete()
            
            # Keep only the settings record in ClientModel
            db.query(ClientModel).filter(ClientModel.id != "main").delete()
            db.commit()
            
            logger.info("✅ Full reset ledger operation successfully completed on cloud backend.")
            return {"status": "success", "message": "Full reset completed successfully on backend"}

        # Partial Reset: Delete finished accounts, keep ongoing accounts with balances intact
        # 1. Fetch transactions
        tx_rows = db.query(TransactionModel).all()
        transactions = [r.data for r in tx_rows if isinstance(r.data, dict)]

        # 2. Process clients
        all_client_rows = db.query(ClientModel).all()
        kept_client_ids = set()
        deleted_client_db_ids = set()

        for row in all_client_rows:
            row_id = row.id
            if row_id == "main" or row_id.startswith("staff_") or row_id.startswith("mu_") or row_id.startswith("app_"):
                continue  # Skip settings, staff, market updates, applications
            
            client = row.data
            if not isinstance(client, dict):
                deleted_client_db_ids.add(row_id)
                continue
            
            client_id = client.get("id")
            if not client_id:
                deleted_client_db_ids.add(row_id)
                continue
            
            client_txs = [t for t in transactions if t.get("clientId") == client_id and t.get("type") == "CREDIT"]
            total_paid = sum(float(t.get("amount") or 0) for t in client_txs)

            client_properties_list = []
            investments = client.get("investments")
            if isinstance(investments, list) and len(investments) > 0:
                client_properties_list.extend(investments)
            elif client.get("totalContractValue"):
                client_properties_list.append({"amount": client.get("totalContractValue") or 0})
            
            contract_value = sum(float(p.get("amount") or 0) for p in client_properties_list if isinstance(p, dict))
            remaining_balance = contract_value - total_paid

            if remaining_balance > 0:
                kept_client_ids.add(client_id)
            else:
                deleted_client_db_ids.add(row_id)

        # 3. Process investors
        all_investor_rows = db.query(InvestorModel).all()
        kept_investor_ids = set()
        deleted_investor_db_ids = set()

        for row in all_investor_rows:
            investor = row.data
            if not isinstance(investor, dict):
                deleted_investor_db_ids.add(row.id)
                continue
            
            investor_id = investor.get("id")
            if not investor_id:
                deleted_investor_db_ids.add(row.id)
                continue
            
            investor_txs = [t for t in transactions if t.get("investorId") == investor_id]
            total_invested = float(investor.get("totalInvested") or 0)
            
            # Sum up INTEREST_ACCRUAL transactions: DEBIT is appreciation (+), CREDIT is depreciation (-)
            total_interest_accrued = 0.0
            for t in investor_txs:
                if t.get("category") == "INTEREST_ACCRUAL":
                    amount = float(t.get("amount") or 0)
                    if t.get("type") == "DEBIT":
                        total_interest_accrued += amount
                    elif t.get("type") == "CREDIT":
                        total_interest_accrued -= amount
            
            # Payouts: any DEBIT transaction NOT of category INTEREST_ACCRUAL
            total_returns = sum(
                float(t.get("amount") or 0)
                for t in investor_txs
                if t.get("type") == "DEBIT" and t.get("category") != "INTEREST_ACCRUAL"
            )
            balance = total_invested + total_interest_accrued - total_returns

            if balance > 0 or float(investor.get("currentBalance") or 0) > 0:
                kept_investor_ids.add(investor_id)
            else:
                deleted_investor_db_ids.add(row.id)

        # 4. Process staff
        kept_staff_ids = set()
        deleted_staff_db_ids = set()

        for row in all_client_rows:
            if row.id.startswith("staff_"):
                staff = row.data
                if not isinstance(staff, dict):
                    deleted_staff_db_ids.add(row.id)
                    continue
                
                staff_id = staff.get("id")
                if not staff_id:
                    deleted_staff_db_ids.add(row.id)
                    continue
                
                if staff.get("status") == "ACTIVE":
                    kept_staff_ids.add(staff_id)
                else:
                    deleted_staff_db_ids.add(row.id)

        # 5. Perform deletions in a database session
        # Delete clients
        for db_id in deleted_client_db_ids:
            db.query(ClientModel).filter(ClientModel.id == db_id).delete()

        # Delete staff
        for db_id in deleted_staff_db_ids:
            db.query(ClientModel).filter(ClientModel.id == db_id).delete()

        # Delete investors
        for db_id in deleted_investor_db_ids:
            db.query(InvestorModel).filter(InvestorModel.id == db_id).delete()

        # Delete transactions which are NOT linked to any kept account
        for t_row in db.query(TransactionModel).all():
            t = t_row.data or {}
            is_kept = (
                (t.get("clientId") and t.get("clientId") in kept_client_ids) or
                (t.get("investorId") and t.get("investorId") in kept_investor_ids) or
                (t.get("staffId") and t.get("staffId") in kept_staff_ids)
            )
            if not is_kept:
                db.delete(t_row)

        # Delete docs from DocumentModel not related to kept accounts
        for doc_row in db.query(DocumentModel).all():
            is_kept = (
                (doc_row.clientId and doc_row.clientId in kept_client_ids) or
                (doc_row.investorId and doc_row.investorId in kept_investor_ids) or
                (doc_row.staffId and doc_row.staffId in kept_staff_ids)
            )
            if not is_kept:
                db.delete(doc_row)

        # Delete docs from DocModel not related to kept accounts
        for doc_row in db.query(DocModel).all():
            d = doc_row.data or {}
            is_kept = (
                (d.get("clientId") and d.get("clientId") in kept_client_ids) or
                (d.get("investorId") and d.get("investorId") in kept_investor_ids) or
                (d.get("staffId") and d.get("staffId") in kept_staff_ids)
            )
            if not is_kept:
                db.delete(doc_row)

        # Delete pending receipts not related to kept accounts
        for pr_row in db.query(PendingReceiptModel).all():
            r = pr_row.data or {}
            party_id = r.get("partyId") or r.get("clientId") or r.get("kissanId") or r.get("investorId") or r.get("loanId") or r.get("staffId")
            is_kept = party_id and (
                party_id in kept_client_ids or
                party_id in kept_investor_ids or
                party_id in kept_staff_ids
            )
            if not is_kept:
                db.delete(pr_row)

        # Delete referrals not related to kept client referrers
        for ref_row in db.query(ReferralModel).all():
            ref = ref_row.data or {}
            is_kept = ref.get("referrerClientId") in kept_client_ids
            if not is_kept:
                db.delete(ref_row)

        db.commit()
        logger.info("✅ Partial reset ledger operation successfully completed on cloud backend.")
        return {"status": "success", "message": "Partial reset completed successfully on backend"}

    except Exception as e:
        logger.error(f"❌ Reset Ledger Error on cloud backend: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Reset ledger failed: {str(e)}")

@app.get("/api/seo/playwright-diagnostics")
async def playwright_diagnostics():
    diag = {}

    diag["python_version"] = sys.version
    diag["os"] = platform.platform()
    diag["arch"] = platform.machine()
    diag["playwright_browsers_path_env"] = os.environ.get("PLAYWRIGHT_BROWSERS_PATH", "(not set)")
    diag["home_dir"] = str(Path.home())
    diag["cwd"] = os.getcwd()

    try:
        import importlib.metadata as ilm
        diag["playwright_version"] = ilm.version("playwright")
    except Exception:
        try:
            import playwright
            diag["playwright_version"] = getattr(playwright, "__version__", "unknown")
        except ImportError:
            diag["playwright_version"] = "not installed"
            diag["note"] = "Playwright package not installed — cannot run remaining checks"
            return diag

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            exe_path = p.chromium.executable_path
            diag["expected_executable_path"] = exe_path
            diag["executable_exists"] = os.path.exists(exe_path)
            if diag["executable_exists"]:
                diag["executable_is_executable"] = os.access(exe_path, os.X_OK)
                try:
                    diag["executable_size_bytes"] = os.path.getsize(exe_path)
                except Exception:
                    pass
            else:
                diag["executable_is_executable"] = False

            try:
                browser = await p.chromium.launch(
                    headless=True,
                    args=[
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                    ],
                )
                diag["launch_success"] = True
                await browser.close()
            except Exception:
                diag["launch_success"] = False
                diag["launch_traceback"] = traceback.format_exc()
    except Exception as e:
        diag["error_playwright_api"] = str(e)
        diag["launch_success"] = False

    try:
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium", "--dry-run"],
            capture_output=True,
            text=True,
            timeout=30,
        )
        diag["dry_run_stdout"] = result.stdout
        diag["dry_run_stderr"] = result.stderr
        diag["dry_run_returncode"] = result.returncode
    except Exception as e:
        diag["dry_run_error"] = str(e)

    return diag

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
