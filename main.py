from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import Column, String, create_engine, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os
import logging

# Setup logging to help debug
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# --- 1. ROBUST CORS (Fixed for Credentials) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=False, # Set to False to allow "*" origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATABASE SETUP ---
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 3. MODELS (Simplified to prevent schema crashes) ---
class PropertyModel(Base):
    __tablename__ = "properties"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON) 
    last_updated = Column(DateTime, default=datetime.utcnow)

class ClientModel(Base):
    __tablename__ = "clients"
    id = Column(String, primary_key=True, index=True)
    data = Column(JSON) # We store everything here to be safe
    last_updated = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "Ashray Group Backend is Live"}

# --- 4. PROPERTY ENDPOINTS ---
@app.post("/api/property/upsert")
def upsert_property(property_data: dict, db: Session = Depends(get_db)):
    pid = property_data.get("id")
    db_prop = db.query(PropertyModel).filter(PropertyModel.id == pid).first()
    if db_prop:
        db_prop.data = property_data
        db_prop.last_updated = datetime.utcnow()
    else:
        new_prop = PropertyModel(id=pid, data=property_data)
        db.add(new_prop)
    db.commit()
    return {"status": "success"}

@app.get("/api/property/all")
def get_all_properties(db: Session = Depends(get_db)):
    props = db.query(PropertyModel).all()
    return [p.data for p in props]

@app.delete("/api/property/delete/{property_id}")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    db.query(PropertyModel).filter(PropertyModel.id == property_id).delete()
    db.commit()
    return {"status": "deleted"}

# --- 5. CLIENT ENDPOINTS ---
@app.post("/api/client/upsert")
def upsert_client(client_data: dict, db: Session = Depends(get_db)):
    cid = client_data.get("id")
    db_client = db.query(ClientModel).filter(ClientModel.id == cid).first()
    if db_client:
        db_client.data = client_data
        db_client.last_updated = datetime.utcnow()
    else:
        new_client = ClientModel(id=cid, data=client_data)
        db.add(new_client)
    db.commit()
    return {"status": "success"}

@app.get("/api/client/all")
def get_all_clients(db: Session = Depends(get_db)):
    clients = db.query(ClientModel).all()
    return [c.data for c in clients]

# --- 6. CRASH-PROOF LOGIN LOGIC ---
@app.post("/api/client/login")
async def client_login(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        login_id = data.get("username")
        password = data.get("password")
        
        if not login_id or not password:
            return JSONResponse(status_code=400, content={"message": "ID and Password required"})

        # We search inside the JSON 'data' column for every client
        # This prevents "Column not found" errors
        all_clients = db.query(ClientModel).all()
        for client in all_clients:
            c = client.data
            # Check if ID matches username OR phone, and password matches
            if (c.get("username") == login_id or c.get("phone") == login_id) and c.get("password") == password:
                return {
                    "status": "success",
                    "client_info": c
                }
        
        return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
    except Exception as e:
        logger.error(f"Login Error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error", "details": str(e)})
