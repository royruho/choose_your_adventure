# tests/test_crud.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import Base, get_db
from app import crud, models

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_create_user_and_verify(db):
    username = "testuser"
    password = "secret"
    user = crud.create_user(db, username=username, password=password)
    assert user.username == username

    verified = crud.verify_user(db, username=username, password=password)
    assert verified is not None
    assert verified.username == username

    invalid = crud.verify_user(db, username=username, password="wrong")
    assert invalid is None


def test_create_story_and_add_parts(db):
    user = crud.create_user(db, "storyuser", "pass")
    story = crud.create_story(db, user_id=user.id, title="Adventure Begins")
    assert story.title == "Adventure Begins"

    part1 = crud.add_story_part(db, story_id=story.id, sender="story_teller", content="You are in a dark cave.")
    part2 = crud.add_story_part(db, story_id=story.id, sender="human", content="I light a torch.")

    parts = crud.get_story_parts(db, story_id=story.id)
    assert len(parts) == 2
    assert parts[0].sender == "story_teller"
    assert parts[1].sender == "human"


def test_get_user_stories(db):
    user = crud.create_user(db, "collector", "pass")
    crud.create_story(db, user_id=user.id, title="Story 1")
    crud.create_story(db, user_id=user.id, title="Story 2")

    stories = crud.get_user_stories(db, user_id=user.id)
    assert len(stories) == 2
    titles = {s.title for s in stories}
    assert "Story 1" in titles
    assert "Story 2" in titles


def test_get_story_by_id(db):
    user = crud.create_user(db, "reader", "pass")
    story = crud.create_story(db, user_id=user.id, title="The Lost City")
    fetched = crud.get_story_by_id(db, story_id=story.id)
    assert fetched.id == story.id
    assert fetched.title == "The Lost City"
