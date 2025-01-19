import React, { useState, useEffect } from "react";
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
import Recipes from "src/Screens/Recipes/Recipes";
import Signin from "src/Screens/Signin/Signin";
import Signup from "src/Screens/Signin/Signup";
import Footer from "./Components/Footer/Footer";
import About from "src/Screens/About/About";
import MealSuggestions from "src/Screens/MealSuggestion/MealSuggestion";
import Admin from "src/Screens/Admin/Admin"; // New Admin Screen
import { userApi } from "./lib/axios";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // Store user role
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("authToken");
      if (token) {
        try {
          const response = await userApi.apiUsersValidateTokenPostRaw({
            body: token,
          });

          const responseBody = await response.raw.json();

          setIsAuthenticated(true);
          setUserRole(responseBody.role); // Set user role from response
        } catch (error) {
          console.error("Token validation failed:", error);
          sessionStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setUserRole(null);
        }
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  const handleSignin = (token: string, role: string) => {
    sessionStorage.setItem("authToken", token);
    setIsAuthenticated(true);
    setUserRole(role); // Set role on login
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setUserRole(null); // Clear role on logout
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Navigation
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          onSignOut={handleSignOut}
        />
        <div className="flex flex-col items-center justify-center flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/signin"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signin onSignin={handleSignin} />
                )
              }
            />
            <Route
              path="/signup"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Signup />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <Dashboard />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/meals"
              element={
                isAuthenticated ? <Meals /> : <Navigate to="/signin" replace />
              }
            />
            <Route
              path="/recipes"
              element={
                isAuthenticated ? (
                  <Recipes />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/meal-suggestions"
              element={
                isAuthenticated ? (
                  <MealSuggestions />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && userRole === "admin" ? (
                  <Admin />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
