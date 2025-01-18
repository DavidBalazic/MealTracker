import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button } from "../../Components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "../../Components/ui/dialog";
import { mealTrackerApi } from "../../lib/axios";
import {
  MealPlan,
  Meal,
  Food,
} from "../../ClientGenerator/generated/MealTrackerClient/models";
import { ObjectId } from "bson";
import { logUserAction } from "../../lib/utils";

interface CreateMealProps {
  onMealPlanCreated: () => Promise<void>;
}

const CreateMeal: React.FC<CreateMealProps> = ({ onMealPlanCreated }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [mealPlanDate, setMealPlanDate] = useState<Date | null>(new Date());
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: new ObjectId().toHexString(),
      name: "",
      foods: [],
      foodIds: [],
      calories: 0,
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  // Add a new food to a meal
  const handleAddFood = (mealIndex: number) => {
    const newFood: Food = {
      id: new ObjectId().toHexString(),
      name: "",
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      servingSize: "",
      unit: "",
      allergens: [],
    };

    setMeals((prevMeals) => {
      const updatedMeals = [...prevMeals];
      updatedMeals[mealIndex].foods = [
        ...(updatedMeals[mealIndex].foods ?? []),
        newFood,
      ];
      updatedMeals[mealIndex].foodIds = [
        ...(updatedMeals[mealIndex].foodIds ?? []).filter(
          (id): id is string => id != null
        ),
        newFood.id!,
      ];
      return updatedMeals;
    });
  };

  // Add a new allergen to a food
  const handleAddAllergen = (mealIndex: number, foodIndex: number) => {
    setMeals((prevMeals) => {
      const updatedMeals = [...prevMeals];
      const food = updatedMeals[mealIndex].foods?.[foodIndex];
      if (food) {
        food.allergens = [...(food.allergens || []), ""];
      }
      return updatedMeals;
    });
  };

  // Handle changes to food inputs
  const handleFoodChange = (
    mealIndex: number,
    foodIndex: number,
    field: keyof Food,
    value: any
  ) => {
    setMeals((prevMeals) => {
      const updatedMeals = [...prevMeals];
      const food = {
        ...(updatedMeals[mealIndex].foods?.[foodIndex] ?? {}),
        [field]: value,
      };
      updatedMeals[mealIndex].foods![foodIndex] = food;
      return updatedMeals;
    });
  };

  // Add a new meal
  const handleAddMeal = () => {
    setMeals([
      ...meals,
      {
        id: new ObjectId().toHexString(),
        name: "",
        foods: [],
        foodIds: [],
        calories: 0,
      },
    ]);
  };

  // Create Meal Plan
  const handleCreateMealPlan = async () => {
    const newMealPlan: MealPlan = {
      id: new ObjectId().toHexString(),
      date: mealPlanDate || new Date(),
      meals: meals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        foodIds: meal.foods?.map((food) => food.id!) || [],
        foods: meal.foods,
        calories:
          meal.foods?.reduce((sum, food) => sum + (food.calories || 0), 0) || 0,
      })),
    };

    try {
      setLoading(true);
      await mealTrackerApi.apiMealTrackerMealplanPost({
        mealPlan: newMealPlan,
      });

      // Log user action
      logUserAction("CREATE_MEAL_PLAN", {
        mealPlanId: newMealPlan.id,
        mealPlanName: meals.map((meal) => meal.name).join(", "),
      });

      alert("Meal plan created successfully!");
      await onMealPlanCreated();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create meal plan", error);
      alert("Failed to create meal plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Meal Plan</Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-xl font-bold mb-4">Create New Meal Plan</h2>
        <div>
          <label>Select Date</label>
          <DatePicker
            selected={mealPlanDate}
            onChange={(date) => setMealPlanDate(date)}
            className="w-full border p-2 rounded"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {meals.map((meal, mealIndex) => (
          <div key={meal.id} className="p-4 border rounded mb-4">
            <label>Meal Name</label>
            <input
              type="text"
              value={meal.name || ""}
              onChange={(e) =>
                setMeals((prevMeals) => {
                  const updatedMeals = [...prevMeals];
                  updatedMeals[mealIndex].name = e.target.value;
                  return updatedMeals;
                })
              }
              className="w-full border p-2 rounded mb-2"
            />

            {(meal.foods || []).map((food, foodIndex) => (
              <div key={food.id} className="mb-2 p-2 border rounded">
                <label>Food Name</label>
                <input
                  type="text"
                  value={food.name || ""}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Calories</label>
                <input
                  type="number"
                  value={food.calories || 0}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "calories",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Protein</label>
                <input
                  type="number"
                  value={food.protein || 0}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "protein",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Carbohydrates</label>
                <input
                  type="number"
                  value={food.carbohydrates || 0}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "carbohydrates",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Fat</label>
                <input
                  type="number"
                  value={food.fat || 0}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "fat",
                      Number(e.target.value)
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Serving Size</label>
                <input
                  type="text"
                  value={food.servingSize || ""}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "servingSize",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                <label>Unit</label>
                <input
                  type="text"
                  value={food.unit || ""}
                  onChange={(e) =>
                    handleFoodChange(
                      mealIndex,
                      foodIndex,
                      "unit",
                      e.target.value
                    )
                  }
                  className="w-full border p-2 rounded"
                />
                {/* Add Allergen Button */}
                <label>Allergens</label>
                {food.allergens?.map((allergen, allergenIndex) => (
                  <input
                    key={allergenIndex}
                    type="text"
                    value={allergen || ""}
                    onChange={(e) =>
                      handleFoodChange(mealIndex, foodIndex, "allergens", [
                        ...(food.allergens?.slice(0, allergenIndex) || []),
                        e.target.value,
                        ...(food.allergens?.slice(allergenIndex + 1) || []),
                      ])
                    }
                    className="w-full border p-2 rounded mb-2"
                  />
                ))}
                <Button onClick={() => handleAddAllergen(mealIndex, foodIndex)}>
                  Add Allergen
                </Button>
              </div>
            ))}
            <Button onClick={() => handleAddFood(mealIndex)}>Add Food</Button>
          </div>
        ))}

        <Button onClick={handleAddMeal}>Add Meal</Button>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateMealPlan} disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMeal;
