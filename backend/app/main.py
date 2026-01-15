from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from .db import Base, engine, get_db
from .models import Drawing
from .schemas import DrawingCreate, DrawingOut, DrawingListItem
from fastapi import Response

app = FastAPI(title="Drawing API")

# In our setup, frontend calls /api via same origin (Nginx proxy),
# but enabling CORS is still useful for local dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/drawings", response_model=DrawingOut)
def create_drawing(payload: DrawingCreate, db: Session = Depends(get_db)):
    d = Drawing(title=payload.title, data=payload.data)
    db.add(d)
    db.commit()
    db.refresh(d)
    return d

@app.get("/drawings", response_model=list[DrawingListItem])
def list_drawings(db: Session = Depends(get_db)):
    rows = db.execute(select(Drawing).order_by(Drawing.created_at.desc())).scalars().all()
    return rows

@app.get("/drawings/{drawing_id}", response_model=DrawingOut)
def get_drawing(drawing_id: int, db: Session = Depends(get_db)):
    d = db.get(Drawing, drawing_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drawing not found")
    return d

@app.delete("/drawings/{drawing_id}", status_code=204)
def delete_drawing(drawing_id: int, db: Session = Depends(get_db)):
    d = db.get(Drawing, drawing_id)
    if not d:
        raise HTTPException(status_code=404, detail="Drawing not found")
    db.delete(d)
    db.commit()
    return Response(status_code=204)
