import os

from dotenv import load_dotenv

load_dotenv()


def required(name: str) -> str:
    value = os.getenv(name, "").strip()

    if not value:
        raise RuntimeError(f"{name} is not configured.")

    return value


SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SECRET_KEY = required("SUPABASE_SECRET_KEY")

ADZUNA_APP_ID = required("ADZUNA_APP_ID")
ADZUNA_APP_KEY = required("ADZUNA_APP_KEY")

ADZUNA_DEFAULT_COUNTRY = (
    os.getenv("ADZUNA_DEFAULT_COUNTRY", "gb").strip().lower()
)
