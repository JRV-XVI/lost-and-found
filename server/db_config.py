"""
Database configuration for Python scripts
Reads credentials from .env file in parent directory
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME', 'test'),
    'port': int(os.getenv('DB_PORT', 3306))
}

if not db_config['password']:
    raise ValueError("DB_PASSWORD no está configurado en el archivo .env")
