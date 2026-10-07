from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.core.health import check_database

router = APIRouter(
    prefix="/health",
    tags=["Health"]
)

# Startup flag
startup_complete = True


@router.get("/livez")
def livez():
    return {
        "status": "alive"
    }


@router.get("/readyz")
def readyz(db: Session = Depends(get_db)):
    database_ok = check_database(db)

    if not database_ok:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not ready",
                "database": False
            }
        )

    return {
        "status": "ready",
        "database": True
    }


@router.get("/healthz")
def healthz(db: Session = Depends(get_db)):
    database_ok = check_database(db)

    return {
        "status": "healthy" if database_ok else "unhealthy",
        "database": database_ok
    }


@router.get("/startupz")
def startupz():

    if startup_complete:
        return {
            "startup": True
        }

    return JSONResponse(
        status_code=503,
        content={
            "startup": False
        }
    )