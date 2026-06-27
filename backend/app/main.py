from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import engine
from app.db.base import Base

from app.models.user import User
from app.models.poll import Poll
from app.models.vote import Vote

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.polls import router as polls_router
from prometheus_fastapi_instrumentator import Instrumentator

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan)
Instrumentator().instrument(app).expose(app)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(polls_router)


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}
