from dotenv import load_dotenv
import os

load_dotenv()

RECIPE_SERVICE_BASE_URL = os.getenv("RECIPE_SERVICE_BASE_URL", "https://localhost:7280/api/Recipes/")
FOOD_SERVICE_BASE_URL = os.getenv("FOOD_SERVICE_BASE_URL", "https://localhost:7162/api/Foods/")
