import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import CreateMeal from "./CreateMeal";
import EditMeal from "./EditMeal";
import { mealTrackerApi } from "../../lib/axios"; // Import configured API instance
import { MealPlan } from "../../ClientGenerator/generated/models";

interface MealsProps {
  onMealPlanCreated?: () => Promise<void>; // Make it optional
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
      setLoading(true);
      const response = await mealTrackerApi.apiMealTrackerMealplansGet(); // Fetch using the API
      setMealPlans(response);
    } catch (err) {
      console.error("Failed to fetch meal plans", err);
      setError("Failed to load meal plans.");
    } finally {
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
        <CreateMeal onMealPlanCreated={onMealPlanCreated || fetchMealPlans} />
      </div>
      {loading && <p className="text-center">Loading meal plans...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((plan) => {
          // Safely handle potential undefined or null values for meals
          const totalCalories = (plan.meals ?? []).reduce(
            (sum, meal) => sum + (meal.calories || 0),
            0
          );

          return (
            <Card
              key={plan.id}
              className="p-4 rounded-lg border shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedMealPlan(plan)}
            >
              <CardContent>
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  {new Date(plan.date || "").toLocaleDateString("en-GB")} -{" "}
                  {totalCalories} Calories
                </h2>
                <ul>
                  {(plan.meals ?? []).map((meal) => (
                    <li key={meal.id}>
                      {meal.name || "Unnamed Meal"} - {meal.calories || 0}{" "}
                      Calories
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
