import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { Card, CardContent } from "../../Components/ui/card";
import CreateMeal from "./CreateMeal";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      const response = await api.get("/mealtracker/mealplans");
      setMealPlans(response.data);
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
    <div className="p-6 bg-gray-100">
      <h1 className="text-4xl font-bold text-black mb-8">Active Meal Plans</h1>
      <CreateMeal onMealPlanCreated={fetchMealPlans} />
      {loading && <p>Loading meal plans...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mealPlans.map((plan) => (
          <Card key={plan.id}>
            <CardContent>
              <h2>{plan.date}</h2>
              <ul>
                {plan.meals.map((meal) => (
                  <li key={meal.id}>
                    {meal.name} - {meal.calories} calories
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Meals;
