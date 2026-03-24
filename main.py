from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import JSON
from datetime import datetime
import os

app = FastAPI(title="Ashray Group Cloud API")

# -------------------------
# CORS CONFIGURATION (SECURE)
# -------------------------
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ashraygroup.in",
    "https://www.ashraygroup.in",
    # Add your AI Studio Preview URL so sync works during development
    "https://ais-dev-ptg7ueqquqvmy2vuflbqsr-49739867371.asia-east1.run.app",
    "https://ais-pre-ptg7ueqquqvmy2vuflbqsr-49739867371.asia-east1.run.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# DATABASE SETUP (PostgreSQL / Render)
# -------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# -------------------------
# DB SESSION
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# MODELS
# -------------------------
class PropertyDB(Base):
    __tablename__ = "properties"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)

class ClientDB(Base):
    __tablename__ = "clients"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, index=True)
    password = Column(String)
    data = Column(JSON)

Base.metadata.create_all(bind=engine)

# -------------------------
# ROUTES
# -------------------------

@app.get("/")
def root():
    return {"status": "Ashray Group API is Online", "timestamp": datetime.utcnow()}

# --- PROPERTY SYNC ---

@app.post("/api/property/upsert")
def upsert_property(payload: dict, db: Session = Depends(get_db)):
    payload["lastSynced"] = datetime.utcnow().isoformat()
    
    existing = db.query(PropertyDB).filter(PropertyDB.id == payload["id"]).first()
    if existing:
        existing.data = payload
    else:
        db.add(PropertyDB(id=payload["id"], data=payload))
    
    db.commit()
    return {"status": "success", "id": payload["id"]}

@app.get("/api/property/all")
def get_all_properties(db: Session = Depends(get_db)):
    return [p.data for p in db.query(PropertyDB).all()]

@app.delete("/api/property/delete/{property_id}")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    db.query(PropertyDB).filter(PropertyDB.id == property_id).delete()
    db.commit()
    return {"status": "deleted"}

# --- CLIENT SYNC & PORTAL ---

@app.post("/api/client/upsert")
def upsert_client(payload: dict, db: Session = Depends(get_db)):
    payload["lastSynced"] = datetime.utcnow().isoformat()
    
    existing = db.query(ClientDB).filter(ClientDB.id == payload["id"]).first()
    
    name = payload.get("name", "")
    phone = payload.get("phone", "")
    password = payload.get("password", "ashray123")

    if existing:
        existing.name = name
        existing.phone = phone
        existing.password = password
        existing.data = payload
    else:
        db.add(ClientDB(
            id=payload["id"],
            name=name,
            phone=phone,
            password=password,
            data=payload
        ))

    db.commit()
    return {"status": "success", "message": f"Client {name} synced to portal"}

@app.post("/api/client/login")
def client_login(payload: dict, db: Session = Depends(get_db)):
    phone = payload.get("phone")
    password = payload.get("password")

    client = db.query(ClientDB).filter(ClientDB.phone == phone).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if client.password != password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return client.data

@app.get("/api/client/all")
def get_all_clients(db: Session = Depends(get_db)):
    return [c.data for c in db.query(ClientDB).all()]

@app.delete("/api/client/delete/{client_id}")
def delete_client(client_id: str, db: Session = Depends(get_db)):
    db.query(ClientDB).filter(ClientDB.id == client_id).delete()
    db.commit()
    return {"status": "deleted"}
