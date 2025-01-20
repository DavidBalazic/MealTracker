import httpx
from typing import List
from app.models.schemas import FoodType

class FoodService:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get_all_foods(self) -> List[FoodType]:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(self.base_url)
            response.raise_for_status()  
            food_data = response.json()  
            return [FoodType(**food) for food in food_data]

    async def get_food_by_id(self, food_id: str) -> FoodType:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.get(f"{self.base_url}{food_id}")
            response.raise_for_status()  
            food_data = response.json()  
            return FoodType(**food_data) if food_data else None
        
    async def create_food(self, food_data: dict) -> FoodType:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(self.base_url, json=food_data)
            response.raise_for_status()
            created_food = response.json()
            return FoodType(**created_food)

    async def delete_food(self, food_id: str) -> bool:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.delete(f"{self.base_url}{food_id}")
            return response.status_code == 204
