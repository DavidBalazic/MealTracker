import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { recipeApi, foodApi } from "../../lib/axios"; // Import API clients
import {
  Recipe,
  Ingredient,
} from "../../ClientGenerator/generated/RecipeClient/models";
import { Food } from "../../ClientGenerator/generated/FoodServiceClient/models";

// Extend Ingredient type to include foodName
interface IngredientWithFoodName extends Ingredient {
  foodName: string; // Add the new foodName property
}

interface RecipeWithEnrichedIngredients extends Recipe {
  ingredients: IngredientWithFoodName[]; // Use enriched ingredients
  nutritionPerServing?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
  }; // Store nutrition per serving for each recipe
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<RecipeWithEnrichedIngredients[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingNutritionId, setLoadingNutritionId] = useState<string | null>(
    null
  );

  // Fetch recipes and enrich with food names
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Fetch all recipes
      const recipesResponse = await recipeApi.apiRecipesGet();
      if (!recipesResponse || !Array.isArray(recipesResponse)) {
        throw new Error("Invalid recipe response format. Expected an array.");
      }

      // Step 2: Fetch all foods (reduce API calls)
      const foodsResponse = await foodApi.apiFoodsGet();
      if (!foodsResponse || !Array.isArray(foodsResponse)) {
        throw new Error("Invalid food response format. Expected an array.");
      }

      // Step 3: Create a lookup map for foods
      const foodMap: Record<string, Food> = {};
      foodsResponse.forEach((food) => {
        if (food.id) {
          foodMap[food.id] = food;
        }
      });

      // Step 4: Enrich ingredients with food names
      const enrichedRecipes: RecipeWithEnrichedIngredients[] =
        recipesResponse.map((recipe) => {
          const enrichedIngredients: IngredientWithFoodName[] =
            recipe.ingredients?.map((ingredient) => {
              const foodDetails = foodMap[ingredient.foodId || ""] || null;
              return {
                ...ingredient,
                foodName: foodDetails?.name || "Unknown Food", // Add foodName
              };
            }) || [];

          return { ...recipe, ingredients: enrichedIngredients };
        });

      setRecipes(enrichedRecipes);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      setError("Failed to load recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch nutrition per serving for a specific recipe
  const fetchNutritionPerServing = async (recipeId: string) => {
    try {
      setLoadingNutritionId(recipeId); // Set loading state for the specific recipe

      const perServingResponse = await recipeApi.apiRecipesPerServingIdGet({
        id: recipeId,
      });

      console.log(
        `Nutrition per serving for recipe ${recipeId}:`,
        perServingResponse.NutritionPerServing
      );

      // Transform the fetched nutrition data to match the expected interface
      const nutritionPerServing = {
        calories: perServingResponse.NutritionPerServing.Calories,
        protein: perServingResponse.NutritionPerServing.Protein,
        carbohydrates: perServingResponse.NutritionPerServing.Carbohydrates,
        fat: perServingResponse.NutritionPerServing.Fat,
      };

      // Update the specific recipe with fetched nutrition
      setRecipes((prevRecipes) =>
        prevRecipes.map((recipe) =>
          recipe.id === recipeId
            ? {
                ...recipe,
                nutritionPerServing,
              }
            : recipe
        )
      );
    } catch (err) {
      console.error(
        `Failed to fetch per-serving nutrition for recipe ${recipeId}:`,
        err
      );
    } finally {
      setLoadingNutritionId(null); // Reset loading state
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-black mb-8 text-center">
        Recipes
      </h1>

      {loading && <p className="text-center">Loading recipes...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Display Recipes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="p-4 rounded-lg border shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardContent>
              {/* Recipe Name */}
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {recipe.name}
              </h2>

              {/* Ingredients */}
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  Ingredients:
                </h3>
                <ul className="list-disc list-inside text-gray-500">
                  {recipe.ingredients?.map((ingredient, index) => (
                    <li key={index}>
                      {ingredient.foodName} - Quantity: {ingredient.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total Nutrition */}
              <div className="mb-2">
                <h3 className="text-sm font-semibold text-gray-600">
                  Total Nutrition:
                </h3>
                <ul className="text-gray-500">
                  <li>Calories: {recipe.totalNutrition?.calories}</li>
                  <li>Protein: {recipe.totalNutrition?.protein}</li>
                  <li>Carbohydrates: {recipe.totalNutrition?.carbohydrates}</li>
                  <li>Fat: {recipe.totalNutrition?.fat}</li>
                </ul>
              </div>

              {/* Nutrition Per Serving */}
              {recipe.nutritionPerServing && (
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Nutrition Per Serving:
                  </h3>
                  <ul className="text-gray-500">
                    <li>Calories: {recipe.nutritionPerServing.calories}</li>
                    <li>Protein: {recipe.nutritionPerServing.protein}</li>
                    <li>
                      Carbohydrates: {recipe.nutritionPerServing.carbohydrates}
                    </li>
                    <li>Fat: {recipe.nutritionPerServing.fat}</li>
                  </ul>
                </div>
              )}

              {/* Fetch Nutrition Button */}
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                onClick={() => fetchNutritionPerServing(recipe.id!)}
                disabled={loadingNutritionId === recipe.id}
              >
                {loadingNutritionId === recipe.id
                  ? "Fetching Nutrition..."
                  : "Fetch Nutrition Per Serving"}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
