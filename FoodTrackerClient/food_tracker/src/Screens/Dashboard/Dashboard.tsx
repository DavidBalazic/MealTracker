import React from "react";
import { Card, CardContent } from "../../Components/ui/card";

const Dashboard: React.FC = () => {
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
            <p className="text-4xl font-bold text-black">2,350 kcal</p>
            <p className="text-green-600">+10% from last week</p>
          </CardContent>
        </Card>

        {/* Number of Different Foods */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Total Foods Logged
            </h2>
            <p className="text-4xl font-bold text-black">125</p>
            <p className="text-gray-500">Total different items tracked</p>
          </CardContent>
        </Card>

        {/* Food Types */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Variety of Food Types
            </h2>
            <p className="text-4xl font-bold text-black">8 Types</p>
            <p className="text-gray-500">Vegetables, Fruits, Proteins, etc.</p>
          </CardContent>
        </Card>

        {/* Water Intake */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold text-black mb-2">
              Total Water Intake
            </h2>
            <p className="text-4xl font-bold text-black">2.5 L</p>
            <p className="text-gray-500">Recommended: 3 L/day</p>
          </CardContent>
        </Card>
      </div>

      {/* Graph Overview */}
      <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up col-span-2">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-black mb-4">
            Calorie Intake Overview
          </h2>
          {/* Placeholder for graph */}
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
