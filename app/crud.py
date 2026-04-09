from sqlalchemy.orm import Session
from app.auth import hash_password
from app.models import User, Story, StoryPart


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, username: str, password: str):
    user = User(username=username, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_story(db: Session, owner_id: int, title: str, config: dict = None, character: dict = None):
    story = Story(title=title, owner_id=owner_id, config=config, character=character)
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


def get_story_by_id(db: Session, story_id: int):
    return db.query(Story).filter(Story.id == story_id).first()


def get_user_stories(db: Session, user_id: int):
    return db.query(Story).filter(Story.owner_id == user_id).order_by(Story.created_at.desc()).all()


def add_story_turn(db: Session, story_id: int, turn_number: int, user_content: str, narrator_content: str, stats: dict = None):
    """Save one turn: the user's action and the narrator's reply, both with the same turn number."""
    user_part = StoryPart(
        story_id=story_id,
        turn_number=turn_number,
        sender="user",
        content=user_content,
        stats=None,
    )
    narrator_part = StoryPart(
        story_id=story_id,
        turn_number=turn_number,
        sender="narrator",
        content=narrator_content,
        stats=stats,
    )
    db.add(user_part)
    db.add(narrator_part)
    db.commit()


def get_story_parts(db: Session, story_id: int):
    return db.query(StoryPart).filter(StoryPart.story_id == story_id).order_by(StoryPart.turn_number, StoryPart.id).all()


def delete_story(db: Session, story_id: int):
    story = get_story_by_id(db, story_id)
    if story:
        db.delete(story)
        db.commit()
    return story
