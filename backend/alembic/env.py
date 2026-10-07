from logging.config import fileConfig

from sqlalchemy import pool

from alembic import context
from app.core.config import settings

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.db.base import Base

from app.models.user import User
from app.models.poll import Poll
from app.models.poll_option import PollOption
from app.models.vote import Vote

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from app.db.database import engine

    try:
        with engine.connect() as connection:
            context.configure(
                connection=connection, target_metadata=target_metadata
            )

            with context.begin_transaction():
                context.run_migrations()
    except Exception as e:
        print(f"[ALEMBIC WARN] Online migration warning: {e}")


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
