from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import RecipeResponse, Recipe, Nutrition
import uvicorn as uvicorn
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.post("/process-recipe", response_model=RecipeResponse)
async def process_recipe(request: Request):
    recipe = await request.json()  

    if recipe['servings'] <= 0:
        raise HTTPException(status_code=400, detail="Servings must be greater than zero.")

    total_nutrition = recipe['totalNutrition']
    servings = recipe['servings']

    nutrition_per_serving = Nutrition(
        calories=total_nutrition['calories'] / servings,
        protein=total_nutrition['protein'] / servings,
        carbohydrates=total_nutrition['carbohydrates'] / servings,
        fat=total_nutrition['fat'] / servings,
    )

    response = RecipeResponse(
        name=recipe['name'],
        totalNutrition=total_nutrition,
        nutritionPerServing=nutrition_per_serving,
        tags=recipe['tags'],
    )

    return response

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)