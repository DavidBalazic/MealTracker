require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mealSuggestionRoutes = require("./routes/mealSuggestions");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger.json");

if (!process.env.USER_SERVICE_URL, !process.env.FOOD_SERVICE_URL, !process.env.RECIPE_SERVICE_URL, !process.env.MEAL_TRACKER_SERVICE_URL) {
  console.log("Please provide the URL for the USER, FOOD, MEAL_TRACKER and RECIPE services.");
  process.exit(1);
}

const app = express();

app.use(bodyParser.json());
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.set('insecureAccess', process.env.INSECURE_ACCESS || false);

const mongoUrl =
  process.env.MONGO_URL || "mongodb://mongodb:27017/mealsuggestion-service";

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", mealSuggestionRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
