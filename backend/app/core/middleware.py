import time

from fastapi import Request

from app.core.logger import logger


async def log_requests(
    request: Request,
    call_next
):
    start = time.perf_counter()

    response = await call_next(request)

    duration = (
        time.perf_counter() - start
    ) * 1000

    logger.info(
        "%s %s %s %.2f ms",
        request.method,
        request.url.path,
        response.status_code,
        duration
    )

    return response