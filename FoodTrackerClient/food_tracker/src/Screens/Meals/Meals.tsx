import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import CreateMeal from "./CreateMeal";
import EditMeal from "./EditMeal";
import { mealTrackerApi } from "../../lib/axios";
import {
  MealPlan,
  Meal,
} from "../../ClientGenerator/generated/MealTrackerClient/models";

interface MealsProps {
  onMealPlanCreated?: () => Promise<void>;
}

const Meals: React.FC<MealsProps> = ({ onMealPlanCreated }) => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlansFromApi = async (): Promise<MealPlan[]> => {
    try {
      const response = await mealTrackerApi.apiMealTrackerMealplansGet();
      console.log("Raw API Response:", response);

      if (!Array.isArray(response)) {
        throw new Error("Invalid response format. Expected an array.");
      }

      return response;
    } catch (err) {
      console.error("Error fetching meal plans from API", err);
      throw err; // Re-throw the error to handle it in the caller
    }
  };

  // Function to fetch meal plans
  const fetchMealPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchMealPlansFromApi();

      // Parse MealPlan data
      const parsedMealPlans: MealPlan[] = response.map((plan) => ({
        ...plan,
        date: plan.date ? new Date(plan.date) : undefined,
        meals: (plan.meals ?? []).map((meal) => ({
          ...meal,
          foods: (meal.foods ?? []).map((food) => ({ ...food })),
        })),
      }));

      setMealPlans(parsedMealPlans);
    } catch (err) {
      console.error("Failed to fetch meal plans", err);
      setError("Failed to load meal plans. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch meal plans on component mount
  useEffect(() => {
    fetchMealPlans();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-black mb-8 text-center">
        Active Meal Plans
      </h1>

      <div className="flex justify-center mb-8">
        {/* Pass fetchMealPlans to CreateMeal to trigger a refresh */}
        <CreateMeal onMealPlanCreated={onMealPlanCreated || fetchMealPlans} />
      </div>

      {loading && <p className="text-center">Loading meal plans...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Display meal plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.map((plan) => {
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
                  {plan.date ? plan.date.toLocaleDateString() : "No Date"} -{" "}
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

      {/* Edit Meal Modal */}
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
