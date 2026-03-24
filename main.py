from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI()

# -------------------------
# FIXED CORS CONFIGURATION
# -------------------------
# Using allow_origin_regex allows credentials to work with any origin
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# DATABASE SETUP
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
# Fix for Render's postgres:// vs postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

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
    last_updated = Column(DateTime, default=datetime.utcnow)

class ClientModel(Base):
    __tablename__ = "clients"
    id = Column(String, primary_key=True, index=True)
    phone = Column(String, index=True)
    username = Column(String, index=True)
    password = Column(String) 
    data = Column(JSON) 
    last_updated = Column(DateTime, default=datetime.utcnow)

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
    return {"status": "Ashray Group Backend is Live"}

# --- Property Sync ---
@app.post("/api/property/upsert")
def upsert_property(property_data: dict, db: Session = Depends(get_db)):
    pid = property_data.get("id")
    if not pid:
        raise HTTPException(status_code=400, detail="Property ID is required")
    
    db_prop = db.query(PropertyModel).filter(PropertyModel.id == pid).first()
    if db_prop:
        db_prop.data = property_data
        db_prop.last_updated = datetime.utcnow()
    else:
        new_prop = PropertyModel(id=pid, data=property_data)
        db.add(new_prop)
    
    db.commit()
    return {"status": "success", "id": pid}

@app.get("/api/property/all")
def get_all_properties(db: Session = Depends(get_db)):
    props = db.query(PropertyModel).all()
    return [p.data for p in props]

@app.delete("/api/property/delete/{property_id}")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    db.query(PropertyModel).filter(PropertyModel.id == property_id).delete()
    db.commit()
    return {"status": "deleted"}

# --- Client Sync & Portal ---
@app.post("/api/client/upsert")
def upsert_client(client_data: dict, db: Session = Depends(get_db)):
    cid = client_data.get("id")
    phone = client_data.get("phone")
    username = client_data.get("username")
    password = client_data.get("password", "ashray123")
    
    if not cid:
        raise HTTPException(status_code=400, detail="Client ID is required")
    
    db_client = db.query(ClientModel).filter(ClientModel.id == cid).first()
    if db_client:
        db_client.phone = phone
        db_client.username = username
        db_client.data = client_data
        db_client.password = password
        db_client.last_updated = datetime.utcnow()
    else:
        new_client = ClientModel(id=cid, phone=phone, username=username, password=password, data=client_data)
        db.add(new_client)
    
    db.commit()
    return {"status": "success", "id": cid}

@app.get("/api/client/all")
def get_all_clients(db: Session = Depends(get_db)):
    clients = db.query(ClientModel).all()
    return [c.data for c in clients]

# --- FIXED LOGIN ENDPOINT ---
@app.post("/api/client/login")
async def client_login(data: dict, db: Session = Depends(get_db)):
    login_id = data.get("username") # This can be ID or Phone
    password = data.get("password")
    
    if not login_id or not password:
        return JSONResponse(status_code=400, content={"message": "ID and Password required"})

    # Search by username OR phone number
    client = db.query(ClientModel).filter(
        (ClientModel.username == login_id) | (ClientModel.phone == login_id)
    ).first()

    if client and client.password == password:
        return {
            "status": "success",
            "client_info": client.data
        }
    
    return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
