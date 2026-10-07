from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://voting_user:voting_password@localhost:5432/voting_db"
    SECRET_KEY: str = "dev_secret_key_voting_app_change_in_production_987654321"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+psycopg2://", 1)
            if v.startswith("postgresql://") and "+psycopg2" not in v:
                return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
