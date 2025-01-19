require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const mealSuggestionRoutes = require("./routes/mealSuggestions");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger.json");
const { errorLogger } = require("./utils/middlewares");

if (
  (!process.env.USER_SERVICE_URL,
  !process.env.FOOD_SERVICE_URL,
  !process.env.RECIPE_SERVICE_URL,
  !process.env.MEAL_TRACKER_SERVICE_URL)
) {
  console.log(
    "Please provide the URL for the USER, FOOD, MEAL_TRACKER and RECIPE services."
  );
  process.exit(1);
}

if (!process.env.ERROR_SERVICE_URL, !process.env.NOTIFICATION_SERVICE_URL) {
  console.log("Please provide the URL for the ERROR and NOTIFICATION services.");
  process.exit(1);
}

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(errorLogger);
// Middleware to intercept res.status(500).json

app.set("insecureAccess", process.env.INSECURE_ACCESS || false);

const mongoUrl =
  process.env.MONGO_URL || "mongodb://mongodb:27017/mealsuggestion-service";

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", mealSuggestionRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
