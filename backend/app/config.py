from functools import lru_cache
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: str = Field(default="", validation_alias=AliasChoices("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"))
    supabase_secret_key: str = Field(default="", validation_alias=AliasChoices("SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"))
    google_client_id: str = Field(default="", validation_alias=AliasChoices("GOOGLE_CLIENT_ID"))
    google_client_secret: str = Field(default="", validation_alias=AliasChoices("GOOGLE_CLIENT_SECRET"))
    gemini_api_key: str = Field(default="", validation_alias=AliasChoices("GEMINI_API_KEY"))
    model_config = SettingsConfigDict(env_file=(".env", ".env.local"), env_file_encoding="utf-8", extra="ignore", populate_by_name=True)
    @property
    def supabase_configured(self)->bool:return bool(self.supabase_url and self.supabase_secret_key)
    @property
    def database_configured(self)->bool:return False
    @property
    def gemini_configured(self)->bool:return bool(self.gemini_api_key)
@lru_cache(maxsize=1)
def get_settings()->Settings:return Settings()
settings=get_settings()
