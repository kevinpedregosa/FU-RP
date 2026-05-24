"""Structured logging configuration for the FastAPI app."""

import logging
import sys
from typing import Any

import structlog

from app.config import settings


def add_logger_name(logger: Any, method_name: str, event_dict: dict[str, Any]) -> dict[str, Any]:
    """Add logger name when available across structlog logger factories."""
    event_dict["logger"] = getattr(logger, "name", None)
    return event_dict


def setup_logging(log_level: str = settings.LOG_LEVEL, environment: str = settings.ENVIRONMENT) -> None:
    """Configure standard library logging and structlog processors."""
    level = logging.getLevelName(log_level.upper())
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
    )

    renderer = (
        structlog.processors.JSONRenderer()
        if environment == "production"
        else structlog.dev.ConsoleRenderer()
    )
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        renderer,
    ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(log_level)),
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str) -> Any:
    """Return a bound structlog logger."""
    return structlog.get_logger(name)
