from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, JSON, DateTime, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
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
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

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

Base.metadata.create_all(bind=engine)

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
    data = await request.json()
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
    return [p.data for p in props]

@app.delete("/api/property/delete/{prop_id}")
def delete_property(prop_id: str, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == prop_id).first()
    if prop:
        db.delete(prop)
        db.commit()
    return {"status": "deleted"}

# --- CLIENT ENDPOINTS ---
@app.post("/api/client/upsert")
async def upsert_client(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
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
    return [c.data for c in clients]

@app.post("/api/client/login")
async def client_login(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        login_id = data.get("username")
        password = data.get("password")
        
        logger.info(f"Login attempt for ID: {login_id}")
        
        if not login_id or not password:
            return JSONResponse(status_code=400, content={"message": "ID and Password required"})

        all_clients = db.query(ClientModel).all()
        logger.info(f"Checking through {len(all_clients)} clients in database...")
        
        for client in all_clients:
            c = client.data
            client_username = c.get("username")
            client_phone = c.get("phone")
            client_password = c.get("password")
            
            # Check if ID matches username OR phone, and password matches
            if (client_username == login_id or client_phone == login_id):
                if client_password == password:
                    logger.info(f"✅ Login successful for: {login_id}")
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
