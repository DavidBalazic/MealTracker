import axios from "axios";
import { MealTrackerApi } from "../ClientGenerator/generated/apis/MealTrackerApi";
import { Configuration } from "../ClientGenerator/generated/runtime";

// Create a configuration instance for the MealTrackerApi
const config = new Configuration({
  basePath: process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL, // Use the environment variable or fallback URL
  fetchApi: window.fetch, // Use fetch as the API client implementation
});

// Create an instance of MealTrackerApi using the configuration
const mealTrackerApi = new MealTrackerApi(config);

// Axios instance for manual HTTP requests
const api = axios.create({
  baseURL: process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL,
});

export { api, mealTrackerApi };
