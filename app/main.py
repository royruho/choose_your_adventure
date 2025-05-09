from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.templating import Jinja2Templates
from app.auth import authenticate_user, create_access_token, oauth2_scheme
from jose import JWTError, jwt
from datetime import timedelta
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")



@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.ico")

@app.get("/index.html")
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

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/login", response_class=HTMLResponse)
async def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/chat", response_class=HTMLResponse)
async def chat_interface(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, "your-secret-key", algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return templates.TemplateResponse("chat.html", {"request": request, "username": username})