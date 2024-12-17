import axios from "axios";
import { MealTrackerApi } from "../ClientGenerator/generated/MealTrackerClient/apis/MealTrackerApi";
import { FoodsApi } from "../ClientGenerator/generated/FoodServiceClient/apis/FoodsApi";
import { Configuration as MealTrackerConfig } from "../ClientGenerator/generated/MealTrackerClient/runtime";
import { Configuration as FoodServiceConfig } from "../ClientGenerator/generated/FoodServiceClient/runtime";

// Environment variables for API base URLs
const mealTrackerBaseURL = process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL;
const foodServiceBaseURL = process.env.REACT_APP_FOOD_SERVICE_URL;

// Configuration for MealTrackerApi
const mealTrackerConfig = new MealTrackerConfig({
  basePath: mealTrackerBaseURL, // MealTracker API URL
  fetchApi: window.fetch, // Use fetch for HTTP requests
});

// Configuration for FoodApi
const foodServiceConfig = new FoodServiceConfig({
  basePath: foodServiceBaseURL, // FoodService API URL
  fetchApi: window.fetch, // Use fetch for HTTP requests
});

// Create API client instances
const mealTrackerApi = new MealTrackerApi(mealTrackerConfig);
const foodApi = new FoodsApi(foodServiceConfig);

// Axios instance for manual HTTP requests
const api = axios.create({
  baseURL: mealTrackerBaseURL, // Default Axios instance points to MealTrackerService
});

// Export the initialized API clients and Axios instance
export { api, mealTrackerApi, foodApi };
