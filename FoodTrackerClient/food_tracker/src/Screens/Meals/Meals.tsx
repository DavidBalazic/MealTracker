import React from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Calendar } from "../../Components/ui/calendar"; // Assuming the ShadCN calendar is implemented here

const Meals: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 space-y-8">
      <h1 className="text-4xl font-bold text-black mb-8 text-center mt-4">
        Active Meal Plans
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-md hover:shadow-lg transform transition-all duration-300">
            <CardContent className="p-4 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-black mb-4 text-center">
                Select a Date
              </h2>
              <Calendar />
            </CardContent>
          </Card>
        </div>

        {/* Meal Plan Cards Section */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {["Week 1", "Week 2", "Week 3", "Week 4"].map((week, index) => (
            <Card
              key={index}
              className="shadow-md hover:shadow-lg transform transition-all duration-300"
            >
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-black mb-2">
                  Meal Plan {week}
                </h2>
                <p className="text-gray-600">Description...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Meals;
