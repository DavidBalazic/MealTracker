const axios = require("axios");
const { recompileSchema } = require("../models/MealSuggestion");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// TODO implement, currently placeholder
const fetchFoodData = async (jwtToken) => {
  // return [{ Id: "675ed9ecdd35e38cb0c61281", Name: "Banana" }, { Id: "675ed95ddd35e38c0bc61291", Name: "Grilled Chicken" }, { Id: "675ed95ddd35e38c0bc61292", Name: "Steamed Broccoli" }, { Id: "675ed95ddd35e38c0bc61280", Name: "Oatmeal" }, { Id: "678acefbd7100c6524ca2ba0", Name: "Grilled Chicken" }, { Id: "678acefcd7100c6524ca2ba1", Name: "Grilled Chicken" }, { Id: "678ae8fc6f14f1565d9fbf43", Name: "Oatmeal" }, { Id: "678ae8fc6f14f1565d9fbf44", Name: "Grilled Chicken Salad" }, { Id: "678ae9356f14f1565d9fbf45", Name: "Oatmeal" }, { Id: "678ae9356f14f1565d9fbf46", Name: "Grilled Chicken Salad" }, { Id: "678ae9d76f14f1565d9fbf47", Name: "Oatmeal" }, { Id: "678aebe16f14f1565d9fbf48", Name: "Oatmeal" }, { Id: "678aebe16f14f1565d9fbf49", Name: "Grilled Chicken Salad" }, { Id: "678aec5b6f14f1565d9fbf4a", Name: "Oatmeal" }, { Id: "678aec5b6f14f1565d9fbf4b", Name: "Grilled Chicken Salad" }];
  try {
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwtToken}`;
    const response = await axios.get(
      `${process.env.FOOD_SERVICE_URL}/api/foods`
    );
    return response.data;
  } catch (err) {
    console.error(`Error fetching food data:\n${process.env.FOOD_SERVICE_URL}\n`, err);
    throw new Error("Failed to fetch food data");
  }
};

// TODO implement, currently placeholder
const fetchRecipeData = async (jwtToken) => {
  return [{ Id: "67615095424dc6db68cb4803", Name: "Apple and peanut butter", Ingredients: [ { FoodId: "675ed95ddd35e38cb0c61280", Quantity: 200 }, { FoodId: "675ed9ecdd35e38cb0c61281", Quantity: 150 }, ], TotalNutrition: { Calories: 1318.5, Protein: 50.75, Carbohydrates: 77.5, Fat: 100.45, }, Servings: 2, Instructions: "mix apple with peanut butter", Tags: ["High Protein", "Snack"], }, { Id: "67632d54615332d5f2db38a7", Name: "Chicken and Broccoli", Ingredients: [ { FoodId: "675ed95ddd35e38c0bc61291", Quantity: 150 }, { FoodId: "675ed95ddd35e38c0bc61292", Quantity: 100 }, ], TotalNutrition: { Calories: 275, Protein: 50.75, Carbohydrates: 77.5, Fat: 100.45, }, Servings: 2, Instructions: "Put on plait", Tags: ["Healthy", "Vegan"]}];
  try {
    const response = await axios.get(
      `${process.env.RECIPE_SERVICE_URL}/recipes`
    );
    return response.data;
  } catch (err) {
    console.error(`Error fetching recipe data:\n${process.env.RECIPE_SERVICE_URL}\n`, err);
    throw new Error("Failed to fetch recipe data");
  }
};

// TODO implement, currently placeholder
// Fetch user calorie goal from MEAL_TRACKER_SERVICE_URL with userId in path and jwtToken in body as 'token'
const fetchUserCalorieGoal = async (userId, jwtToken) => {
  return 1400;
  try {
    const response = await axios.post(
      `${process.env.MEAL_TRACKER_SERVICE_URL}/calorie-goal/${userId}`,
      {
        token: jwtToken,
      }
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching user calorie goal:\n ${process.env.MEAL_TRACKER_SERVICE_URL}\n`,
      err
    );
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
    console.error(
      "Error validating token via User Service. Trying local validation"
    );
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
    return { isValid: !!decoded };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { isValid: false, error: "expired" };
    }
    console.error("Error validating JWT token:", error);
  }
};

const postErr = async (code, message) => {
  try {
    await axios.post(`${process.env.ERROR_SERVICE_URL}/new`, {
      code: code,
      message: message,
    });
  } catch (err) {
    console.error("Error posting error message:", err);
  }
};

// function postMail(userEmail, content) that POSTs to process.env.NOTIFICATION_SERVICE_URL
const postMail = async (userEmail, content) => {
  try {
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/send`, {
      userEmail: userEmail,
      content: content,
    });
  } catch (err) {
    console.error("Error posting mail:", err);
  }
}

module.exports = {
  fetchFoodData,
  fetchRecipeData,
  validateToken,
  fetchUserCalorieGoal,
  postErr,
  postMail
};
