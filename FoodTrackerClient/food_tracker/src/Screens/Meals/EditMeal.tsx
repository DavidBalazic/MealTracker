import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import api from "../../lib/axios";
import { ObjectId } from "bson";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
}

interface Meal {
  id: string;
  name: string;
  foodItems: FoodItem[];
  calories: number;
}

interface MealPlan {
  id: string;
  date: string;
  meals: Meal[];
}

interface EditMealProps {
  mealPlan: MealPlan;
  onClose: () => void;
  onMealPlanUpdated: () => Promise<void>;
}

const EditMeal: React.FC<EditMealProps> = ({
  mealPlan,
  onClose,
  onMealPlanUpdated,
}) => {
  const [mealPlanDate, setMealPlanDate] = useState<Date>(
    new Date(mealPlan.date)
  );
  const [meals, setMeals] = useState<Meal[]>(mealPlan.meals || []);
  const [loading, setLoading] = useState(false);

  const handleMealChange = (
    mealIndex: number,
    field: "name" | "foodItems",
    value: any
  ) => {
    const updatedMeals = [...meals];
    if (field === "name") {
      updatedMeals[mealIndex].name = value;
    } else if (field === "foodItems") {
      updatedMeals[mealIndex].foodItems = value;
    }
    setMeals(updatedMeals);
  };

  const handleAddMeal = () => {
    setMeals([
      ...meals,
      {
        id: new ObjectId().toHexString(),
        name: "",
        foodItems: [
          { id: new ObjectId().toHexString(), name: "", calories: 0 },
        ],
        calories: 0,
      },
    ]);
  };

  const handleAddFoodItem = (mealIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foodItems.push({
      id: new ObjectId().toHexString(),
      name: "",
      calories: 0,
    });
    setMeals(updatedMeals);
  };

  const handleFoodItemChange = (
    mealIndex: number,
    foodItemIndex: number,
    field: "name" | "calories",
    value: any
  ) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foodItems[foodItemIndex] = {
      ...updatedMeals[mealIndex].foodItems[foodItemIndex],
      [field]: value,
    };

    // Recalculate meal calories
    updatedMeals[mealIndex].calories = updatedMeals[mealIndex].foodItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    setMeals(updatedMeals);
  };

  const handleRemoveFoodItem = (mealIndex: number, foodItemIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foodItems = updatedMeals[
      mealIndex
    ].foodItems.filter((_, i) => i !== foodItemIndex);

    // Recalculate meal calories
    updatedMeals[mealIndex].calories = updatedMeals[mealIndex].foodItems.reduce(
      (sum, item) => sum + item.calories,
      0
    );
    setMeals(updatedMeals);
  };

  const handleRemoveMeal = (mealIndex: number) => {
    setMeals(meals.filter((_, i) => i !== mealIndex));
  };

  const handleSaveChanges = async () => {
    if (!mealPlanDate || meals.some((meal) => meal.name.trim() === "")) {
      alert("Please fill out all required fields.");
      return;
    }

    const updatedMealPlan = {
      ...mealPlan,
      date: mealPlanDate.toISOString(),
      meals: meals.map((meal) => ({
        ...meal,
        foodItems: meal.foodItems.filter((item) => item.name.trim() !== ""),
        calories: meal.foodItems.reduce((sum, item) => sum + item.calories, 0),
      })),
    };

    try {
      setLoading(true);
      await api.put(`/mealtracker/mealplan/${mealPlan.id}`, updatedMealPlan);
      alert("Meal plan updated successfully!");
      onMealPlanUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to update meal plan", error);
      alert("Failed to update meal plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMealPlan = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this meal plan? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await api.delete(`/mealtracker/mealplan/${mealPlan.id}`);
      alert("Meal plan deleted successfully!");
      onMealPlanUpdated();
      onClose();
    } catch (error) {
      console.error("Failed to delete meal plan", error);
      alert("Failed to delete meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="max-h-[90vh] w-[90%] overflow-hidden rounded-lg shadow-md"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-grow p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <DatePicker
              selected={mealPlanDate}
              onChange={(date: Date | null) => setMealPlanDate(date!)}
              className="w-full border border-gray-300 rounded-md p-2"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          {meals.map((meal, mealIndex) => (
            <div
              key={meal.id}
              className="p-4 border border-gray-200 rounded-md space-y-4"
            >
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Meal Name
                </label>
                <Button
                  variant="secondary"
                  onClick={() => handleRemoveMeal(mealIndex)}
                  className="text-red-500"
                >
                  Remove Meal
                </Button>
              </div>
              <Input
                placeholder="Enter meal name"
                value={meal.name}
                onChange={(e) =>
                  handleMealChange(mealIndex, "name", e.target.value)
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Items
                </label>
                {meal.foodItems.map((item, foodItemIndex) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 mb-2"
                  >
                    <Input
                      placeholder="Food name"
                      value={item.name}
                      onChange={(e) =>
                        handleFoodItemChange(
                          mealIndex,
                          foodItemIndex,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Calories"
                      value={item.calories}
                      onChange={(e) =>
                        handleFoodItemChange(
                          mealIndex,
                          foodItemIndex,
                          "calories",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleRemoveFoodItem(mealIndex, foodItemIndex)
                      }
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => handleAddFoodItem(mealIndex)}
                  className="mt-2 bg-gray-300 text-black hover:bg-gray-400"
                >
                  Add Food Item
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={handleAddMeal}
            className="w-full mt-4 bg-gray-300 text-black hover:bg-gray-400"
          >
            Add Another Meal
          </Button>
        </div>
        <DialogFooter className="p-4 flex justify-between">
          <Button
            onClick={handleDeleteMealPlan}
            variant="secondary"
            className="bg-red-500 text-white hover:bg-red-600"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Meal Plan"}
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-gray-300 text-black hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              className="bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMeal;
