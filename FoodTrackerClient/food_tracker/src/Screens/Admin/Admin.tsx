import React, { useEffect, useState } from "react";
import {
  fetchUsersByRole,
  updateUserRole,
  deleteUserById,
  User,
} from "./AdminApi";
import { Button } from "../../Components/ui/button"; // ShadCN Button
import { Input } from "../../Components/ui/input"; // ShadCN Input
import { Card, CardContent } from "../../Components/ui/card"; // ShadCN Card

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleUpdateUserId, setRoleUpdateUserId] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [errorLogs, setErrorLogs] = useState<string[]>([]); // Error logs for the terminal

  const getAuthToken = () => sessionStorage.getItem("authToken") || "";

  const logError = (message: string) => {
    setErrorLogs((prevLogs) => [...prevLogs, message]); // Add new error to logs
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const jwtToken = getAuthToken();

    if (!jwtToken) {
      setError("User is not authenticated.");
      logError("User is not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const users = await fetchUsersByRole("user", jwtToken);
      setUsers(users);
    } catch (err) {
      const errorMessage = "Failed to fetch users.";
      setError(errorMessage);
      logError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async () => {
    if (!roleUpdateUserId || !newRole) {
      const errorMessage = "Please provide both user ID and new role.";
      setError(errorMessage);
      logError(errorMessage);
      return;
    }
    setLoading(true);
    setError(null);
    const jwtToken = getAuthToken();

    try {
      await updateUserRole(roleUpdateUserId, newRole, jwtToken);
      alert("User role updated successfully.");
      fetchUsers(); // Refresh the user list after updating the role
    } catch (err) {
      const errorMessage = "Failed to update user role.";
      setError(errorMessage);
      logError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
      setRoleUpdateUserId("");
      setNewRole("");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    setLoading(true);
    setError(null);
    const jwtToken = getAuthToken();

    try {
      await deleteUserById(userId, jwtToken);
      alert("User deleted successfully.");
      fetchUsers(); // Refresh the user list after deleting a user
    } catch (err) {
      const errorMessage = "Failed to delete user.";
      setError(errorMessage);
      logError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">Admin Panel</h1>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <div className="flex flex-wrap justify-center space-x-4 mt-4">
            <Input
              placeholder="User ID"
              value={roleUpdateUserId}
              onChange={(e) => setRoleUpdateUserId(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="New Role"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-64"
            />
            <Button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition-all duration-300"
              onClick={handleUpdateUserRole}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </div>
        </div>
        {loading ? (
          <p className="text-center text-lg">Loading users...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card
                key={user.id}
                className="shadow-md hover:shadow-lg transform transition-all duration-500"
              >
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-black mb-2">
                    {user.email}
                  </h2>
                  <p className="text-sm text-gray-600">
                    <strong>ID:</strong> {user.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Role:</strong> {user.role}
                  </p>
                  <div className="flex justify-end mt-4 space-x-4">
                    <Button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {/* Terminal for Error Logs */}
        <div className="mt-8">
          <Card className="bg-black text-white p-6 relative">
            <h2 className="text-xl font-bold mb-4">Error Logs</h2>
            <div className="overflow-y-auto max-h-48">
              {errorLogs.length === 0 ? (
                <p className="text-gray-400">.</p>
              ) : (
                errorLogs.map((log, index) => (
                  <p key={index} className="text-sm">
                    {log}
                  </p>
                ))
              )}
            </div>
            {/* Blinking Cursor */}
            <div className="absolute bottom-4 left-6 text-white">
              <span className="bg-white text-black px-1 animate-pulse">_</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
