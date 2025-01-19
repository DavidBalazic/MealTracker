import axios from "axios";

// Environment variable for the Meal Suggestion Service base URL
const baseURL =
  process.env.REACT_APP_MEAL_SUGGESTION_SERVICE_URL || "http://localhost:3002";

// Create an axios instance for Meal Suggestion Service
const mealSuggestionApi = axios.create({
  baseURL,
});

// Define types for Meal Suggestion objects
export interface MealSuggestion {
  _id?: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  recipeTags?: string;
  liked?: boolean;
  timestamp?: string;
}

// API Functions

/**
 * Get all meal suggestions for a user.
 */
export const getMealSuggestions = async (
  userId: string,
  token: string,
  liked?: boolean
): Promise<MealSuggestion[]> => {
  try {
    const response = await mealSuggestionApi.get(`/api/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: liked !== undefined ? { liked } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching meal suggestions:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch meal suggestions"
    );
  }
};

/**
 * Create a new meal suggestion for a user.
 */
export const createMealSuggestion = async (
  userId: string,
  token: string
): Promise<MealSuggestion> => {
  try {
    const response = await mealSuggestionApi.post(
      "/api",
      { userId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating meal suggestion:", error);
    throw new Error(
      error.response?.data?.error || "Failed to create meal suggestion"
    );
  }
};
