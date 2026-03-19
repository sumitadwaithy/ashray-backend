from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# MODELS
# -------------------------

class Property(BaseModel):
    id: str
    title: str
    price: float
    plotSize: float
    locality: str
    city: str
    description: str
    images: List[str] = []
    inventory: List = []
    updatedAt: str = None


# -------------------------
# IN-MEMORY DATABASE
# -------------------------

db = {}


# -------------------------
# ROUTES
# -------------------------

@app.get("/")
def root():
    return {"status": "API LIVE"}


@app.post("/local/property/upsert")
def upsert_property(property: Property):
    property.updatedAt = datetime.utcnow().isoformat()
    db[property.id] = property
    return property


@app.get("/local/property/all")
def get_all_properties():
    return list(db.values())
