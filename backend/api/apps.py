import os
import time
import threading
from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # Prevent duplicate background threads
        if getattr(self, '_keepalive_started', False):
            return
        self._keepalive_started = True

        def _neon_keepalive_loop():
            from django.db import connection, close_old_connections
            while True:
                time.sleep(180)  # Ping every 3 minutes to keep Neon DB awake
                try:
                    close_old_connections()
                    with connection.cursor() as cursor:
                        cursor.execute("SELECT 1;")
                except Exception:
                    pass

        t = threading.Thread(target=_neon_keepalive_loop, daemon=True)
        t.start()
