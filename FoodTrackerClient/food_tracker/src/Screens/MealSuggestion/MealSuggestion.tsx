import React, { useEffect, useState } from "react";
import { Button } from "../../Components/ui/button"; // Button from shadcn
import { Card, CardContent } from "../../Components/ui/card"; // Card from shadcn
import {
  getMealSuggestions,
  createMealSuggestion,
  MealSuggestion as MealSuggestionType,
} from "../../lib/MealSuggestionApi";

// Define a type for the decoded JWT token payload
interface DecodedToken {
  sub: string; // Subject (user ID)
  email: string;
  role: string;
  iat: number;
  nbf: number;
  exp: number;
  iss: string;
}

const decodeJwtToken = (token: string): DecodedToken | null => {
  try {
    const payload = token.split(".")[1]; // Extract the payload part of the JWT
    const decodedPayload = atob(payload); // Decode the Base64-encoded payload
    return JSON.parse(decodedPayload); // Parse the payload into a JavaScript object
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

const MealSuggestion: React.FC = () => {
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestionType[]>(
    []
  );
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  const jwtToken = sessionStorage.getItem("authToken") || ""; // Retrieve the JWT token from sessionStorage

  useEffect(() => {
    // Decode the JWT token to extract the userId (from `sub`)
    if (jwtToken) {
      const decoded = decodeJwtToken(jwtToken);
      if (decoded && decoded.sub) {
        setUserId(decoded.sub); // Use `sub` as the userId
      } else {
        setError("Invalid authentication token.");
      }
    } else {
      setError("User is not authenticated.");
    }
  }, [jwtToken]);

  // Fetch meal suggestions when the userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchMealSuggestions = async () => {
      setIsLoading(true);
      try {
        const suggestions = await getMealSuggestions(userId, jwtToken);
        setMealSuggestions(suggestions);
      } catch (err) {
        setError("Failed to fetch meal suggestions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMealSuggestions();
  }, [userId, jwtToken]);

  // Handle creating a new meal suggestion
  const handleCreateSuggestion = async () => {
    if (!userId) {
      setError("User ID not found.");
      return;
    }

    setIsLoading(true);
    try {
      await createMealSuggestion(userId, jwtToken);
      const updatedSuggestions = await getMealSuggestions(userId, jwtToken);
      setMealSuggestions(updatedSuggestions);
    } catch (err) {
      setError("Failed to create meal suggestion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Meal Suggestions
          </h1>
          <Button
            className="bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600 transition-all duration-300"
            onClick={handleCreateSuggestion}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Create Meal Suggestion"}
          </Button>
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealSuggestions.map((suggestion) => (
              <Card
                key={suggestion._id}
                className="shadow-md hover:shadow-xl transform transition-all duration-500"
              >
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-black mb-2">
                    {suggestion.recipeName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>Tags:</strong> {suggestion.recipeTags || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Liked:</strong> {suggestion.liked ? "Yes" : "No"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Timestamp:</strong>{" "}
                    {suggestion.timestamp
                      ? new Date(suggestion.timestamp).toLocaleString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSuggestion;
