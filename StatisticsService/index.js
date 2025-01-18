const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://statisticsservice.onrender.com"], // Replace with your frontend's URL
    methods: ["GET", "POST"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use(express.json());

// Endpoint to calculate statistics
app.post("/statistics", (req, res) => {
  const { meals } = req.body;

  if (!meals || !Array.isArray(meals)) {
    return res.status(400).json({ error: "Invalid meal data" });
  }

  // Calculate statistics
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const averageCalories = meals.length > 0 ? totalCalories / meals.length : 0;

  return res.status(200).json({
    totalCalories,
    averageCalories,
    mealCount: meals.length,
  });
});

// Start the server
const PORT = process.env.PORT || 3033;
app.listen(PORT, () => {
  console.log(`StatisticService running on port ${PORT}`);
});
