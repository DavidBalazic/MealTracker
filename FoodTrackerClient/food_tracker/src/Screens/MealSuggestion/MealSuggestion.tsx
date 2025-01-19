import React, { useEffect, useState } from "react";
import {
  getMealSuggestions,
  createMealSuggestion,
  MealSuggestion as MealSuggestionType,
} from "../../lib/MealSuggestionApi";

const MealSuggestion = () => {
  const [mealSuggestions, setMealSuggestions] = useState<MealSuggestionType[]>(
    []
  );
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const userId = "678908be8b71ee9da9b2a476"; // Replace with dynamic user ID logic if applicable
  const jwtToken = sessionStorage.getItem("authToken") || ""; // Retrieve the JWT token from sessionStorage

  // Fetch meal suggestions when the component is mounted
  useEffect(() => {
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
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Meal Suggestions</h1>
      {error && <p className="text-red-500">{error}</p>}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={handleCreateSuggestion}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Create Meal Suggestion"}
      </button>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {mealSuggestions.map((suggestion) => (
            <li key={suggestion._id} className="border p-2 mb-2">
              <p>
                <strong>Recipe Name:</strong> {suggestion.recipeName}
              </p>
              <p>
                <strong>Tags:</strong> {suggestion.recipeTags}
              </p>
              <p>
                <strong>Liked:</strong> {suggestion.liked ? "Yes" : "No"}
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {suggestion.timestamp
                  ? new Date(suggestion.timestamp).toLocaleString()
                  : "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MealSuggestion;
