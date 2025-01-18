import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<{
    totalCalories: number;
    averageCalories: number;
    mealCount: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch statistics from the Statistics Service
    const fetchStatistics = async () => {
      try {
        const response = await fetch(
          "https://statisticsservice.onrender.com/statistics",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              meals: [{ calories: 400 }, { calories: 600 }], // Example data, replace with actual data source
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setStatistics(data);
      } catch (err: any) {
        setError(err.message);
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
              Average Calories
            </h2>
            <p className="text-4xl font-bold text-black">
              {statistics ? `${statistics.averageCalories} kcal` : "Loading..."}
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
            <li className="flex justify-between text-gray-700">
              <span>Grilled Chicken Salad</span>
              <span>450 kcal</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Fruit Smoothie</span>
              <span>250 kcal</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Avocado Toast</span>
              <span>320 kcal</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Steamed Broccoli & Quinoa</span>
              <span>180 kcal</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
