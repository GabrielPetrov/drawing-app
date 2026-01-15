from pydantic import BaseModel, Field
from typing import Any, List, Optional
from datetime import datetime

class DrawingCreate(BaseModel):
    title: str = Field(default="Untitled", max_length=200)
    data: Any  # JSON strokes

class DrawingOut(BaseModel):
    id: int
    title: str
    data: Any
    created_at: datetime

    class Config:
        from_attributes = True

class DrawingListItem(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True
