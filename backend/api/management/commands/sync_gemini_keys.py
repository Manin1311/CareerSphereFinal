"""
Management command: sync_gemini_keys
- Reads GEMINI_API_KEYS from env (comma-separated)
- Adds any keys not already in DB (upsert)
- Resets daily_usage=0 on all projects (forces fresh quota for today)
- Activates all inactive Gemini keys

Usage:
  python manage.py sync_gemini_keys
"""
import os
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sync Gemini & Groq API keys from env to DB and reset daily quota counters."

    def handle(self, *args, **options):
        from api.models import GeminiProject, GeminiApiKey, GroqApiKey
        from api.utils.security import encrypt_api_key
        import datetime

        self.stdout.write(self.style.NOTICE("=== Syncing Gemini keys from env ==="))

        # --- Gemini upsert ---
        keys_str = os.getenv("GEMINI_API_KEYS", "")
        keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        if not keys:
            single = os.getenv("GEMINI_API_KEY", "")
            if single.strip():
                keys.append(single.strip())

        if not keys:
            self.stdout.write(self.style.WARNING("No GEMINI_API_KEYS found in environment!"))
        else:
            existing_key_values = set(GeminiApiKey.objects.values_list("key", flat=True))
            existing_project_count = GeminiProject.objects.count()
            new_count = 0

            for i, key in enumerate(keys, 1):
                if key in existing_key_values:
                    self.stdout.write(f"  [SKIP] Key ending ...{key[-6:]} already in DB")
                    continue
                project_name = f"Gemini-Project-{existing_project_count + new_count + 1}"
                project, _ = GeminiProject.objects.get_or_create(
                    name=project_name,
                    defaults={"daily_limit": 20, "daily_usage": 0, "rpm_limit": 5}
                )
                GeminiApiKey.objects.get_or_create(
                    key=key,
                    defaults={"project": project, "label": f"Key-{i}", "is_active": True}
                )
                new_count += 1
                self.stdout.write(self.style.SUCCESS(f"  [ADDED] Key ending ...{key[-6:]} → {project_name}"))

            self.stdout.write(self.style.SUCCESS(f"  {new_count} new Gemini keys added."))

        # --- Reset all projects' daily_usage to 0 (force fresh quota) ---
        today = datetime.date.today()
        reset_count = GeminiProject.objects.update(daily_usage=0, last_reset=today)
        self.stdout.write(self.style.SUCCESS(f"  Reset daily_usage=0 on {reset_count} Gemini projects."))

        # --- Re-activate any disabled Gemini keys ---
        reactivated = GeminiApiKey.objects.filter(is_active=False).update(is_active=True)
        if reactivated:
            self.stdout.write(self.style.SUCCESS(f"  Re-activated {reactivated} disabled Gemini keys."))

        total_projects = GeminiProject.objects.count()
        total_keys = GeminiApiKey.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"\n  DONE: {total_projects} Gemini projects, {total_keys} keys in DB — all quota reset."
        ))

        # --- Groq upsert ---
        self.stdout.write(self.style.NOTICE("=== Syncing Groq keys from env ==="))
        raw_keys_list = [
            os.getenv("GROQ_API_KEYS", ""),
            os.getenv("GROK_API_KEYS", ""),
            os.getenv("GROQ_API_KEY", ""),
            os.getenv("GROK_API_KEY", ""),
        ]
        gkeys = []
        for raw in raw_keys_list:
            if raw:
                for k in raw.split(","):
                    k_str = k.strip()
                    if k_str and k_str not in gkeys:
                        gkeys.append(k_str)

        existing_groq_count = GroqApiKey.objects.count()
        new_groq = 0
        for i, gk in enumerate(gkeys, 1):
            enc = encrypt_api_key(gk)
            if enc:
                _, created = GroqApiKey.objects.get_or_create(
                    encrypted_key=enc,
                    defaults={"label": f"Groq-Key-{existing_groq_count + new_groq + 1}", "is_active": True}
                )
                if created:
                    new_groq += 1
                    self.stdout.write(self.style.SUCCESS(f"  [ADDED] Groq key ending ...{gk[-6:]}"))

        # Re-activate disabled Groq keys
        reactivated_groq = GroqApiKey.objects.filter(is_active=False).update(is_active=True)
        if reactivated_groq:
            self.stdout.write(self.style.SUCCESS(f"  Re-activated {reactivated_groq} disabled Groq keys."))

        total_groq = GroqApiKey.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"  DONE: {new_groq} new Groq keys added. {total_groq} total Groq keys in DB."
        ))
