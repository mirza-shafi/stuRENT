"""Production settings — Render.com deployment."""
from .base import *  # noqa: F401, F403
from decouple import config
import dj_database_url

DEBUG = True

# Load Render's external DATABASE_URL if available, otherwise fallback to sqlite
DATABASES = {
    "default": dj_database_url.config(
        default=config("DATABASE_URL", default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600
    )
}

# ── Render handles SSL at proxy level — don't redirect internally ─────────────
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# ── CORS — allow Vercel frontend ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://sturent.mirzashafi.com,https://stu-rent.vercel.app,http://localhost:5173",
    cast=lambda v: [s.strip() for s in v.split(",")],
)
CORS_ALLOW_CREDENTIALS = True

# ── Static Files (WhiteNoise) ────────────────────────────────────────────────
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',')])
