# Meal Suggestion Service

Part of `Food Tracker`

Takes Food from `FoodService` and Recipes from `RecipeService` and finds a meal suggestion for the user that matches best the user's daily calorie goal from `MealTrackerService`

## Run

### With Docker

```
docker compose up
```

runs the Meal suggestion service with a connected MongoDB

Enviroments set in docker-compose:

> PORT=3002

## Environments

Environments and their default values
```
INSECURE_ACCESS = false
MONGO_URL = mongodb://mongodb:27017/mealsuggestion-service
PORT = 3002
USER_SERVICE_URL
FOOD_SERVICE_URL
RECIPE_SERVICE_URL
MEAL_TRACKER_SERVICE_URL
```

## Documentation

### Served
The swagger documentation can be found at 

```
http://<API_url>/doc
```

### File

The swagger json file is located at

```
./swagger.json
```

### Build documentation

To build the swager json file after a change or if it is missing run

```bash
docker compose -f docker-compose.swagger.yaml up --build
```

After building swagger you might want to

```bash
docker compose -f docker-compose.swagger.yaml down --rmi=local
```

All in one command

```bash
docker compose -f docker-compose.swagger.yaml up --build && docker compose -f docker-compose.swagger.yaml down --rmi=local
```