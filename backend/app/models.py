from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from .db import Base

class Drawing(Base):
    __tablename__ = "drawings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, default="Untitled")
    data = Column(JSONB, nullable=False)  # strokes JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
