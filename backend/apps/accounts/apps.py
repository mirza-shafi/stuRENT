"""
Accounts app configuration.
Handles authentication: register, login, logout, token refresh.
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"
    label = "accounts"
    verbose_name = "Accounts"

    def ready(self):
        import json
        import firebase_admin
        from firebase_admin import credentials
        from django.conf import settings

        if not firebase_admin._apps:
            creds_json = getattr(settings, "FIREBASE_CREDENTIALS", "")
            if creds_json:
                try:
                    creds_dict = json.loads(creds_json)
                    cred = credentials.Certificate(creds_dict)
                    firebase_admin.initialize_app(cred)
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error initializing Firebase Admin SDK with credentials: {e}")
            else:
                try:
                    firebase_admin.initialize_app()
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(
                        f"Firebase Admin SDK not initialized: {e}. "
                        "Make sure FIREBASE_CREDENTIALS environment variable is set in production."
                    )
