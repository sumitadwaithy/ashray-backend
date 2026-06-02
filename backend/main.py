import base64
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

from .storage import (
    save_upload, save_optimized, save_thumbnail, read_file,
    delete_file, ORIGINALS_DIR, OPTIMIZED_DIR, THUMBNAILS_DIR, TEMP_DIR
)
from .media_compression import auto_compress

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
# STRICT STORAGE GOVERNANCE — Render Cloud Enforcement
# -------------------------
MAX_PAYLOAD_MB = 1
MAX_PAYLOAD_BYTES = MAX_PAYLOAD_MB * 1024 * 1024
MAX_RENDER_STORAGE_MB = int(os.getenv("MAX_RENDER_STORAGE_MB", "800"))
MAX_RENDER_STORAGE_BYTES = MAX_RENDER_STORAGE_MB * 1024 * 1024
RENDER_METADATA_ONLY = os.getenv("RENDER_METADATA_ONLY", "true").lower() != "false"
REJECTED_PAYLOADS_LOG = []

BINARY_FIELDS = {"fileData", "file_data", "binaryData", "binary_data", "content", "file_buffer",
                 "preview", "thumbnail", "optimizedData", "optimized_data", "attachments_binary"}

def strip_binary_from_payload(data: dict) -> dict:
    if not isinstance(data, dict):
        return data
    cleaned = {}
    for k, v in data.items():
        if k in BINARY_FIELDS:
            cleaned[k] = "[STRIPPED by Render governance]"
            continue
        if isinstance(v, dict):
            cleaned[k] = strip_binary_from_payload(v)
        elif isinstance(v, list):
            cleaned[k] = [strip_binary_from_payload(item) if isinstance(item, dict) else item for item in v]
        else:
            cleaned[k] = v
    return cleaned

def strip_binary_deep(data):
    if isinstance(data, dict):
        return strip_binary_from_payload(data)
    if isinstance(data, list):
        return [strip_binary_deep(item) for item in data]
    return data

@app.middleware("http")
async def enforce_storage_governance(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_PAYLOAD_BYTES:
            logger.warning(f"⛔ PAYLOAD REJECTED — {request.method} {request.url.path} — {content_length} bytes exceeds {MAX_PAYLOAD_MB} MB limit")
            REJECTED_PAYLOADS_LOG.append({
                "path": request.url.path, "method": request.method,
                "size": int(content_length), "rejected_at": datetime.utcnow().isoformat(),
                "reason": f"Exceeds {MAX_PAYLOAD_MB} MB limit"
            })
            return JSONResponse(
                status_code=413,
                content={"error": f"Payload exceeds {MAX_PAYLOAD_MB} MB limit", "governance": "enforced"}
            )

        if request.method in ("POST", "PUT", "PATCH"):
            if "/upload" in request.url.path or "/documents" in request.url.path:
                if "multipart/form-data" in request.headers.get("content-type", ""):
                    logger.warning(f"⛔ FILE UPLOAD REJECTED — {request.method} {request.url.path}")
                    REJECTED_PAYLOADS_LOG.append({
                        "path": request.url.path, "method": request.method,
                        "rejected_at": datetime.utcnow().isoformat(),
                        "reason": "File uploads not allowed on Render (local-first only)"
                    })
                    return JSONResponse(
                        status_code=403,
                        content={"error": "File uploads not allowed on Render relay. Use local machine.", "governance": "enforced"}
                    )

    response = await call_next(request)
    return response

GOVERNANCE_API_KEY = os.getenv("GOVERNANCE_API_KEY", "ashray-governance-admin")

async def verify_governance_key(request: Request):
    key = request.headers.get("x-governance-key") or request.query_params.get("key")
    if key != GOVERNANCE_API_KEY:
        raise HTTPException(status_code=403, detail="Unauthorized")

@app.post("/api/governance/rejected-payloads")
async def get_rejected_payloads(request: Request):
    await verify_governance_key(request)
    return {"rejected_count": len(REJECTED_PAYLOADS_LOG), "rejected": REJECTED_PAYLOADS_LOG[-50:]}

# -------------------------
# DATABASE SETUP
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL")

# Fallback for local testing or if env var is missing
if not DATABASE_URL:
    logger.warning("⚠️ DATABASE_URL not set! Using local SQLite. Data will be LOST on Render restart!")
    logger.warning("→ Set DATABASE_URL env var to a persistent PostgreSQL URL on Render dashboard.")
    logger.warning("→ Render provides a free PostgreSQL DB: https://dashboard.render.com/new/database")
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

class PendingReceiptModel(Base):
    __tablename__ = "pending_receipts"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class SettingsModel(Base):
    __tablename__ = "settings"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class StaffModel(Base):
    __tablename__ = "staff"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class ApplicationModel(Base):
    __tablename__ = "applications"
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

# --- DATABASE ENGINE ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def estimate_render_storage_bytes(db: Session) -> tuple[int, dict]:
    db_url = os.getenv("DATABASE_URL", "")
    tables = ["clients", "investors", "properties", "transactions", "docs", "documents", "referrals",
              "pending_receipts", "staff", "applications"]
    sizes = {}
    total = 0
    for table in tables:
        try:
            if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
                result = db.execute(text(f"SELECT pg_total_relation_size('{table}') as size")).scalar()
            else:
                rows = db.execute(text(f"SELECT COUNT(*) as cnt FROM {table}")).scalar()
                result = (rows or 0) * 500
            result = int(result or 0)
            sizes[table] = result
            total += result
        except Exception:
            db.rollback()
            sizes[table] = 0
    return total, sizes

def enforce_render_storage_budget(db: Session):
    total, _sizes = estimate_render_storage_bytes(db)
    if total >= MAX_RENDER_STORAGE_BYTES:
        raise HTTPException(
            status_code=507,
            detail=f"Render metadata storage budget reached ({MAX_RENDER_STORAGE_MB} MB). Local backend must handle further sync."
        )

# --- MULTI-MACHINE / COMPANY MODELS ---
class CompanyModel(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    syncKey = Column(String, nullable=False)
    machineId = Column(String, nullable=False)
    createdAt = Column(String, nullable=False)

class CloudMachineModel(Base):
    __tablename__ = "cloud_machines"
    id = Column(String, primary_key=True)
    machineId = Column(String, index=True, nullable=False)
    companyId = Column(String, index=True, nullable=False)
    name = Column(String, nullable=True)
    lanIP = Column(String, nullable=True)
    port = Column(Integer, default=3001)
    status = Column(String, default="Online")
    isRelayEligible = Column(Integer, default=1)
    isActiveRelay = Column(Integer, default=0)
    lastHeartbeat = Column(String, nullable=True)
    machineVersion = Column(String, nullable=True)

# --- COMPANY ENDPOINTS ---
@app.post("/api/company/create")
async def cloud_create_company(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        company_id = data.get("companyId")
        name = data.get("companyName")
        sync_key = data.get("syncKey")
        machine_id = data.get("machineId")
        if not all([company_id, name, sync_key, machine_id]):
            raise HTTPException(status_code=400, detail="Missing required fields")
        existing = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
        if existing:
            return {"status": "exists", "companyId": company_id}
        company = CompanyModel(id=company_id, name=name, syncKey=sync_key, machineId=machine_id, createdAt=datetime.utcnow().isoformat())
        db.add(company)
        db.commit()
        return {"status": "created", "companyId": company_id}
    except Exception as e:
        logger.error(f"Company create error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/company/verify")
async def cloud_verify_company(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        company_id = data.get("companyId")
        sync_key = data.get("syncKey")
        if not company_id or not sync_key:
            raise HTTPException(status_code=400, detail="Missing companyId or syncKey")
        company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
        if not company:
            return {"valid": False, "error": "Company not found"}
        if company.syncKey != sync_key:
            return {"valid": False, "error": "Invalid sync key"}
        machines = db.query(CloudMachineModel).filter(
            CloudMachineModel.companyId == company_id,
            CloudMachineModel.status == "Online"
        ).all()
        return {"valid": True, "companyName": company.name, "machineCount": len(machines), "machines": [{"machineId": m.machineId, "name": m.name, "lanIP": m.lanIP, "status": m.status} for m in machines]}
    except Exception as e:
        logger.error(f"Company verify error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/machine/register")
async def cloud_register_machine(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        machine_id = data.get("machineId")
        company_id = data.get("companyId")
        name = data.get("name", "Unknown")
        lan_ip = data.get("lanIP", "")
        port = data.get("port", 3001)
        machine_version = data.get("machineVersion", "1.0.0")
        if not all([machine_id, company_id]):
            raise HTTPException(status_code=400, detail="Missing machineId or companyId")
        existing = db.query(CloudMachineModel).filter(CloudMachineModel.machineId == machine_id).first()
        now = datetime.utcnow().isoformat()
        if existing:
            existing.lanIP = lan_ip
            existing.port = port
            existing.status = "Online"
            existing.lastHeartbeat = now
            existing.machineVersion = machine_version
            existing.name = name
        else:
            machine = CloudMachineModel(
                id=f"CM-{uuid.uuid4().hex[:8].upper()}",
                machineId=machine_id, companyId=company_id, name=name,
                lanIP=lan_ip, port=port, status="Online",
                isRelayEligible=1, isActiveRelay=0,
                lastHeartbeat=now, machineVersion=machine_version
            )
            db.add(machine)
        db.commit()
        return {"status": "registered", "machineId": machine_id}
    except Exception as e:
        logger.error(f"Machine register error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/machine/heartbeat")
async def cloud_machine_heartbeat(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        machine_id = data.get("machineId")
        company_id = data.get("companyId")
        if not machine_id or not company_id:
            raise HTTPException(status_code=400, detail="Missing machineId or companyId")
        machine = db.query(CloudMachineModel).filter(
            CloudMachineModel.machineId == machine_id,
            CloudMachineModel.companyId == company_id
        ).first()
        if not machine:
            raise HTTPException(status_code=404, detail="Machine not found")
        machine.lastHeartbeat = datetime.utcnow().isoformat()
        machine.status = "Online"
        machine.lanIP = data.get("lanIP", machine.lanIP)
        machine.isActiveRelay = 1 if data.get("isActiveRelay") else 0
        db.commit()
        return {"status": "ok", "lastHeartbeat": machine.lastHeartbeat}
    except Exception as e:
        logger.error(f"Heartbeat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/machine/relay-report")
async def cloud_relay_report(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        company_id = data.get("companyId")
        relay_machine_id = data.get("relayMachineId")
        if not company_id or not relay_machine_id:
            raise HTTPException(status_code=400, detail="Missing fields")
        db.query(CloudMachineModel).filter(
            CloudMachineModel.companyId == company_id
        ).update({"isActiveRelay": 0})
        db.query(CloudMachineModel).filter(
            CloudMachineModel.machineId == relay_machine_id,
            CloudMachineModel.companyId == company_id
        ).update({"isActiveRelay": 1})
        db.commit()
        return {"status": "relay_updated", "relayMachineId": relay_machine_id}
    except Exception as e:
        logger.error(f"Relay report error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/machines")
async def cloud_list_machines(companyId: str = None, db: Session = Depends(get_db)):
    try:
        q = db.query(CloudMachineModel)
        if companyId:
            q = q.filter(CloudMachineModel.companyId == companyId)
        machines = q.order_by(CloudMachineModel.lastHeartbeat.desc()).all()
        return [{"machineId": m.machineId, "name": m.name, "lanIP": m.lanIP, "port": m.port,
                 "status": m.status, "isRelayEligible": bool(m.isRelayEligible),
                 "isActiveRelay": bool(m.isActiveRelay), "lastHeartbeat": m.lastHeartbeat,
                 "machineVersion": m.machineVersion} for m in machines]
    except Exception as e:
        logger.error(f"List machines error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- GOVERNANCE STORAGE ESTIMATE ---
@app.get("/api/governance/storage-estimate")
async def governance_storage_estimate(db: Session = Depends(get_db)):
    total, sizes = estimate_render_storage_bytes(db)
    return {"estimated_bytes": total, "estimated_mb": round(total / (1024 * 1024), 2),
            "table_sizes": sizes, "max_mb": MAX_PAYLOAD_MB, "max_render_storage_mb": MAX_RENDER_STORAGE_MB,
            "storage_budget_status": "ok" if total < MAX_RENDER_STORAGE_BYTES else "blocked",
            "metadata_only": RENDER_METADATA_ONLY, "governance": "active",
            "governance_info": "Render stores metadata only. All files remain local."}

# --- HEALTH CHECK (for Render cold start detection) ---
@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "degraded", "database": str(e)}

# --- KEEP-ALIVE BACKGROUND TASK (prevents Render free-tier spin-down) ---
KEEP_ALIVE_URL = "https://ashray-backend-2nt7.onrender.com/api/health"

async def keep_alive():
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

# --- HELPER FOR GENERIC CRUD ---
async def generic_upsert(request: Request, model, db: Session):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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
    return [i.data for i in items if i.data is not None]

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

# --- DOCUMENT/FILE ENDPOINTS (Filesystem Storage) ---
@app.get("/api/doc/all")
@app.get("/api/files")
def get_all_docs(db: Session = Depends(get_db)):
    all_docs = []
    physical = db.query(DocumentModel).filter(DocumentModel.is_deleted == 0).all()
    for d in physical:
        all_docs.append({
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
        })
    migrated_ids = {r[0] for r in db.query(DocumentModel.id).all()}
    old_docs = db.query(DocModel).all()
    for d in old_docs:
        if d.data is None or d.id in migrated_ids:
            continue
        all_docs.append(strip_binary_deep(d.data))
    return all_docs

@app.post("/api/doc/upsert")
@app.post("/api/documents")
async def upsert_doc(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json()) if RENDER_METADATA_ONLY else await request.json()
    except Exception:
        return await upload_document_v2(request, db)
    if data.get("type") == "virtual" or data.get("is_virtual"):
        doc_id = data.get("id") or f"doc_{int(datetime.utcnow().timestamp())}"
        data["id"] = doc_id
        data = strip_binary_deep(data)
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
        ))
        db.commit()
    # Handle fileData base64: save to disk if present
    file_data_raw = None if RENDER_METADATA_ONLY else data.get("fileData")
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
    enforce_render_storage_budget(db)
    data = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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

# --- STAFF ENDPOINTS ---
@app.post("/api/staff/upsert")
async def upsert_staff(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
    except Exception as e:
        logger.error(f"Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    staff_id = data.get("id")
    if not staff_id:
        raise HTTPException(status_code=400, detail="Staff ID missing")
    
    existing = db.query(StaffModel).filter(StaffModel.id == staff_id).first()
    if existing:
        existing.data = data
    else:
        new_staff = StaffModel(id=staff_id, data=data)
        db.add(new_staff)
    
    db.commit()
    return {"status": "success", "id": staff_id}

@app.get("/api/staff/all")
def get_all_staff(db: Session = Depends(get_db)):
    staff_list = db.query(StaffModel).all()
    return [s.data for s in staff_list if s.data is not None]

@app.post("/api/staff/bulk-upsert")
async def bulk_upsert_staff(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of staff")
        
        for data in data_list:
            staff_id = data.get("id")
            if not staff_id: continue
            existing = db.query(StaffModel).filter(StaffModel.id == staff_id).first()
            if existing:
                existing.data = data
            else:
                db.add(StaffModel(id=staff_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Staff Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/staff/delete/{staff_id}")
def delete_staff(staff_id: str, db: Session = Depends(get_db)):
    if not staff_id:
        raise HTTPException(status_code=400, detail="Staff ID missing")
        
    staff = db.query(StaffModel).filter(StaffModel.id == staff_id).first()
    if staff:
        db.delete(staff)
        db.commit()
    return {"status": "deleted"}

# --- APPLICATION ENDPOINTS ---
@app.post("/api/application/upsert")
async def upsert_application(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
    except Exception as e:
        logger.error(f"Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    app_id = data.get("id")
    if not app_id:
        raise HTTPException(status_code=400, detail="Application ID missing")
    
    existing = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if existing:
        existing.data = data
    else:
        new_app = ApplicationModel(id=app_id, data=data)
        db.add(new_app)
    
    db.commit()
    return {"status": "success", "id": app_id}

@app.get("/api/application/all")
def get_all_applications(db: Session = Depends(get_db)):
    app_list = db.query(ApplicationModel).all()
    return [a.data for a in app_list if a.data is not None]

@app.post("/api/application/bulk-upsert")
async def bulk_upsert_application(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
        if not isinstance(data_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of applications")
        
        for data in data_list:
            app_id = data.get("id")
            if not app_id: continue
            existing = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
            if existing:
                existing.data = data
            else:
                db.add(ApplicationModel(id=app_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Application Bulk Upsert Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/application/delete/{app_id}")
def delete_application(app_id: str, db: Session = Depends(get_db)):
    if not app_id:
        raise HTTPException(status_code=400, detail="Application ID missing")
        
    app = db.query(ApplicationModel).filter(ApplicationModel.id == app_id).first()
    if app:
        db.delete(app)
        db.commit()
    return {"status": "deleted"}

# --- DOC SERVE & DOWNLOAD ENDPOINTS ---
@app.get("/api/doc/serve/{doc_id}")
async def serve_doc(doc_id: str, db: Session = Depends(get_db)):
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
    fd = doc_old.data["fileData"]
    h, e = fd.split(",", 1)
    d = base64.b64decode(e)
    return Response(content=d, media_type=h.split(":")[1].split(";")[0])

# --- SETTINGS ENDPOINTS ---
@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    try:
        setting = db.query(SettingsModel).filter(SettingsModel.id == "main").first()
        if setting and setting.data:
            return setting.data
        fallback = db.query(SettingsModel).first()
        if fallback and fallback.data:
            return fallback.data
        return {}
    except Exception as e:
        logger.error(f"Failed to fetch settings: {str(e)}")
        return {}

@app.post("/api/settings")
async def upsert_settings(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
    except Exception as e:
        logger.error(f"Failed to parse settings JSON: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    setting = db.query(SettingsModel).filter(SettingsModel.id == "main").first()
    if setting:
        setting.data = data
    else:
        db.add(SettingsModel(id="main", data=data))
    db.commit()
    return {"status": "success"}

# --- CLIENT ENDPOINTS ---
@app.post("/api/client/upsert")
async def upsert_client(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
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
    clients = db.query(ClientModel).all()
    return [c.data for c in clients if c.data is not None]

@app.post("/api/client/bulk-upsert")
async def bulk_upsert_clients(request: Request, db: Session = Depends(get_db)):
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        raw_list = await request.json()
        if not isinstance(raw_list, list):
            raise HTTPException(status_code=400, detail="Expected a list of docs")
        data_list = []
        for item in raw_list:
            if item.get("category") == "RECEIPT":
                data_list.append(item)
            elif RENDER_METADATA_ONLY:
                data_list.append(strip_binary_deep(item))
            else:
                data_list.append(item)
        logger.info(f"Bulk Upsert Docs: Received {len(data_list)} items")
        for data in data_list:
            doc_id = data.get("id")
            if not doc_id: continue
            if data.get("type") == "virtual" or data.get("is_virtual"):
                existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
                safe_data = strip_binary_deep(data)
                if existing: existing.data = safe_data
                else: db.add(DocModel(id=doc_id, data=safe_data))
                continue
            fdb64 = data.get("fileData")
            if fdb64 and isinstance(fdb64, str) and fdb64.startswith("data:"):
                try:
                    mime = fdb64.split(":")[1].split(";")[0]
                    raw = base64.b64decode(fdb64.split(",", 1)[1])
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
                else:
                    db.add(DocumentModel(
                        id=doc_id, original_name=data.get("name") or data.get("file_name") or doc_id,
                        clientId=data.get("clientId"), investorId=data.get("investorId"),
                        loanId=data.get("loanId"), kissanId=data.get("kissanId"), staffId=data.get("staffId"),
                        category=data.get("category"), category_id=data.get("category_id"), folder_id=data.get("folder_id"),
                        date=data.get("date"), created_at=data.get("created_at") or now, updated_at=now,
                        mime_type=data.get("mime_type"), is_virtual=0,
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
    enforce_render_storage_budget(db)
    try:
        data = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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
    enforce_render_storage_budget(db)
    try:
        data_list = strip_binary_deep(await request.json())
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
        login_id = data.get("username")
        password = data.get("password")

        logger.info(f"🔐 Login attempt: {login_id}")

        if not login_id or not password:
            return JSONResponse(status_code=400, content={"message": "ID and Password required"})

        # =========================================================
        # 1. CHECK CLIENTS
        # =========================================================
        all_clients = db.query(ClientModel).all()

        for client in all_clients:
            c = client.data
            if not isinstance(c, dict):
                continue

            if (
                c.get("username") == login_id or
                c.get("phone") == login_id or
                c.get("name") == login_id
            ):
                if c.get("password") == password:
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
                    c["docs"] = [strip_binary_deep(d.data) for d in all_docs_old if d.data and d.data.get("clientId") == client_id]
                    for d in all_docs_new:
                        c["docs"].append({
                            "id": d.id, "name": d.original_name, "file_name": d.original_name,
                            "clientId": d.clientId, "category": d.category, "type": "file",
                            "date": d.date, "mime_type": d.mime_type, "size": d.size,
                            "has_file": True, "fileData": None,
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
        # 2. CHECK INVESTORS
        # =========================================================
        all_investors = db.query(InvestorModel).all()

        for investor in all_investors:
            i = investor.data
            if not isinstance(i, dict):
                continue

            if (
                i.get("username") == login_id or
                i.get("phone") == login_id or
                i.get("email") == login_id
            ):
                if i.get("password") == password:
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
                    i["docs"] = [strip_binary_deep(d.data) for d in all_docs_old if d.data and d.data.get("investorId") == investor_id]
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
        # 3. NOT FOUND
        # =========================================================
        logger.warning(f"❌ LOGIN FAILED: {login_id}")
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})

    except Exception as e:
        logger.error(f"❌ LOGIN ERROR: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})
    

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
