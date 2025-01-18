from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import Recipe
import uvicorn as uvicorn
import httpx
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL")], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

@app.get("/visualization")
async def get_visualization_data(recipe_id: str):
    recipe_service_url = f"{os.getenv("RECIPE_SERVICE_URL")}/{recipe_id}"
    
    async with httpx.AsyncClient(verify=False) as client:
        response = await client.get(recipe_service_url)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Recipe not found")

        try:
            recipe_data = response.json()
            recipe = Recipe(**recipe_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error parsing recipe data: {str(e)}")

        per_serving_nutrition = {
            "calories": recipe.TotalNutrition.Calories / recipe.Servings,
            "protein": recipe.TotalNutrition.Protein / recipe.Servings,
            "carbohydrates": recipe.TotalNutrition.Carbohydrates / recipe.Servings,
            "fat": recipe.TotalNutrition.Fat / recipe.Servings
        }

        return {
            "name": recipe.Name,
            "totalNutrition": recipe.TotalNutrition.dict(),
            "perServingNutrition": per_serving_nutrition,
            "tags": recipe.Tags
        }
    
if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)