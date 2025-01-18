import {
    mealTrackerApi,
    foodApi,
    recipeApi,
  } from "../lib/axios"; // Adjust the import path if necessary
  
  export const resolvers = {
    Query: {
      // Fetch all foods
      getFoods: async () => {
        try {
          const foods = await foodApi.apiFoodsGet();
          return foods;
        } catch (error) {
          console.error("Error fetching foods:", error);
          throw new Error("Failed to fetch foods");
        }
      },
  
      // Fetch a specific food by ID
      getFoodById: async (_: any, { id }: { id: string }) => {
        try {
          const food = await foodApi.apiFoodsIdGet({ id });
          return food;
        } catch (error) {
          console.error(`Error fetching food with ID ${id}:`, error);
          throw new Error("Failed to fetch food by ID");
        }
      },
  
      // Fetch all meals
      getMeals: async () => {
        try {
          const meals = await mealTrackerApi.apiMealTrackerMealplansGet();
          return meals;
        } catch (error) {
          console.error("Error fetching meals:", error);
          throw new Error("Failed to fetch meals");
        }
      },
  
      // Fetch a specific meal by ID
      getMealById: async (_: any, { id }: { id: string }) => {
        try {
          const meal = await mealTrackerApi.apiMealTrackerMealIdGet({ id });
          return meal;
        } catch (error) {
          console.error(`Error fetching meal with ID ${id}:`, error);
          throw new Error("Failed to fetch meal by ID");
        }
      },
  
      // Fetch all meal plans
      getMealPlans: async () => {
        try {
          const mealPlans = await mealTrackerApi.apiMealTrackerMealplansGet();
          return mealPlans;
        } catch (error) {
          console.error("Error fetching meal plans:", error);
          throw new Error("Failed to fetch meal plans");
        }
      },
  
      // Fetch a specific meal plan by ID
      getMealPlanById: async (_: any, { id }: { id: string }) => {
        try {
          const mealPlan = await mealTrackerApi.apiMealTrackerMealplanIdDelete({
            id,
          });
          return mealPlan;
        } catch (error) {
          console.error(`Error fetching meal plan with ID ${id}:`, error);
          throw new Error("Failed to fetch meal plan by ID");
        }
      },
    },
  
    Meal: {
      // Resolve the `foods` field in the `Meal` type
      foods: async (meal: any) => {
        try {
          const foodDetails = await Promise.all(
            meal.foodIds.map((foodId: string) =>
              foodApi.apiFoodsIdGet({ id: foodId })
            )
          );
          return foodDetails;
        } catch (error) {
          console.error("Error fetching foods for meal:", error);
          throw new Error("Failed to fetch foods for meal");
        }
      },
    },
  
    MealPlan: {
      // Resolve the `meals` field in the `MealPlan` type
      meals: async (mealPlan: any) => {
        try {
          const mealDetails = await Promise.all(
            mealPlan.meals.map((mealId: string) =>
              mealTrackerApi.apiMealTrackerMealIdGet({ id: mealId })
            )
          );
          return mealDetails;
        } catch (error) {
          console.error("Error fetching meals for meal plan:", error);
          throw new Error("Failed to fetch meals for meal plan");
        }
      },
    },
  };
  