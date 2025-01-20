import strawberry
from typing import List
from app.services import recipe_service, food_service
from app.models.schemas import RecipeType, FoodType, CreateRecipeInput, CreateFoodInput
from app.services.recipe_service import RecipeService
from app.services.food_service import FoodService

recipe_service = RecipeService("https://localhost:7280/api/Recipes/")
food_service = FoodService("https://localhost:7162/api/Foods/")

@strawberry.type
class Query:
    @strawberry.field
    async def get_all_foods(self) -> List[FoodType]:
        return await food_service.get_all_foods()

    @strawberry.field
    async def get_food(self, id: str) -> FoodType:
        return await food_service.get_food_by_id(id)
    
    @strawberry.field
    async def get_recipe(self, recipe_id: str) -> RecipeType:
        return await recipe_service.get_recipe_by_id(recipe_id)

    @strawberry.field
    async def get_all_recipes(self) -> List[RecipeType]:
        return await recipe_service.get_all_recipes()
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_food(self, input: CreateFoodInput) -> FoodType:
        food_data = input.__dict__
        return await food_service.create_food(food_data)

    @strawberry.mutation
    async def delete_food(self, food_id: str) -> bool:
        return await food_service.delete_food(food_id)
    
    @strawberry.mutation
    async def create_recipe(self, input: CreateRecipeInput) -> RecipeType:
        recipe_data = input.__dict__
        return await recipe_service.create_recipe(recipe_data)

    @strawberry.mutation
    async def delete_recipe(self, recipe_id: str) -> bool:
        return await recipe_service.delete_recipe(recipe_id)