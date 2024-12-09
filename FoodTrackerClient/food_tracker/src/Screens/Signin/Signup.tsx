import React from "react";
import { Card, CardContent } from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { useNavigate } from "react-router-dom"; // Added for navigation

interface SignupProps {
  onSignin?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignin }) => {
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSigninRedirect = () => {
    navigate("/signin"); // Redirect to the sign in page
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSignin) {
      onSignin();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      {" "}
      {/* Adjusted mt-8 for positioning */}
      <Card className="shadow-2xl rounded-lg bg-white border border-gray-300">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-black">Sign Up</h2>
          <form className="space-y-6" onSubmit={handleSignup}>
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
            <div>
              <Input
                id="repeat-password"
                type="password"
                placeholder="Repeat Password"
                className="w-full px-4 py-2 rounded-lg border-gray-400 text-black bg-gray-100"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg"
            >
              Sign Up
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
