from fastapi import FastAPI, Depends
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from app.db_api import router as db_api_router
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(db_api_router)
templates = Jinja2Templates(directory="templates")


