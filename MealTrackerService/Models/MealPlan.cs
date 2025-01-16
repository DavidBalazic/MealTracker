using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace MealTrackerService.Models
{
    /// <summary>
    /// Represents a meal plan, which includes meals scheduled for a specific date.
    /// </summary>
    public class MealPlan
    {
        /// <summary>
        /// The unique identifier of the meal plan.
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        /// <summary>
        /// The date associated with the meal plan.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// A list of meals included in the meal plan.
        /// </summary>
        public List<Meal> Meals { get; set; } = new List<Meal>();
    }
}