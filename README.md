# 🥗 Meal Tracker App

A modern, scalable Meal Tracker application built using **microservice architecture**, designed to help users log, manage, and gain insights into their dietary habits. The system is developed with **C#**, **JavaScript**, and leverages both **RESTful APIs** and **GraphQL** for flexible and efficient communication.

---

## 🚀 Architecture Overview

The application is composed of independent services that communicate over well-defined APIs, supporting high scalability, maintainability, and fault isolation.

### 🔧 Technologies Used

- **Microservices**: C#, JavaScript (Node.js), Python
- **API Communication**: REST + GraphQL

## 🧩 Key Features

- 🍽️ **Meal Logging**: Log meals with among hundresds of available foods with details.
- 📊 **Meal suggestions**: Personalised meal suggestions based on dietary goals.
- 🔔 **Notifications**: Reminders for meal logging.
- 🔄 **REST + GraphQL APIs**: Choose between REST and GraphQL for interacting with our services.

---

## 🛠️ Microservices Overview

| Service                 | Technology | Description                                     |
|--------------------------------|------------|-------------------------------------------------------------------------|
| `UserService`                  | C#         | Manages user authentication, profiles, and preferences                  |
| `MealTrackerService`           | C#         | Core service for logging and retrieving meals                          |
| `FoodService`                  | C#         | Provides structured food item data and metadata                         |
| `RecipeService`                | C#         | Manages recipes and user-submitted meals                                |
| `NotificationService`          | JavaScript | Sends reminders and alerts                                              |
| `MealSuggestionService`        | JavaScript | Provides intelligent meal suggestions                                   |
| `ErrorService`                 | JavaScript | Centralized error logging and monitoring                                |
| `StatisticsService`            | JavaScript | Computes user statistics, trends, and visual summaries                  |
| `NutritionService`             | Python     | Analyzes nutritional content of meals and food items                    |
| `RecipeRecommendationService` | Python     | Provides recipe recommendations based on user history                    |


---
