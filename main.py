from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, DateTime, Integer, JSON
from sqlalchemy.orm import sessionmaker, Session, declarative_base
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
    logger.warning("⚠️ DATABASE_URL not found! Falling back to local SQLite (data will not persist on Render).")
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

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables initialized.")
except Exception as e:
    logger.error(f"❌ Failed to create tables: {str(e)}")

# -------------------------
# DEPENDENCY
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# ENDPOINTS
# -------------------------

@app.get("/")
def read_root():
    return {"status": "Ashray Backend is Running"}

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

# --- DOCUMENT ENDPOINTS ---
@app.post("/api/doc/upsert")
async def upsert_doc(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
    except Exception as e:
        logger.error(f"❌ Failed to parse JSON body: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    doc_id = data.get("id")
    if not doc_id:
        raise HTTPException(status_code=400, detail="Document ID missing")
    
    existing = db.query(DocModel).filter(DocModel.id == doc_id).first()
    if existing:
        existing.data = data
    else:
        new_doc = DocModel(id=doc_id, data=data)
        db.add(new_doc)
    
    db.commit()
    return {"status": "success", "id": doc_id}

@app.get("/api/doc/all")
def get_all_docs(db: Session = Depends(get_db)):
    docs = db.query(DocModel).all()
    return [d.data for d in docs if d.data is not None]

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

# --- LOGIN ENDPOINT ---
@app.post("/api/client/login")
async def client_login(request: Request, db: Session = Depends(get_db)):
    try:
        try:
            data = await request.json()
        except Exception as e:
            logger.error(f"❌ Failed to parse JSON body: {str(e)}")
            return JSONResponse(status_code=400, content={"message": "Invalid JSON body"})
            
        login_id = data.get("username")
        password = data.get("password")
        
        logger.info(f"Login attempt for ID: {login_id}")
        
        if not login_id or not password:
            return JSONResponse(status_code=400, content={"message": "ID and Password required"})

        all_clients = db.query(ClientModel).all()
        if all_clients is None:
            all_clients = []
            
        logger.info(f"Checking through {len(all_clients)} clients in database...")
        
        for client in all_clients:
            c = client.data
            if not isinstance(c, dict):
                logger.warning(f"⚠️ Skipping malformed client data for ID: {client.id}")
                continue
                
            client_username = c.get("username")
            client_phone = c.get("phone")
            client_password = c.get("password")
            
            # Check if ID matches username OR phone, and password matches
            if (client_username == login_id or client_phone == login_id):
                if client_password == password:
                    logger.info(f"✅ Login successful for: {login_id}")
                    
                    # Fetch additional data for this client
                    client_id = c.get("id")
                    
                    # Get transactions for this client
                    all_txs = db.query(TransactionModel).all()
                    client_txs = [t.data for t in all_txs if t.data and t.data.get("clientId") == client_id]
                    
                    # Get referrals for this client
                    all_refs = db.query(ReferralModel).all()
                    client_refs = [r.data for r in all_refs if r.data and r.data.get("referrerClientId") == client_id]
                    
                    # Get docs for this client
                    all_docs = db.query(DocModel).all()
                    client_docs = [d.data for d in all_docs if d.data and d.data.get("clientId") == client_id]
                    
                    # Attach to client info
                    c["transactions"] = client_txs
                    c["referrals"] = client_refs
                    c["docs"] = client_docs
                    
                    return {
                        "status": "success",
                        "client_info": c
                    }
                else:
                    logger.warning(f"❌ Password mismatch for: {login_id}. Expected: {client_password}, Got: {password}")
        
        logger.warning(f"❌ No client found matching ID: {login_id}")
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    except Exception as e:
        logger.error(f"Login Error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error", "details": str(e)})
