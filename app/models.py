from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    stories = relationship("Story", back_populates="owner")


class Story(Base):
    __tablename__ = "stories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.now())

    owner = relationship("User", back_populates="stories")
    parts = relationship("StoryPart", back_populates="story", cascade="all, delete-orphan")


class StoryPart(Base):
    __tablename__ = "story_parts"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"))
    sender = Column(String)  # "story_teller" or "human"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.now())

    story = relationship("Story", back_populates="parts")
