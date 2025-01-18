import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logUserAction = async (action: string, details: any) => {
  try {
    await axios.post("https://loggingservice.onrender.com/logs", {
      type: "USER_ACTION",
      action,
      details,
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
};
