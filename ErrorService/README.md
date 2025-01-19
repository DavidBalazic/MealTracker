# ErrorService

This service is part of the cloud deployment of the project `Food Tracker`.
It saves erorrs of the current session for the MealSuggestionsService.

## Run

You can run the service manually using docker with the Dockerfile or `npm install && npm start`, but it is meant to be built using docker and pushed to a container registry. The service is then deployed using Render.

## Environments

Environment variables and their default values:
```
PORT=3004
```