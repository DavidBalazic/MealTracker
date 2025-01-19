const axios = require("axios");
const { recompileSchema } = require("../models/MealSuggestion");
const jwt = require("jsonwebtoken");
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
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    const response = await axios.post(
      process.env.USER_SERVICE_URL + "/api/Users/validate-token",
      {
        headers: {
          Authorization: jwtToken,
        },
        body: jwtToken,
      }
    );
    return { isValid: response.data.IsValid };
  } catch (err) {
    console.error("Error validating token via User Service. Trying local validation");
  }
  try {
    secretKeyString =
      process.env.JWT_SECRET || "ThisIsAReallyStrongAndLongRandomKey!@#123456";
    const decoded = jwt.verify(jwtToken, secretKeyString, {
      algorithms: ["HS256"],
      issuer: "https://localhost:7073",
      ignoreExpiration: false,
      clockTolerance: 0,
    });
    return {isValid:!!decoded};
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, error: "expired" };
    }
    console.error("Error validating JWT token:", error);
  }
};

const postErr = async (code, message) => {
  try {
    await axios.post(`http://${process.env.ERROR_SERVICE_URL}/new`, {
      code: code,
      message: message,
    });
  } catch (err) {
    console.error("Error posting error message:", err);
  }
};


module.exports = {
  fetchFoodData,
  fetchRecipeData,
  validateToken,
  fetchUserCalorieGoal,
  postErr,
};
