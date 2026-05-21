"""Development settings — local machine only."""
from .base import *  # noqa: F401, F403

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
    }
}

# ── Dev-only DRF: allow browsable API ────────────────────────────────────────
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = (  # noqa: F405
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
)

# ── Email (console backend for dev) ──────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
