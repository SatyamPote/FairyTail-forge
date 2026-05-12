"""SQLite database layer using SQLAlchemy (sync ORM)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import (
    JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text, create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

from .config import DB_PATH


class Base(DeclarativeBase):
    pass


class Project(Base):
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    name        = Column(String(255), nullable=False)
    genre       = Column(String(100), default="fantasy")
    description = Column(Text, default="")
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))

    characters = relationship("Character", back_populates="project", cascade="all, delete-orphan")
    comics     = relationship("Comic",     back_populates="project", cascade="all, delete-orphan")


class Character(Base):
    __tablename__ = "characters"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    project_id   = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name         = Column(String(255), nullable=False)
    description  = Column(Text, default="")
    appearance   = Column(Text, default="")   # rich physical description
    outfit       = Column(Text, default="")
    personality  = Column(Text, default="")
    ref_image    = Column(String(512), default="")  # path to reference image

    project = relationship("Project", back_populates="characters")


class Comic(Base):
    __tablename__ = "comics"

    id          = Column(Integer, primary_key=True, autoincrement=True)
    project_id  = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title       = Column(String(255), nullable=False)
    user_prompt = Column(Text, default="")
    llm_script  = Column(Text, default="")
    panel_count = Column(Integer, default=4)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="comics")
    panels  = relationship("Panel", back_populates="comic", cascade="all, delete-orphan",
                           order_by="Panel.number")


class Panel(Base):
    __tablename__ = "panels"

    id           = Column(Integer, primary_key=True, autoincrement=True)
    comic_id     = Column(Integer, ForeignKey("comics.id"), nullable=False)
    number       = Column(Integer, nullable=False)
    scene        = Column(Text, default="")
    camera       = Column(Text, default="")
    characters   = Column(Text, default="")
    emotion      = Column(Text, default="")
    dialogue     = Column(Text, default="")
    image_prompt = Column(Text, default="")
    image_path   = Column(String(512), default="")
    generated    = Column(Boolean, default=False)

    comic = relationship("Comic", back_populates="panels")


# ── Engine & session factory ───────────────────────────────────────────────────
_engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, future=True)
Base.metadata.create_all(_engine)
SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False)


def get_session() -> Session:
    return SessionLocal()
