import React from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom"; // Added for navigation

interface SigninProps {
  onSignin: () => void;
}

const Signin: React.FC<SigninProps> = ({ onSignin }) => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSignupRedirect = () => {
    navigate("/signup"); // Redirect to the signup page
  };

  const handleSignin = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for sign-in logic
    onSignin(); // Call the onSignin callback when sign-in is complete
  };

  return (
    <div className="w-full max-w-md mx-auto mt-16">
      {" "}
      {/* Adjusted mt-16 for positioning */}
      <Card className="shadow-2xl rounded-lg bg-white border border-gray-300">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-black">Sign In</h2>
          <form className="space-y-6" onSubmit={handleSignin}>
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <div>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
            >
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-center text-black">
            Don't have an account?{" "}
            <span
              onClick={handleSignupRedirect} // Trigger redirect on click
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
