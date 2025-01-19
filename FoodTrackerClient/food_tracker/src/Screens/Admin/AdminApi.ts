import axios from "axios";

// Define the base URL for the Admin API
const baseURL = `${process.env.REACT_APP_USER_SERVICE_URL}/api`;

// Create an axios instance for the Admin API
const adminApi = axios.create({
  baseURL,
});

// Define types for the user object
export interface User {
  id: string;
  email: string;
  role: string;
}

// API Methods

/**
 * Fetch all users by role.
 *
 * @param role - The role to filter users by.
 * @param token - The JWT token for authentication.
 * @returns A promise resolving to an array of User objects.
 */
export const fetchUsersByRole = async (
  role: string,
  token: string
): Promise<User[]> => {
  try {
    const response = await adminApi.get<User[]>(`/Users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: { role },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching users:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch users");
  }
};

/**
 * Update a user's role.
 *
 * @param userId - The ID of the user to update.
 * @param newRole - The new role to assign to the user.
 * @param token - The JWT token for authentication.
 */
export const updateUserRole = async (
  userId: string,
  newRole: string,
  token: string
): Promise<void> => {
  try {
    await adminApi.put(
      `/Users/admin/update-role/${userId}`,
      `"${newRole}"`, // API expects a string in the body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error updating user role:", error);
    throw new Error(
      error.response?.data?.error || "Failed to update user role"
    );
  }
};

/**
 * Delete a user by ID.
 *
 * @param userId - The ID of the user to delete.
 * @param token - The JWT token for authentication.
 */
export const deleteUserById = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    await adminApi.delete(`/Users/admin/delete-user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error(error.response?.data?.error || "Failed to delete user");
  }
};
