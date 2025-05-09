# app/crud.py
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models import User, Story, StoryPart

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, password: str):
    hashed_pw = pwd_context.hash(password)
    user = User(username=username, hashed_password=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def verify_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return None
    return user

def create_story(db: Session, user_id: int, title: str):
    story = Story(title=title, owner_id=user_id)
    db.add(story)
    db.commit()
    db.refresh(story)
    return story

def add_story_part(db: Session, story_id: int, sender: str, content: str):
    part = StoryPart(story_id=story_id, sender=sender, content=content)
    db.add(part)
    db.commit()
    db.refresh(part)
    return part

def get_story_parts(db: Session, story_id: int):
    return db.query(StoryPart).filter(StoryPart.story_id == story_id).order_by(StoryPart.created_at).all()

def get_user_stories(db: Session, user_id: int):
    return db.query(Story).filter(Story.owner_id == user_id).all()

def get_story_by_id(db: Session, story_id: int):
    return db.query(Story).filter(Story.id == story_id).first()