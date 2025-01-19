import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../lib/axios";

// JWT decoding function
const decodeJwtToken = (token: string): { role: string } | null => {
  try {
    const payload = token.split(".")[1]; // Extract the payload part of the JWT
    const decodedPayload = atob(payload); // Decode the Base64-encoded payload
    return JSON.parse(decodedPayload); // Parse the payload into a JavaScript object
  } catch (error) {
    console.error("Failed to decode JWT token:", error);
    return null;
  }
};

interface SigninProps {
  onSignin: (token: string, role: string) => void; // Accept both token and role
}

const Signin: React.FC<SigninProps> = ({ onSignin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginDTO = { email, password };

      // Call the login endpoint using the generated API
      const response = await userApi.apiUsersLoginPostRaw({ loginDTO });
      const responseBody = await response.raw.json();

      console.log("API Response Body:", responseBody); // Debug log

      const token = responseBody?.token;

      if (!token) {
        throw new Error("Invalid token in response");
      }

      // Decode the token to extract the role
      const decoded = decodeJwtToken(token);
      const role = decoded?.role;

      if (!role) {
        throw new Error("Role not found in token");
      }

      // Pass both token and role to the parent component
      onSignin(token, role);
      alert("Signin successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Signin failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      <Card className="shadow-2xl rounded-lg bg-white border border-gray-300">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-black">Sign In</h2>
          <form className="space-y-6" onSubmit={handleSignin}>
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-black">
            Don't have an account?{" "}
            <span
              onClick={handleSignupRedirect}
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signin;
