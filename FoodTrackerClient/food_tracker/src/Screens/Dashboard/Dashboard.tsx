import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { fetchMealPlans, MealPlan, Meal } from "./DashboardApi"; // Import the API methods and types
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<{
    totalCalories: number;
    averageCalories: number;
    mealCount: number;
  } | null>(null);

  const [weeklyCalories, setWeeklyCalories] = useState<number[]>([]); // Weekly calorie data for the chart
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const mealPlans = await fetchMealPlans();

        // Extract all meals from meal plans
        const allMeals: Meal[] = mealPlans.flatMap((plan) => plan.meals ?? []);

        // Calculate total calories
        const totalCalories = allMeals.reduce(
          (sum, meal) => sum + (meal.calories || 0),
          0
        );

        // Calculate meal count
        const mealCount = allMeals.length;

        // Calculate average calories
        const averageCalories = mealCount > 0 ? totalCalories / mealCount : 0;

        // Calculate weekly calorie intake (group by day of the week)
        const caloriesByDay = new Array(7).fill(0); // Initialize an array with 7 days (0 for Sunday)
        mealPlans.forEach((plan) => {
          const date = new Date(plan.date);
          const day = date.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
          const dailyCalories = plan.meals.reduce(
            (sum, meal) => sum + meal.calories,
            0
          );
          caloriesByDay[day] += dailyCalories;
        });

        setStatistics({ totalCalories, averageCalories, mealCount });
        setWeeklyCalories(caloriesByDay);
      } catch (err: any) {
        setError("Failed to fetch statistics. Please try again later.");
        console.error(err);
      }
    };

    fetchStatistics();
  }, []);

  const chartData = {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    datasets: [
      {
        label: "Calories",
        data: weeklyCalories,
        backgroundColor: "rgba(54, 162, 235, 0.7)", // Blue color
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the graph to stretch
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Weekly Calorie Intake",
      },
    },
  };

  return (
    <div className="p-6 bg-gray-100 space-y-8">
      <h1 className="text-4xl font-bold text-black mb-4 text-center">
        Food Tracker Dashboard
      </h1>

      {/* Wider Cards */}
      <div className="flex flex-col lg:flex-row justify-center gap-6">
        {/* Total Calorie Intake */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 w-80 lg:w-96">
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
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 w-80 lg:w-96">
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
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 w-80 lg:w-96">
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

      {/* Calorie Intake Overview */}
      <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 col-span-2">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Calorie Intake Overview
          </h2>
          <div className="h-96 w-full">
            {" "}
            {/* Larger graph container */}
            {weeklyCalories.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p className="text-gray-600">Loading chart...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
