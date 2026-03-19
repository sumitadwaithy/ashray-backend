from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime

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
# IN-MEMORY DATABASE
# -------------------------
db: Dict[str, dict] = {}

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

    images: List[str] = Field(default_factory=list)
    inventory: List[dict] = Field(default_factory=list)

    amenities: List[str] = Field(default_factory=list)
    nearbyPlaces: List[dict] = Field(default_factory=list)

    coordinates: List[float] = Field(default_factory=lambda: [21.1458, 79.0882])

    updatedAt: str | None = None


# -------------------------
# ROUTES
# -------------------------
@app.get("/")
def root():
    return {"status": "API LIVE"}


@app.post("/local/property/upsert")
def upsert_property(property: Property):
    property.updatedAt = datetime.utcnow().isoformat()

    db[property.id] = property.dict()

    return db[property.id]


@app.get("/local/property/all")
def get_all_properties():
    return list(db.values())


@app.delete("/local/property/delete/{property_id}")
def delete_property(property_id: str):
    if property_id in db:
        del db[property_id]
        return {"status": "deleted"}
    return {"status": "not_found"}
