"""Production settings — Render.com deployment."""
from .base import *  # noqa: F401, F403
from decouple import config
import dj_database_url

DEBUG = config("DEBUG", default=True, cast=bool)


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
SECURE_CONTENT_TYPE_NOSNIFF = False
X_FRAME_OPTIONS = "DENY"

# ── CORS — allow Vercel frontend ──────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://sturent.mirzashafi.com,https://stu-rent.vercel.app,http://localhost:5173",
    cast=lambda v: [s.strip() for s in v.split(",")],
)
CORS_ALLOW_CREDENTIALS = True

# ── Static Files (WhiteNoise) & Media Files ──────────────────────────────────
STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*', cast=lambda v: [s.strip() for s in v.split(',')])
