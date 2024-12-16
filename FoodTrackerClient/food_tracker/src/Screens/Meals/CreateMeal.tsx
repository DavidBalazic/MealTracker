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
import { ObjectId } from "bson"; // Import ObjectId
import { mealTrackerApi } from "../../lib/axios"; // Use generated API client
import {
  MealPlan,
  Meal,
  FoodItem,
} from "../../ClientGenerator/generated/models";

interface CreateMealProps {
  onMealPlanCreated: () => Promise<void>;
}

const CreateMeal: React.FC<CreateMealProps> = ({ onMealPlanCreated }) => {
  const [open, setOpen] = useState(false);
  const [mealPlanDate, setMealPlanDate] = useState<Date | null>(null);
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: new ObjectId().toHexString(),
      name: "",
      foodItems: [
        { id: new ObjectId().toHexString(), name: "", calories: 0 },
      ] as FoodItem[],
      calories: 0,
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
        calories: 0,
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

    // Ensure foodItems is initialized and assert the type
    updatedMeals[mealIndex].foodItems = updatedMeals[mealIndex].foodItems || [];
    (updatedMeals[mealIndex].foodItems as FoodItem[]).push({
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
    updatedMeals[mealIndex].foodItems![foodItemIndex] = {
      ...updatedMeals[mealIndex].foodItems![foodItemIndex],
      [field]: value,
    };

    // Recalculate meal calories
    updatedMeals[mealIndex].calories = updatedMeals[
      mealIndex
    ].foodItems!.reduce((sum, item) => sum + (item.calories || 0), 0);
    setMeals(updatedMeals);
  };

  const handleCreateMealPlan = async () => {
    if (!mealPlanDate || meals.some((meal) => !meal.name?.trim())) {
      alert("Please fill out all required fields.");
      return;
    }

    // Prepare the meal plan
    const mealPlan: MealPlan = {
      id: new ObjectId().toHexString(),
      date: mealPlanDate,
      meals: meals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        foodItems:
          meal.foodItems?.filter((item) => item.name?.trim() !== "") || [],
        calories:
          meal.foodItems?.reduce(
            (sum, item) => sum + (item.calories || 0),
            0
          ) || 0,
      })),
    };

    try {
      setLoading(true);
      await mealTrackerApi.apiMealTrackerMealplanPost({
        mealPlan,
      });
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
          calories: 0,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
          </DialogHeader>
          <div>
            <label>Select Date</label>
            <DatePicker
              selected={mealPlanDate}
              onChange={(date: Date | null) => setMealPlanDate(date)}
              placeholderText="Select a date"
            />
          </div>
          {meals.map((meal, mealIndex) => (
            <div key={meal.id}>
              <label>Meal Name</label>
              <Input
                value={meal.name || ""}
                onChange={(e) =>
                  handleMealChange(mealIndex, "name", e.target.value)
                }
              />
              {meal.foodItems?.map((item, foodItemIndex) => (
                <div key={item.id}>
                  <Input
                    placeholder="Food name"
                    value={item.name || ""}
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
                    value={item.calories || 0}
                    onChange={(e) =>
                      handleFoodItemChange(
                        mealIndex,
                        foodItemIndex,
                        "calories",
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              ))}
              <Button onClick={() => handleAddFoodItem(mealIndex)}>
                Add Food Item
              </Button>
            </div>
          ))}
          <Button onClick={handleAddMeal}>Add Another Meal</Button>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateMealPlan} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateMeal;
