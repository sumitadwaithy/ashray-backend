from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Float, JSON
from database import Base, engine, SessionLocal
from datetime import datetime
import json

app = FastAPI()

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://ashraygroup.in",
        "https://www.ashraygroup.in"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# DB INIT
# -------------------------
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# PROPERTY TABLE
# -------------------------
class PropertyDB(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True, index=True)
    data = Column(JSON)


# -------------------------
# CLIENT TABLE (PRIVATE CONTROL)
# -------------------------
class ClientDB(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    password = Column(String)
    data = Column(JSON)


# -------------------------
# ROUTES
# -------------------------

@app.get("/")
def root():
    return {"status": "API LIVE"}


# -------------------------
# PROPERTY ROUTES
# -------------------------

@app.post("/local/property/upsert")
def upsert_property(payload: dict, db: Session = Depends(get_db)):
    payload["updatedAt"] = datetime.utcnow().isoformat()

    existing = db.query(PropertyDB).filter(PropertyDB.id == payload["id"]).first()

    if existing:
        existing.data = payload
    else:
        db.add(PropertyDB(id=payload["id"], data=payload))

    db.commit()
    return payload


@app.get("/local/property/all")
def get_properties(db: Session = Depends(get_db)):
    return [p.data for p in db.query(PropertyDB).all()]


@app.delete("/local/property/delete/{property_id}")
def delete_property(property_id: str, db: Session = Depends(get_db)):
    db.query(PropertyDB).filter(PropertyDB.id == property_id).delete()
    db.commit()
    return {"status": "deleted"}


# -------------------------
# CLIENT ROUTES (SECURE)
# -------------------------

@app.post("/client/upsert")
def upsert_client(payload: dict, db: Session = Depends(get_db)):
    existing = db.query(ClientDB).filter(ClientDB.id == payload["id"]).first()

    if existing:
        existing.name = payload["name"]
        existing.phone = payload["phone"]
        existing.password = payload["password"]
        existing.data = payload
    else:
        db.add(ClientDB(
            id=payload["id"],
            name=payload["name"],
            phone=payload["phone"],
            password=payload["password"],
            data=payload
        ))

    db.commit()
    return {"status": "saved"}


@app.post("/client/login")
def client_login(payload: dict, db: Session = Depends(get_db)):
    client = db.query(ClientDB).filter(
        ClientDB.phone == payload["phone"]
    ).first()

    if not client:
        return {"error": "Client not found"}

    # 🔥 PASSWORD CHECK
    if payload.get("password") and client.password != payload["password"]:
        return {"error": "Invalid password"}

    return client.data
