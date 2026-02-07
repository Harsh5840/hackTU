from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Modern Colours Analytics Service"
    API_V1_STR: str = "/api/v1"
    
    # Model Settings
    FORECAST_HORIZON: int = 30 # days
    
    class Config:
        env_file = ".env"

settings = Settings()
