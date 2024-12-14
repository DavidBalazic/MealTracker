import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navigation from "./Components/Navigation/Navigation";
import Home from "src/Screens/Home/Home";
import Dashboard from "src/Screens/Dashboard/Dashboard";
import Meals from "src/Screens/Meals/Meals";
import Signin from "src/Screens/Signin/Signin";
import Signup from "src/Screens/Signin/Signup";
import Footer from "./Components/Footer/Footer";
import About from "src/Screens/About/About";

function App() {
  const handleSignin = () => {
    console.log("Signed in");
  };

  const handleMealPlanCreated = async () => {
    console.log("Meal plan created successfully!");
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navigation />
        <div className="flex flex-col items-center justify-center flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/meals"
              element={<Meals onMealPlanCreated={handleMealPlanCreated} />}
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/signin"
              element={<Signin onSignin={handleSignin} />}
            />
            <Route
              path="/signup"
              element={<Signup onSignin={handleSignin} />}
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
