import axios from "axios";

// Define the base URL for the Dashboard API
const baseURL = `${process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL}/api`;

// Create an axios instance for the Dashboard API
const dashboardApi = axios.create({
  baseURL,
});

// Define the types for the MealPlan and Meal
export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  servingSize: string;
  unit: string;
  allergens: string[];
}

export interface Meal {
  id: string;
  name: string;
  foodIds: string[];
  foods: Food[];
  calories: number;
}

export interface MealPlan {
  id: string;
  date: string;
  meals: Meal[];
}

// Fetch all meal plans
export const fetchMealPlans = async (): Promise<MealPlan[]> => {
  try {
    const response = await dashboardApi.get<MealPlan[]>(
      "/MealTracker/mealplans"
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching meal plans:", error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch meal plans"
    );
  }
};
