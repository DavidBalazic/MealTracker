from typing import List
import strawberry

@strawberry.type
class FoodType:
    Id: str
    Name: str
    Calories: float
    Protein: float
    Carbohydrates: float
    Fat: float
    ServingSize: int
    Unit: str
    Allergens: List[str]
    
@strawberry.type
class NutritionType:
    Calories: float
    Protein: float
    Carbohydrates: float
    Fat: float

@strawberry.type
class IngredientType:
    FoodId: str
    Quantity: float 

@strawberry.type
class RecipeType:
    Id: str
    Name: str
    Ingredients: List[IngredientType]
    TotalNutrition: NutritionType
    Servings: int
    Instructions: str
    Tags: List[str]

@strawberry.input
class NutritionInput:
    Calories: float
    Protein: float
    Carbohydrates: float
    Fat: float

@strawberry.input
class IngredientInput:
    FoodId: str
    Quantity: float
    
@strawberry.input
class CreateRecipeInput:
    Name: str
    Ingredients: List[NutritionInput]
    TotalNutrition: IngredientInput
    Servings: int
    Instructions: str
    Tags: List[str]
    
@strawberry.input
class CreateFoodInput:
    Name: str
    Calories: float
    Protein: float
    Carbohydrates: float
    Fat: float
    ServingSize: int
    Unit: str
    Allergens: List[str]