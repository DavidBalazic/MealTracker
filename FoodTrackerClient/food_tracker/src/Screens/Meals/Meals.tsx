import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { Card, CardContent } from "../../Components/ui/card";
import CreateMeal from "./CreateMeal";
import EditMeal from "./EditMeal";

interface MealPlan {
  id: string;
  date: string;
  meals: Array<{
    id: string;
    name: string;
    foodItems: Array<{
      id: string;
      name: string;
      calories: number;
    }>;
    calories: number;
  }>;
}

interface MealsProps {
  onMealPlanCreated: () => Promise<void>;
}

const Meals: React.FC<MealsProps> = ({ onMealPlanCreated }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async () => {
    try {
      const response = await api.get("/mealtracker/mealplans");
      setMealPlans(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch meal plans", err);
      setError("Failed to load meal plans.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-black mb-8 text-center">
        Active Meal Plans
      </h1>
      <div className="flex justify-center mb-8">
        <CreateMeal onMealPlanCreated={fetchMealPlans} />
      </div>
      {loading && <p className="text-center">Loading meal plans...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((plan) => {
          // Calculate the total calories for the meal plan
          const totalCalories = plan.meals.reduce(
            (sum, meal) => sum + meal.calories,
            0
          );

          return (
            <Card
              key={plan.id}
              className="p-4 rounded-lg border shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMealPlan(plan)} // Open EditMeal dialog on click
            >
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  {/* Format date to show day/month/year and total calories */}
                  {new Date(plan.date).toLocaleDateString("en-GB")} -{" "}
                  {totalCalories} Calories
                </h2>
                <ul className="space-y-1">
                  {plan.meals.map((meal) => (
                    <li key={meal.id} className="text-gray-600">
                      {meal.name} - {meal.calories} calories
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Render EditMeal dialog if a meal plan is selected */}
      {selectedMealPlan && (
        <EditMeal
          mealPlan={selectedMealPlan}
          onClose={() => setSelectedMealPlan(null)}
          onMealPlanUpdated={fetchMealPlans}
        />
      )}
    </div>
  );
};

export default Meals;
