from contextlib import asynccontextmanager


from fastapi import FastAPI
from sqlalchemy import text

from app.db.database import SessionLocal, engine
from app.db.base import Base

from app.models.user import User
from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.models.vote import Vote

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.polls import router as polls_router
from app.routes.health import router as health_router
from prometheus_fastapi_instrumentator import Instrumentator
from app.core.config import settings
from app.core.middleware import log_requests
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            if not db.query(Poll).first():
                sample_poll = Poll(
                    title="Which programming language do you prefer?",
                    description="Cast your vote for your favorite programming language."
                )
                db.add(sample_poll)
                db.flush()
                for opt_text in ["Python", "Java", "C++", "JavaScript"]:
                    db.add(PollOption(poll_id=sample_poll.id, option=opt_text))
                db.commit()
    except Exception as e:
        print(f"[SEED WARN] Could not seed default poll: {e}")
    yield



app = FastAPI(lifespan=lifespan)



app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.middleware("http")(log_requests)

Instrumentator().instrument(app).expose(app)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(polls_router)
app.include_router(health_router)
@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}
