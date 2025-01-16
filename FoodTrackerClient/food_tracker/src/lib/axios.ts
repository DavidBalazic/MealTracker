import axios from "axios";
import { MealTrackerApi } from "../ClientGenerator/generated/MealTrackerClient/apis/MealTrackerApi";
import { FoodsApi } from "../ClientGenerator/generated/FoodServiceClient/apis/FoodsApi";
import { RecipesApi } from "../ClientGenerator/generated/RecipeClient/apis/RecipesApi";
import { UsersApi } from "../ClientGenerator/generated/UserServiceClient/apis/UsersApi";

import { Configuration as MealTrackerConfig } from "../ClientGenerator/generated/MealTrackerClient/runtime";
import { Configuration as FoodServiceConfig } from "../ClientGenerator/generated/FoodServiceClient/runtime";
import { Configuration as RecipeServiceConfig } from "../ClientGenerator/generated/RecipeClient/runtime";
import { Configuration as UserServiceConfig } from "../ClientGenerator/generated/UserServiceClient/runtime";

// Environment variables for API base URLs
const mealTrackerBaseURL = process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL;
const foodServiceBaseURL = process.env.REACT_APP_FOOD_SERVICE_URL;
const recipeServiceBaseURL = process.env.REACT_APP_RECIPE_SERVICE_URL;
const userServiceBaseURL = process.env.REACT_APP_USER_SERVICE_URL;

// Configuration for MealTrackerApi
const mealTrackerConfig = new MealTrackerConfig({
  basePath: mealTrackerBaseURL,
  fetchApi: window.fetch,
});

// Configuration for FoodApi
const foodServiceConfig = new FoodServiceConfig({
  basePath: foodServiceBaseURL,
  fetchApi: window.fetch,
});

// Configuration for RecipeApi
const recipeServiceConfig = new RecipeServiceConfig({
  basePath: recipeServiceBaseURL,
  fetchApi: window.fetch,
});

// Configuration for UserServiceApi
const userServiceConfig = new UserServiceConfig({
  basePath: userServiceBaseURL,
  fetchApi: window.fetch,
});

// Create API client instances
const mealTrackerApi = new MealTrackerApi(mealTrackerConfig);
const foodApi = new FoodsApi(foodServiceConfig);
const recipeApi = new RecipesApi(recipeServiceConfig);
const userApi = new UsersApi(userServiceConfig);

// Axios instance for manual HTTP requests
const api = axios.create({
  baseURL: mealTrackerBaseURL, // You can change this if needed for global axios requests
});

// Export the initialized API clients and Axios instance
export { api, mealTrackerApi, foodApi, recipeApi, userApi };
