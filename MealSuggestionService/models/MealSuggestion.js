const mongoose = require('mongoose');

const mealSuggestionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  recipeId: { type: String, required: true },
  recipeName: { type: String, required: true },
  recipeTags: { type: String, required: false },
  liked: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MealSuggestion', mealSuggestionSchema);

