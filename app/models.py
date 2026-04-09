from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
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
    created_at = Column(DateTime, default=datetime.now)
    config = Column(JSON)      # genre, language, rating, pacing, deathPossible, trackStats, storyPrompt
    character = Column(JSON)   # name, gender, age, appearance, skills

    owner = relationship("User", back_populates="stories")
    parts = relationship(
        "StoryPart", back_populates="story",
        cascade="all, delete-orphan",
        order_by="StoryPart.turn_number, StoryPart.id"
    )


class StoryPart(Base):
    __tablename__ = "story_parts"

    id = Column(Integer, primary_key=True, index=True)
    story_id = Column(Integer, ForeignKey("stories.id"))
    turn_number = Column(Integer, default=0)
    sender = Column(String)   # "user" or "narrator"
    content = Column(Text)
    stats = Column(JSON)      # stats snapshot at this point: {health, inventory, relationships}
    created_at = Column(DateTime, default=datetime.now)

    story = relationship("Story", back_populates="parts")
