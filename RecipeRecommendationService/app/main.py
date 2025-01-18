from typing import List
import httpx
from fastapi import FastAPI, HTTPException
import os
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import Recipe

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.post("/recipes/recommendations", response_model=List[Recipe])
async def get_recipe_recommendations(food_ids: List[str], excluded_allergens: List[str]):
    if not food_ids:
        raise HTTPException(status_code=400, detail="No food IDs provided.")
    
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(os.getenv("RECIPE_SERVICE_URL"))
            response.raise_for_status()  
            all_recipes = response.json()  
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail="Error fetching recipes from the external API.")

    matched_recipes = []
    for recipe in all_recipes:
        if any(ingredient['FoodId'] in food_ids for ingredient in recipe['Ingredients']):
            if not any(allergen.lower() in [tag.lower() for tag in recipe['Tags']] for allergen in excluded_allergens):
                matched_recipes.append(recipe)

    if not matched_recipes:
        raise HTTPException(status_code=404, detail="No recipes found matching the food IDs and excluding allergens.")

    return matched_recipes

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
