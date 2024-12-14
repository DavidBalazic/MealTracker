import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../Components/ui/dialog";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import api from "../../lib/axios";
import { ObjectId } from "bson";

interface CreateMealProps {
  onMealPlanCreated: () => Promise<void>;
}

const CreateMeal: React.FC<CreateMealProps> = ({ onMealPlanCreated }) => {
  const [open, setOpen] = useState(false);
  const [mealPlanDate, setMealPlanDate] = useState<Date | null>(null);
  const [meals, setMeals] = useState([
    {
      id: new ObjectId().toHexString(),
      name: "",
      foodItems: [{ id: new ObjectId().toHexString(), name: "", calories: 0 }],
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddMeal = () => {
    setMeals([
      ...meals,
      {
        id: new ObjectId().toHexString(),
        name: "",
        foodItems: [
          { id: new ObjectId().toHexString(), name: "", calories: 0 },
        ],
      },
    ]);
  };

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
    setMeals(updatedMeals);
  };

  const handleCreateMealPlan = async () => {
    if (!mealPlanDate || meals.some((meal) => meal.name.trim() === "")) {
      alert("Please fill out all required fields.");
      return;
    }

    const mealPlan = {
      id: new ObjectId().toHexString(),
      date: mealPlanDate.toISOString(),
      meals: meals.map((meal) => ({
        ...meal,
        foodItems: meal.foodItems.filter((item) => item.name.trim() !== ""),
        calories: meal.foodItems.reduce((sum, item) => sum + item.calories, 0),
      })),
    };

    try {
      setLoading(true);
      await api.post("/mealtracker/mealplan", mealPlan);
      alert("Meal plan created successfully!");
      setOpen(false);
      setMealPlanDate(null);
      setMeals([
        {
          id: new ObjectId().toHexString(),
          name: "",
          foodItems: [
            { id: new ObjectId().toHexString(), name: "", calories: 0 },
          ],
        },
      ]);
      await onMealPlanCreated();
    } catch (error) {
      console.error("Failed to create meal plan", error);
      alert("Failed to create meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md">
            Create Meal Plan
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-h-[90vh] w-[90%] overflow-hidden rounded-lg shadow-md"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-grow p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <DatePicker
                selected={mealPlanDate}
                onChange={(date: Date | null) => setMealPlanDate(date)}
                className="w-full border border-gray-300 rounded-md p-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select a date"
              />
            </div>
            {meals.map((meal, mealIndex) => (
              <div
                key={meal.id}
                className="p-4 border border-gray-200 rounded-md space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Name
                  </label>
                  <Input
                    placeholder="Enter meal name"
                    value={meal.name}
                    onChange={(e) =>
                      handleMealChange(mealIndex, "name", e.target.value)
                    }
                  />
                </div>
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
          <DialogFooter className="p-4">
            <Button
              onClick={() => setOpen(false)}
              variant="secondary"
              className="bg-gray-300 text-black hover:bg-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMealPlan}
              className="bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Meal Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateMeal;
