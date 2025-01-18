from pydantic import BaseModel
from typing import List

class Nutrition(BaseModel):
    Calories: float
    Protein: float
    Carbohydrates: float
    Fat: float

class Ingredient(BaseModel):
    FoodId: str
    Quantity: float 

class Recipe(BaseModel):
    Id: str
    Name: str
    Ingredients: List[Ingredient]
    TotalNutrition: Nutrition
    Servings: int
    Instructions: str
    Tags: List[str]