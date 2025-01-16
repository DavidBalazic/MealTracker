import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../lib/axios"; // Assuming this is the generated API class.

interface SigninProps {
  onSignin: (token: string) => void; // Pass the token to parent
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

      // Extract JSON data from the response
      const responseBody = await response.raw.json();

      // Extract the token from the parsed JSON response
      const token = responseBody?.token;

      if (!token) {
        throw new Error("No token received in the response");
      }

      // Pass the token to the parent component
      onSignin(token);
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
