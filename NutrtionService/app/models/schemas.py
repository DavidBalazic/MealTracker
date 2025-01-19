from pydantic import BaseModel
from typing import List

class Nutrition(BaseModel):
    calories: float
    protein: float
    carbohydrates: float
    fat: float

class Ingredient(BaseModel):
    foodId: str
    quantity: float  

class Recipe(BaseModel):
    id: str
    name: str
    ingredients: List[Ingredient]
    totalNutrition: Nutrition
    servings: int
    instructions: str
    tags: List[str]

class RecipeResponse(BaseModel):
    name: str
    totalNutrition: Nutrition
    nutritionPerServing: Nutrition
    tags: List[str]