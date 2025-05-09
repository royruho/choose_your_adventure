from fastapi import Depends, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import FastAPI as app
from app.db import get_db
from app import crud

router = APIRouter(prefix="/api", tags=["Adventure API"])

@router.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")

@router.get("/index.html")
async def index_html():
    response = HTMLResponse(content="""
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="icon" type="image/x-icon" href="/favicon.ico">
            <title>Choose your own adventure</title>
        </head>
        <body>
            <h1>Version 0.01</h1>
        </body>
        </html>
    """, status_code=200)
    response.headers["Content-Type"] = "text/html"
    return response 

@router.post("/users")
def create_user(username: str, password: str, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already exists")
    return crud.create_user(db, username, password)

@router.post("/stories")
def start_story(user_id: int, title: str, db: Session = Depends(get_db)):
    return crud.create_story(db, user_id, title)

@router.post("/stories/{story_id}/parts")
def add_story_part(story_id: int, sender: str, content: str, db: Session = Depends(get_db)):
    return crud.add_story_part(db, story_id, sender, content)

@router.get("/stories/{story_id}/parts")
def get_story_parts(story_id: int, db: Session = Depends(get_db)):
    parts = crud.get_story_parts(db, story_id)
    return [
        {"sender": p.sender, "content": p.content, "created_at": p.created_at.isoformat()} for p in parts
    ]

@router.get("/users/{user_id}/stories")
def get_user_stories(user_id: int, db: Session = Depends(get_db)):
    return crud.get_user_stories(db, user_id)

@router.get("/stories/{story_id}")
def get_story_by_id(story_id: int, db: Session = Depends(get_db)):
    story = crud.get_story_by_id(db, story_id)
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    return {
        "title": story.title,
        "created_at": story.created_at.isoformat(),
        "parts": [
            {"sender": p.sender, "content": p.content, "created_at": p.created_at.isoformat()} for p in story.parts
        ]
    }
