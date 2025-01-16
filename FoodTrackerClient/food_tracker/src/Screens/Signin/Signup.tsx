import React, { useState } from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom";
import { userApi } from "../../lib/axios";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSigninRedirect = () => {
    navigate("/signin");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== repeatPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const registerDTO = { email, password };

      // Call the register endpoint using the generated API
      const response = await userApi.apiUsersRegisterPostRaw({ registerDTO });

      // Extract JSON data from the response
      const responseBody = await response.raw.json();

      console.log("API Response Body:", responseBody);

      alert("Signup successful! Please sign in.");
      navigate("/signin");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      <Card className="shadow-2xl rounded-lg bg-white border border-gray-300">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-black">Sign Up</h2>
          <form className="space-y-6" onSubmit={handleSignup}>
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
            <div>
              <Input
                id="repeatPassword"
                type="password"
                placeholder="Repeat Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-black">
            Already have an account?{" "}
            <span
              onClick={handleSigninRedirect}
              className="text-gray-600 hover:text-black cursor-pointer"
            >
              Sign in
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
