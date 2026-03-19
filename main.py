from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE = {
    "properties": []
}

@app.post("/property/upsert-bulk")
def upsert_bulk(properties: list):
    global DATABASE

    for p in properties:
        DATABASE["properties"] = [
            prop for prop in DATABASE["properties"] if prop["id"] != p["id"]
        ]
        p["updatedAt"] = datetime.utcnow().isoformat()
        DATABASE["properties"].append(p)

    return {"status": "success", "count": len(properties)}

@app.get("/property/all")
def get_all():
    return DATABASE["properties"]