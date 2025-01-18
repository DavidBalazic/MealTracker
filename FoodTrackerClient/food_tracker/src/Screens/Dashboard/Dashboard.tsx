import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { mealTrackerApi } from "../../lib/axios"; // Import your API client
import { MealPlan } from "../../ClientGenerator/generated/MealTrackerClient/models";

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<{
    totalCalories: number;
    averageCalories: number;
    mealCount: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const fetchMealPlansFromApi = async (): Promise<MealPlan[]> => {
    try {
      const response = await mealTrackerApi.apiMealTrackerMealplansGet();
      if (!Array.isArray(response)) {
        throw new Error("Invalid response format. Expected an array.");
      }
      return response;
    } catch (err) {
      console.error("Error fetching meal plans from API", err);
      throw err;
    }
  };

  useEffect(() => {
    // Fetch meal plans and calculate statistics
    const fetchStatistics = async () => {
      try {
        const mealPlans = await fetchMealPlansFromApi();

        // Extract all meals from meal plans
        const allMeals = mealPlans.flatMap((plan) => plan.meals ?? []);

        // Calculate total calories
        const totalCalories = allMeals.reduce(
          (sum, meal) => sum + (meal.calories || 0),
          0
        );

        // Calculate meal count
        const mealCount = allMeals.length;

        // Calculate average calories
        const averageCalories = mealCount > 0 ? totalCalories / mealCount : 0;

        setStatistics({ totalCalories, averageCalories, mealCount });
      } catch (err: any) {
        setError("Failed to fetch statistics. Please try again later.");
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="p-6 bg-gray-100 space-y-8">
      <h1 className="text-4xl font-bold text-black mb-4 text-center">
        Food Tracker Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Calorie Intake */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Total Calorie Intake
            </h2>
            <p className="text-4xl font-bold text-black">
              {statistics ? `${statistics.totalCalories} kcal` : "Loading..."}
            </p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </CardContent>
        </Card>

        {/* Average Calories */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Average Calories Per Meal
            </h2>
            <p className="text-4xl font-bold text-black">
              {statistics
                ? `${statistics.averageCalories.toFixed(2)} kcal`
                : "Loading..."}
            </p>
          </CardContent>
        </Card>

        {/* Meal Count */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Total Meals
            </h2>
            <p className="text-4xl font-bold text-black">
              {statistics ? `${statistics.mealCount}` : "Loading..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for graph */}
      <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up col-span-2">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Calorie Intake Overview
          </h2>
          <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Graph showing weekly intake</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Meals */}
      <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up col-span-2">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Recent Meals
          </h2>
          <ul className="space-y-2">
            {statistics ? (
              <li className="flex justify-between text-gray-700">
                <span>Total Meals</span>
                <span>{statistics.mealCount}</span>
              </li>
            ) : (
              "Loading..."
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
