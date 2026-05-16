import base64
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, DateTime, Integer, JSON
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

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
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
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

# --- DOCUMENT/FILE ENDPOINTS ---
@app.get("/api/doc/all")
@app.get("/api/files")
def get_all_docs(db: Session = Depends(get_db)):
    docs = db.query(DocModel).all()
    return [d.data for d in docs if d.data is not None]

@app.post("/api/doc/upsert")
@app.post("/api/documents")
async def upsert_doc(request: Request, db: Session = Depends(get_db)):
    # Handle both JSON and FormData
    content_type = request.headers.get("content-type", "")
    if "multipart/form-data" in content_type:
        from fastapi import UploadFile, File, Form
        # This is handled by a separate endpoint usually, but let's see
        pass
    
    try:
        data = await request.json()
    except Exception as e:
        # If it's not JSON, it might be FormData handled by /api/doc/upload
        return await upload_document_v2(request, db)
        
    doc_id = data.get("id")
    if not doc_id:
        doc_id = f"doc_{int(datetime.utcnow().timestamp())}"
        data["id"] = doc_id
    
    existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if existing:
        existing.data = data
    else:
        new_doc = DocModel(id=doc_id, data=data)
        db.add(new_doc)
    
    db.commit()
    return data

@app.patch("/api/files/{doc_id}")
async def patch_doc(doc_id: str, request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="File not found")
    
    current_data = existing.data or {}
    current_data.update(data)
    existing.data = current_data
    db.commit()
    return existing.data

@app.delete("/api/doc/delete/{doc_id}")
@app.delete("/api/files/{doc_id}")
def delete_doc(doc_id: str, permanent: bool = False, db: Session = Depends(get_db)):
    doc = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if doc:
        if permanent:
            db.delete(doc)
        else:
            data = doc.data.copy()
            data["is_deleted"] = 1
            doc.data = data
        db.commit()
    return {"status": "deleted" if permanent else "moved_to_trash"}

@app.get("/api/files/{doc_id}/content")
def get_file_content(doc_id: str, db: Session = Depends(get_db)):
    doc = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not doc or not doc.data.get("fileData"):
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = doc.data.get("fileData")
    header, encoded = file_data.split(",", 1)
    decoded = base64.b64decode(encoded)
    media_type = header.split(":")[1].split(";")[0]
    return Response(content=decoded, media_type=media_type)

async def upload_document_v2(
    request: Request,
    db: Session = Depends(get_db)
):
    from fastapi import UploadFile, File, Form
    form = await request.form()
    file = form.get("file")
    if not isinstance(file, UploadFile):
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    name = form.get("name") or file.filename
    file_type = form.get("type") or file.content_type
    folder_id = form.get("folder_id")
    category_id = form.get("category_id")
    
    file_content = await file.read()
    base64_data = base64.b64encode(file_content).decode("utf-8")
    
    doc_id = f"doc_{int(datetime.utcnow().timestamp())}_{file.filename}"
    doc_data = {
        "id": doc_id,
        "name": name,
        "type": file_type,
        "size": len(file_content),
        "folder_id": int(folder_id) if folder_id and folder_id != 'null' else None,
        "category_id": int(category_id) if category_id and category_id != 'null' else None,
        "is_starred": 0,
        "is_deleted": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "fileData": f"data:{file_type};base64,{base64_data}"
    }

    db.add(DocModel(id=doc_id, data=doc_data))
    db.commit()
    return doc_data

@app.delete("/api/trash/empty")
def empty_trash(db: Session = Depends(get_db)):
    # Delete all docs marked as deleted
    all_docs = db.query(DocModel).all()
    for d in all_docs:
        if d.data.get("is_deleted"):
            db.delete(d)
    
    db.commit()
    return {"status": "success"}

@app.post("/api/files/{doc_id}/duplicate")
def duplicate_file(doc_id: str, db: Session = Depends(get_db)):
    existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="File not found")
    
    new_data = existing.data.copy()
    new_id = f"doc_{int(datetime.utcnow().timestamp())}_copy_{existing.id}"
    new_data["id"] = new_id
    new_data["name"] = f"Copy of {new_data['name']}"
    new_data["created_at"] = datetime.utcnow().isoformat()
    
    new_doc = DocModel(id=new_id, data=new_data)
    db.add(new_doc)
    db.commit()
    return new_data

# -------------------------
# ENDPOINTS
# -------------------------

@app.get("/")
def read_root():
    db_type = "SQLite (EPHEMERAL)" if "sqlite" in DATABASE_URL else "PostgreSQL (Persistent)"
    return {
        "status": "Ashray Backend is Running",
        "database": db_type,
        "hint": "Redeploy after setting DATABASE_URL to a PostgreSQL DB for persistent storage" if "sqlite" in DATABASE_URL else None
    }

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
    clients = db.query(ClientModel).all()
    return [c.data for c in clients if c.data is not None]

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
            existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
            if existing:
                existing.data = data
            else:
                db.add(DocModel(id=doc_id, data=data))
        db.commit()
        return {"status": "success", "count": len(data_list)}
    except Exception as e:
        logger.error(f"Bulk Upsert Docs Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/doc/upload")
async def upload_document(
    file: UploadFile = File(...),
    clientId: str = None,
    db: Session = Depends(get_db)
):
    file_content = await file.read()
    base64_data = base64.b64encode(file_content).decode("utf-8")
    
    doc_data = {
        "id": f"doc_{int(datetime.utcnow().timestamp())}",
        "name": file.filename,
        "file_name": file.filename,
        "clientId": clientId,
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "fileData": f"data:{file.content_type};base64,{base64_data}"
    }

    db.add(DocModel(id=doc_data["id"], data=doc_data))
    db.commit()

    return doc_data

@app.get("/api/doc/view/{filename}")
def view_document(filename: str, db: Session = Depends(get_db)):
    logger.info(f"🔍 Attempting to view document: {filename}")
    
    # Fetch all docs and filter in Python to avoid DB-specific JSON query issues
    all_docs = db.query(DocModel).all()
    doc = None
    for d in all_docs:
        if d.data.get("name") == filename:
            doc = d
            break
            
    if not doc:
        logger.warning(f"⚠️ Document not found in DB: {filename}")
        for d in all_docs:
            logger.info(f"📄 Doc in DB: {d.data.get('name')}")
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = doc.data.get("fileData")
    if not file_data:
        logger.warning(f"⚠️ File data not found for doc: {filename}")
        raise HTTPException(status_code=404, detail="File data not found")
    
    # Decode base64
    header, encoded = file_data.split(",", 1)
    decoded = base64.b64decode(encoded)
    
    # Extract content type from header (e.g., data:image/png;base64)
    media_type = header.split(":")[1].split(";")[0]
    
    return Response(content=decoded, media_type=media_type)

@app.get("/api/doc/download/{filename}")
def download_document(filename: str, db: Session = Depends(get_db)):
    logger.info(f"🔍 Attempting to download document: {filename}")
    
    # Fetch all docs and filter in Python to avoid DB-specific JSON query issues
    all_docs = db.query(DocModel).all()
    doc = None
    for d in all_docs:
        if d.data.get("name") == filename:
            doc = d
            break
            
    if not doc:
        logger.warning(f"⚠️ Document not found in DB: {filename}")
        raise HTTPException(status_code=404, detail="File not found")
    
    file_data = doc.data.get("fileData")
    if not file_data:
        logger.warning(f"⚠️ File data not found for doc: {filename}")
        raise HTTPException(status_code=404, detail="File data not found")
    
    # Decode base64
    header, encoded = file_data.split(",", 1)
    decoded = base64.b64decode(encoded)
    
    # Extract content type from header
    media_type = header.split(":")[1].split(";")[0]
    
    return Response(content=decoded, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})

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
                c.get("phone") == login_id
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

                    # Attach docs
                    all_docs = db.query(DocModel).all()
                    c["docs"] = [
                        d.data for d in all_docs
                        if d.data and d.data.get("clientId") == client_id
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

                    # Attach docs
                    all_docs = db.query(DocModel).all()
                    i["docs"] = [
                        d.data for d in all_docs
                        if d.data and d.data.get("investorId") == investor_id
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
