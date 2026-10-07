from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password

from app.schemas.token import (
    LoginRequest,
    Token
)
from app.core.metrics import (
    users_registered_total,
    login_success_total,
    login_failed_total,
)

from app.core.jwt import create_access_token
from app.core.security import verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/health")
def auth_health():
    return {"message": "auth working"}


@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )

    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(
            user.password
        )
    )


    db.add(db_user)

    db.commit()
    users_registered_total.inc()

    db.refresh(db_user)

    return db_user

@router.post(
    "/login",
    response_model=Token
)
def login(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(
            User.email == credentials.username
        )
        .first()
    )

    if not user:
        login_failed_total.inc()
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        credentials.password,
        user.password_hash
    ):
        login_failed_total.inc()
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        {
            "sub": str(user.id)
        }
    )

    login_success_total.inc()

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
