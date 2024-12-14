import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_MEAL_TRACKER_SERVICE_URL, // Use the React-compatible environment variable
});

export default api;
