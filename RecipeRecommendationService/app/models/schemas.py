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
