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
import { mealTrackerApi } from "../../lib/axios";
import {
  MealPlan,
  Meal,
  FoodItem,
} from "../../ClientGenerator/generated/models";
import { ObjectId } from "bson"; // Import ObjectId

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
  // Ensure mealPlan.date is parsed as a Date object
  const [mealPlanDate, setMealPlanDate] = useState<Date>(
    mealPlan.date ? new Date(mealPlan.date) : new Date()
  );
  const [meals, setMeals] = useState<Meal[]>(mealPlan.meals || ([] as Meal[]));
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

  const handleAddFoodItem = (mealIndex: number) => {
    const updatedMeals = [...meals];

    // Ensure foodItems is initialized and assert the type
    updatedMeals[mealIndex].foodItems = updatedMeals[mealIndex].foodItems || [];
    (updatedMeals[mealIndex].foodItems as FoodItem[]).push({
      id: new ObjectId().toHexString(),
      name: "",
      calories: 0,
    });

    setMeals(updatedMeals);
  };

  const handleSaveChanges = async () => {
    if (!mealPlanDate || meals.some((meal) => !meal.name?.trim())) {
      alert("Please fill out all required fields.");
      return;
    }

    // Prepare the updated meal plan
    const updatedMealPlan: MealPlan = {
      ...mealPlan,
      date: mealPlanDate, // Use the Date object directly
      meals: meals.map((meal) => ({
        ...meal,
        foodItems: meal.foodItems?.filter((item) => item.name?.trim() !== ""),
        calories: meal.foodItems?.reduce(
          (sum, item) => sum + (item.calories || 0),
          0
        ),
      })),
    };

    try {
      setLoading(true);
      await mealTrackerApi.apiMealTrackerMealplanIdPut({
        id: mealPlan.id!,
        mealPlan: updatedMealPlan,
      });
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[90%] rounded-lg shadow-md">
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label>Select Date</label>
            <DatePicker
              selected={mealPlanDate}
              onChange={(date: Date | null) =>
                setMealPlanDate(date || new Date())
              }
              className="w-full border p-2 rounded"
              dateFormat="yyyy-MM-dd"
            />
          </div>
          {meals.map((meal, mealIndex) => (
            <div key={meal.id} className="p-4 border rounded-md">
              <label>Meal Name</label>
              <input
                value={meal.name || ""}
                onChange={(e) =>
                  handleMealChange(mealIndex, "name", e.target.value)
                }
                className="w-full border p-2 rounded mb-2"
              />
              <label>Food Items</label>
              {meal.foodItems?.map((item, foodItemIndex) => (
                <div key={foodItemIndex} className="flex space-x-2 mb-2">
                  <input
                    placeholder="Food Name"
                    value={item.name || ""}
                    onChange={(e) => {
                      const updatedFoodItems = meal.foodItems || [];
                      updatedFoodItems[foodItemIndex] = {
                        ...updatedFoodItems[foodItemIndex],
                        name: e.target.value,
                      };
                      handleMealChange(
                        mealIndex,
                        "foodItems",
                        updatedFoodItems
                      );
                    }}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Calories"
                    value={item.calories || 0}
                    onChange={(e) => {
                      const updatedFoodItems = meal.foodItems || [];
                      updatedFoodItems[foodItemIndex] = {
                        ...updatedFoodItems[foodItemIndex],
                        calories: Number(e.target.value),
                      };
                      handleMealChange(
                        mealIndex,
                        "foodItems",
                        updatedFoodItems
                      );
                    }}
                    className="border p-2 rounded"
                  />
                </div>
              ))}
              <Button onClick={() => handleAddFoodItem(mealIndex)}>
                Add Food Item
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-between mt-4">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMeal;
