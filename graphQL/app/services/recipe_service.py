import httpx
from typing import List
from app.models.schemas import RecipeType

class RecipeService:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get_all_recipes(self) -> List[RecipeType]:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(self.base_url)
            response.raise_for_status() 
            recipes_data = response.json() 
            return [RecipeType(**recipe) for recipe in recipes_data]

    async def get_recipe_by_id(self, recipe_id: str) -> RecipeType:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}{recipe_id}")
            response.raise_for_status()  
            recipe_data = response.json() 
            return RecipeType(**recipe_data) if recipe_data else None
        
    async def create_recipe(self, recipe_data: dict) -> RecipeType:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(self.base_url, json=recipe_data)
            response.raise_for_status()
            created_recipe = response.json()
            return RecipeType(**created_recipe)

    async def delete_recipe(self, recipe_id: str) -> bool:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.delete(f"{self.base_url}{recipe_id}")
            return response.status_code == 204