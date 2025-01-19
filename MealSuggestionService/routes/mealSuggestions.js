const express = require("express");
const MealSuggestion = require("../models/MealSuggestion");
const {
  fetchFoodData,
  fetchRecipeData,
  validateToken,
  fetchUserCalorieGoal,
} = require("../utils/dataFetcher");
const axios = require("axios");
const { jwtValidationMiddleware } = require("../utils/middlewares");

const router = express.Router();

// GET: Get all meal suggestions
router.get("/user/:userId", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Get all meal suggestions'
        #swagger.summary = 'Get all meal suggestions'
        #swagger.parameters['userId'] = {description: 'User ID', in: 'path', required: true, type: 'string'}
        #swagger.parameters['liked'] = {description: 'Filter by liked status', in: 'query', required: false, type: 'boolean'}
        #swagger.responses[200] = {
            description: 'Meal suggestions retrieved successfully', 
            schema: [{
                userId: "60f1b3b3b3b3b3b3b3b3b3b3",
                recipeId: "ijfds8j5dlklkfadlkafdslk5",
                recipeName: "Chicken with rice and goodies",
                recipeTags: "chicken, rice, vegetables",
                liked: false,
                timestamp: "2021-07-17T12:00:00.000Z",
             }]
         }
        #swagger.responses[404] = {description: 'Meal suggestions not found for user or user has no liked meals'}
        #swagger.responses[500] = {description: 'Failed to fetch meal suggestions'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    const userId = req.params.userId;
    const liked = req.query.liked;
    const query = liked ? { userId, liked } : { userId };

    const suggestions = await MealSuggestion.find(query);
    if (!suggestions.length)
      return res.status(404).json({
        error: "Meal suggestions not found for user or user has no liked meals",
      });
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: find meal suggestion by ID
router.get("/:suggestionId", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
    #swagger.description = 'Find meal suggestion by ID'
    #swagger.summary = 'Find meal suggestion by ID'
    #swagger.parameters['suggestionId'] = {description: 'Suggestion ID', in: 'path', required: true, type: 'string'}
    #swagger.responses[200] = {
        description: 'Meal suggestion retrieved successfully', 
        schema: {
            _id: "gfdskjgfdskjafdsjkfdsgf",
            userId: "60f1b3b3b3b3b3b3b3b3b3b3",
            recipeId: "ijfds8j5dlklkfadlkafdslk5",
            recipeName: "Chicken with rice and goodies",
            recipeTags: "chicken, rice, vegetables",
            liked: false,
            timestamp: "2021-07-17T12:00:00.000Z",
        }
     }
    #swagger.responses[404] = {description: 'Meal suggestion not found'}
    #swagger.responses[500] = {description: 'Failed to fetch meal suggestion'}
    #swagger.responses[401] = {description: 'Missing jwt token'}
    #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    const suggestion = await MealSuggestion.findById(req.params.suggestionId);
    if (!suggestion)
      return res.status(404).json({ error: "Meal suggestion not found" });

    res.status(200).json(suggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create meal suggestion for user
router.post("/", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Create meal suggestion for user'
        #swagger.summary = 'Create meal suggestion for user'
        #swagger.parameters['userId'] = {description: 'User ID', in: 'body', required: true, type: 'string', schema: '60f1b3b3b3b3b3b3b3b3b3b3'}
        #swagger.responses[201] = {description: 'Meal suggestion saved successfully',
            schema: {
                _id: "gfdskjgfdskjafdsjkfdsgf",
                userId: "60f1b3b3b3b3b3b3b3b3b3b3",
                recipeId: "ijfds8j5dlklkfadlkafdslk5",
                recipeName: "Chicken with rice and goodies",
                recipeTags: "chicken, rice, vegetables",
                liked: false,
                timestamp: "2021-07-17T12:00:00.000Z",
            }
         }
        #swagger.responses[500] = {description: 'Failed to save meal suggestion'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    const { userId, jwtToken } = req.body;
    if (!userId)
      return res.status(400).json({ error: "Missing required fields: userId" });
    const foods = await fetchFoodData(jwtToken);
    const recipes = await fetchRecipeData(jwtToken);
    const calorieGoal = await fetchUserCalorieGoal(userId);
    // In recipes delete recipe if recipe {ingridients [{id1}]} is not in foods [{id1}]
    const filteredRecipes = recipes.filter((recipe) =>
      recipe.ingredients.every((ingredient) =>
        foods.some((food) => food.id === ingredient.id)
      )
    );
    // In filteredRecipes choose the one with the closest calorie count to calorieGoal
    const suggestion = filteredRecipes.reduce((prev, curr) =>
      Math.abs(curr.totalNutrition.calories - calorieGoal) <
      Math.abs(prev.totalNutrition.calories - calorieGoal)
        ? curr
        : prev
    );

    const mealSuggestion = new MealSuggestion({
      userId,
      recipeId: suggestion.recipeId,
      recipeName: suggestion.name,
      recipeTags: suggestion.tags.join(", "),
    });
    await mealSuggestion.save();
    res.status(201).json(mealSuggestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create custom meal suggestion
router.post("/custom", jwtValidationMiddleware, async (req, res) => {
  try {
    /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Create custom meal suggestion'
        #swagger.summary = 'Create custom meal suggestion'
        #swagger.parameters['userId'] = {description: 'User ID', in: 'body', required: true, type: 'string', schema: '60f1b3b3b3b3b3b3b3b3b3b3'}
        #swagger.parameters['recipeId'] = {description: 'Recipe ID', in: 'body', required: true, type: 'string', schema: 'ijfds8j5dlklkfadlkafdslk5'}
        #swagger.parameters['recipeName'] = {description: 'Recipe name', in: 'body', required: true, type: 'string', schema: 'Chicken with rice and goodies'}
        #swagger.parameters['recipeTags'] = {description: 'Recipe tags', in: 'body', required: false, type: 'string', schema: 'chicken, rice, vegetables'}
        #swagger.parameters['jwtToken'] = {description: 'JWT token', in: 'body', required: false, type: 'string', schema: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZGQ5MjIzYy1hZjIwLTQwZjktYjIzZi1mZjIwZjIwZjIwZjIifQ.7
        #swagger.responses[201] = {description: 'Custom meal suggestion saved successfully'}
        #swagger.responses[400] = {description: 'Missing required fields: userId, recipeId, recipeName,'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}
        #swagger.responses[500] = {description: 'Failed to save custom meal suggestion'}*/

    const { userId, recipeId, recipeName, recipeTags, jwtToken } = req.body;
    if (!userId || !recipeId || !recipeName)
      return res.status(400).json({
        error: "Missing required fields: userId, recipeId, recipeName,",
      });

    const suggestion = new MealSuggestion({
      userId,
      recipeId,
      recipeName,
      recipeTags,
    });
    await suggestion.save();
    res
      .status(201)
      .json({ message: "Custom meal suggestion saved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: like meal suggestion by ID
router.put("/like/:suggestionId", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Like meal suggestion by ID'
        #swagger.summary = 'Like meal suggestion by ID'
        #swagger.parameters['suggestionId'] = {description: 'Suggestion ID', in: 'path', required: true, type: 'string'}
        #swagger.responses[200] = {description: 'Meal liked'}
        #swagger.responses[404] = {description: 'Meal suggestion not found'}
        #swagger.responses[500] = {description: 'Failed to like meal suggestion'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    const mealSuggestion = await MealSuggestion.findByIdAndUpdate(
      req.params.suggestionId,
      { liked: true },
      {
        new: true,
      }
    );
    if (!mealSuggestion) {
      return res.status(404).json({ error: "Meal suggestion not found" });
    }
    res.status(200).json({ message: "Meal liked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: unlike meal suggestion by ID
router.put(
  "/unlike/:suggestionId",
  jwtValidationMiddleware,
  async (req, res) => {
    /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Unlike meal suggestion by ID'
        #swagger.summary = 'Unlike meal suggestion by ID'
        #swagger.parameters['suggestionId'] = {description: 'Suggestion ID', in: 'path', required: true, type: 'string'}
        #swagger.responses[200] = {description: 'Meal liked'}
        #swagger.responses[404] = {description: 'Meal suggestion not found'}
        #swagger.responses[500] = {description: 'Failed to unlike meal suggestion'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}*/
    try {
      const mealSuggestion = await MealSuggestion.findByIdAndUpdate(
        req.params.suggestionId,
        { liked: false },
        {
          new: true,
        }
      );
      if (!mealSuggestion) {
        return res.status(404).json({ error: "Meal suggestion not found" });
      }
      res.status(200).json({ message: "Meal liked" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE: delete meal suggestion by ID
router.delete("/:suggestionId", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
            #swagger.description = 'Delete meal suggestion by ID'
            #swagger.summary = 'Delete meal suggestion by ID'
            #swagger.parameters['suggestionId'] = {description: 'Suggestion ID', in: 'path', required: true, type: 'string'}
            #swagger.responses[200] = {description: 'Meal suggestion deleted successfully'}
            #swagger.responses[404] = {description: 'Meal suggestion not found'}
            #swagger.responses[500] = {description: 'Failed to delete meal suggestion'}
            #swagger.responses[401] = {description: 'Missing jwt token'}
            #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    await MealSuggestion.findByIdAndDelete(req.params.suggestionId);
    res.status(200).json({ message: "Meal suggestion deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: delete all meal suggestions for user
router.delete("/user/:userId", jwtValidationMiddleware, async (req, res) => {
  /*#swagger.tags = ['Meal Suggestions']
        #swagger.description = 'Delete all meal suggestions for user'
        #swagger.summary = 'Delete all meal suggestions for user'
        #swagger.parameters['userId'] = {description: 'User ID', in: 'path', required: true, type: 'string'}
        #swagger.responses[200] = {description: 'All meal suggestions deleted successfully'}
        #swagger.responses[500] = {description: 'Failed to delete meal suggestions'}
        #swagger.responses[401] = {description: 'Missing jwt token'}
        #swagger.responses[401] = {description: 'Invalid jwt token'}*/
  try {
    await MealSuggestion.deleteMany({ userId: req.params.userId });
    res
      .status(200)
      .json({ message: "All meal suggestions deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
