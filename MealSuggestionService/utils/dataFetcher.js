const axios = require("axios");
const { recompileSchema } = require("../models/MealSuggestion");
require("dotenv").config();

// TODO implement, currently placeholder
const fetchFoodData = async (userId, jwtToken) => {
  return [
    {
      foodId: "1",
      name: "food1",
    },
    {
      foodId: "2",
      name: "food2",
    },
  ];
  try {
    const response = await axios.get(
      `http://${process.env.FOOD_SERVICE_URL}/food/user/${userId}`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching food data:", err);
    throw new Error("Failed to fetch food data");
  }
};

// TODO implement, currently placeholder
const fetchRecipeData = async (jwtToken) => {
  return [
    {
      recipeId: "1",
      name: "placeholder recipe",
      ingredients: [
        { foodId: "1", quantity: 1 },
        { foodId: "2", quantity: 2 },
      ],
      totalNutrition: {
        calories: 1000,
      },
      servings: 2,
      tags: ["tag1", "tag2"],
    },
    {
      recipeId: "2",
      name: "placeholder recipe 2",
      ingredients: [
        { foodId: "1", quantity: 1 },
        { foodId: "2", quantity: 2 },
      ],
      totalNutrition: {
        calories: 2000,
      },
      servings: 2,
      tags: ["tag3", "tag4"],
    },
  ];
  try {
    const response = await axios.get(
      `http://${process.env.RECIPE_SERVICE_URL}/recipes`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching recipe data:", err);
    throw new Error("Failed to fetch recipe data");
  }
};

// TODO implement, currently placeholder
// Fetch user calorie goal from MEAL_TRACKER_SERVICE_URL with userId in path and jwtToken in body as 'token'
const fetchUserCalorieGoal = async (userId, jwtToken) => {
  return 1400;
  try {
    const response = await axios.post(
      `http://${process.env.MEAL_TRACKER_SERVICE_URL}/calorie-goal/${userId}`,
      {
        token: jwtToken,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching user calorie goal:", err);
    throw new Error("Failed to fetch user calorie goal");
  }
};

const validateToken = async (jwtToken) => {
  {
    const response = await axios.post(
      "userServiceUrl/api/Users/validate-token",
      {
        token: jwtToken,
      }
    );
    return response.data.IsValid;
  }
};

module.exports = {
  fetchFoodData,
  fetchRecipeData,
  validateToken,
  fetchUserCalorieGoal,
};
