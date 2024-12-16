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
} from "../../ClientGenerator/generated/MealTrackerClient/models";
import { ObjectId } from "bson";

interface CreateMealProps {
  onMealPlanCreated: () => Promise<void>;
}

const CreateMeal: React.FC<CreateMealProps> = ({ onMealPlanCreated }) => {
  const [open, setOpen] = useState<boolean>(false); // State for dialog visibility
  const [mealPlanDate, setMealPlanDate] = useState<Date | null>(new Date());
  const [meals, setMeals] = useState<Meal[]>([
    { id: new ObjectId().toHexString(), name: "", calories: 0 },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCreateMealPlan = async () => {
    const newMealPlan: MealPlan = {
      id: new ObjectId().toHexString(),
      date: mealPlanDate || new Date(), // Ensure `date` is a Date object
      meals,
    };

    try {
      setLoading(true);
      await mealTrackerApi.apiMealTrackerMealplanPost({
        mealPlan: newMealPlan,
      });
      alert("Meal plan created successfully!");
      await onMealPlanCreated();
      setOpen(false); // Close dialog on success
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
        <Button className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md">
          Create New Meal Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="space-y-4">
        <h2 className="text-xl font-semibold">Create New Meal Plan</h2>
        <div>
          <label className="block text-gray-700 mb-1">Select Date</label>
          <DatePicker
            selected={mealPlanDate}
            onChange={(date) => setMealPlanDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Meals</label>
          {meals.map((meal, index) => (
            <div key={meal.id} className="flex items-center gap-4 mb-2">
              <input
                type="text"
                placeholder="Meal Name"
                value={meal.name || ""} // Ensure value is never null
                onChange={(e) => {
                  const updatedMeals = [...meals];
                  updatedMeals[index].name = e.target.value || "";
                  setMeals(updatedMeals);
                }}
                className="w-full border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Calories"
                value={meal.calories ?? 0} // Ensure value is a number
                onChange={(e) => {
                  const updatedMeals = [...meals];
                  updatedMeals[index].calories = Number(e.target.value) || 0;
                  setMeals(updatedMeals);
                }}
                className="w-32 border p-2 rounded"
              />
            </div>
          ))}
          <Button
            onClick={() =>
              setMeals([
                ...meals,
                { id: new ObjectId().toHexString(), name: "", calories: 0 },
              ])
            }
            className="mt-2"
          >
            Add Meal
          </Button>
        </div>
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
