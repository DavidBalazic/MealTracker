import React from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 p-4">
      <h1 className="text-4xl font-bold text-center text-black mb-4">
        Food Tracker
      </h1>
      <p className="text-gray-600 text-center mb-10">
        Your companion to track your meals, monitor your nutrition, and reach
        your health goals efficiently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Card for Home */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-black">Home</h2>
            <p className="text-gray-700 mb-4">
              The starting point to explore your food tracking journey. Discover
              tips and insights here.
            </p>
            <Button
              onClick={() => navigate("/about")}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
            >
              Learn More
            </Button>
          </CardContent>
        </Card>

        {/* Card for Dashboard */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-black">
              Dashboard
            </h2>
            <p className="text-gray-700 mb-4">
              View your progress, track your meals, and monitor your nutrition
              trends over time.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Card for Meals */}
        <Card className="shadow-md hover:shadow-xl transform transition-all duration-500 animate-fade-in-up">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-black">Meals</h2>
            <p className="text-gray-700 mb-4">
              Add, edit, and review your daily meals. Stay on top of your food
              intake and nutritional value.
            </p>
            <Button
              onClick={() => navigate("/meals")}
              className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
            >
              Track Meals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
