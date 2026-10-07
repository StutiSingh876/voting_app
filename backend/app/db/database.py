import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base

logger = logging.getLogger(__name__)

def create_db_engine():
    db_url = settings.DATABASE_URL
    try:
        engine = create_engine(db_url, pool_pre_ping=True)
        with engine.connect() as conn:
            logger.info(f"Successfully connected to database at {db_url}")
            return engine
    except Exception as e:
        logger.warning(f"Failed to connect to configured DB ({db_url}): {e}")

    if "@postgres:" in db_url:
        local_url = db_url.replace("@postgres:", "@localhost:")
        try:
            engine = create_engine(local_url, pool_pre_ping=True)
            with engine.connect() as conn:
                logger.info("Successfully connected to localhost PostgreSQL")
                return engine
        except Exception as e:
            logger.warning(f"Failed to connect to localhost PostgreSQL: {e}")

    sqlite_url = "sqlite:///./voting.db"
    logger.info(f"Falling back to SQLite database at {sqlite_url}")
    return create_engine(
        sqlite_url,
        connect_args={"check_same_thread": False}
    )

engine = create_db_engine()

# Import models to ensure they are registered with Base metadata
import app.models.user
import app.models.poll
import app.models.poll_option
import app.models.vote

# Ensure tables are created if running fallback SQLite
Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

