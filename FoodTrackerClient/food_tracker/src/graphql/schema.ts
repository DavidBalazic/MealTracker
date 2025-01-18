import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  # Food type definition
  type Food {
    id: ID!
    name: String!
    calories: Float!
    protein: Float!
    carbohydrates: Float!
    fat: Float!
    servingSize: String
    unit: String
    allergens: [String]
  }

  # Meal type definition
  type Meal {
    id: ID!
    name: String!
    foodIds: [ID!]!
    foods: [Food!]!
    calories: Int!
  }

  # MealPlan type definition
  type MealPlan {
    id: ID!
    date: Date!
    meals: [Meal!]!
  }

  # Query type definition
  type Query {
    # Fetch all foods
    getFoods: [Food!]!

    # Fetch a specific food by ID
    getFoodById(id: ID!): Food

    # Fetch all meals
    getMeals: [Meal!]!

    # Fetch a specific meal by ID
    getMealById(id: ID!): Meal

    # Fetch all meal plans
    getMealPlans: [MealPlan!]!

    # Fetch a specific meal plan by ID
    getMealPlanById(id: ID!): MealPlan
  }
`;
