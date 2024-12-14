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
  const [mealName, setMealName] = useState<string>("");
  const [foodItems, setFoodItems] = useState([
    { id: new ObjectId().toHexString(), name: "", calories: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddFoodItem = () => {
    setFoodItems([
      ...foodItems,
      { id: new ObjectId().toHexString(), name: "", calories: 0 },
    ]);
  };

  const handleFoodItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedFoodItems = [...foodItems];
    updatedFoodItems[index] = { ...updatedFoodItems[index], [field]: value };
    setFoodItems(updatedFoodItems);
  };

  const handleCreateMealPlan = async () => {
    if (!mealPlanDate || mealName.trim() === "") {
      alert("Please fill out all required fields.");
      return;
    }

    const mealPlan = {
      id: new ObjectId().toHexString(),
      date: mealPlanDate.toISOString(),
      meals: [
        {
          id: new ObjectId().toHexString(),
          name: mealName,
          foodItems: foodItems.filter((item) => item.name.trim() !== ""),
          calories: foodItems.reduce((sum, item) => sum + item.calories, 0),
        },
      ],
    };

    try {
      setLoading(true);
      await api.post("/mealtracker/mealplan", mealPlan);
      alert("Meal plan created successfully!");
      setOpen(false);
      setMealPlanDate(null);
      setMealName("");
      setFoodItems([
        { id: new ObjectId().toHexString(), name: "", calories: 0 },
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
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            Create Meal Plan
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Name
              </label>
              <Input
                placeholder="Enter meal name"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Items
              </label>
              {foodItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-4 mb-2">
                  <Input
                    placeholder="Food name"
                    value={item.name}
                    onChange={(e) =>
                      handleFoodItemChange(index, "name", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Calories"
                    value={item.calories}
                    onChange={(e) =>
                      handleFoodItemChange(
                        index,
                        "calories",
                        parseInt(e.target.value) || 0
                      )
                    }
                  />
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={handleAddFoodItem}
                className="mt-2"
              >
                Add Food Item
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleCreateMealPlan}
              className="bg-blue-500 text-white hover:bg-blue-600"
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
