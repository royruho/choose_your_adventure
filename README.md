# choose_your_adventure
A project for hosting a 'choose your own adventure' chatbot

![Adventure Image](./static/pixiquest_small1.png "Choose Your Adventure")


## run app using:
uvicorn app.main:app --reload


## generate initial DB 
alembic revision --autogenerate - "initial tables"  
alembic upgrade head