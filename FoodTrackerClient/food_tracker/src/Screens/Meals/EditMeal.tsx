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
} from "../../ClientGenerator/generated/MealTrackerClient/models";

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
    mealPlan.date ? new Date(mealPlan.date) : new Date()
  );
  const [meals, setMeals] = useState<Meal[]>(mealPlan.meals || []);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveChanges = async () => {
    const updatedMealPlan: MealPlan = {
      ...mealPlan,
      date: mealPlanDate, // Ensure `date` remains a Date object
      meals,
    };

    try {
      setLoading(true);
      await mealTrackerApi.apiMealTrackerMealplanIdPut({
        id: mealPlan.id!,
        mealPlan: updatedMealPlan,
      });
      alert("Meal plan updated successfully!");
      await onMealPlanUpdated();
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Meal Plan</DialogTitle>
        </DialogHeader>
        <div>
          <label className="block mb-2 text-gray-700">Date</label>
          <DatePicker
            selected={mealPlanDate}
            onChange={(date) => setMealPlanDate(date || new Date())}
            dateFormat="yyyy-MM-dd"
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          {meals.map((meal, index) => (
            <div key={meal.id} className="mb-4">
              <label className="block mb-1 text-gray-700">Meal Name</label>
              <input
                value={meal.name || ""}
                onChange={(e) =>
                  setMeals((prev) =>
                    prev.map((m, i) =>
                      i === index ? { ...m, name: e.target.value } : m
                    )
                  )
                }
                className="w-full border p-2 rounded"
                placeholder="Enter meal name"
              />
            </div>
          ))}
        </div>
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMeal;
