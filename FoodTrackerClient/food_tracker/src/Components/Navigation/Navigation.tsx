import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../ui/navigation-menu";

interface NavigationProps {
  isAuthenticated: boolean;
  userRole: string | null; // Include userRole
  onSignOut: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  userRole,
  onSignOut,
}) => {
  return (
    <NavigationMenu className="w-full bg-white text-black">
      <div className="container mx-auto flex justify-between items-center p-2">
        <NavigationMenuList className="flex space-x-6">
          <NavigationMenuItem>
            <Link
              to="/home"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Home
            </Link>
          </NavigationMenuItem>
          {isAuthenticated && (
            <>
              <NavigationMenuItem>
                <Link
                  to="/dashboard"
                  className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  Dashboard
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/meals"
                  className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  Meals
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/recipes"
                  className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  Recipes
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  to="/meal-suggestions"
                  className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  Meal Suggestions
                </Link>
              </NavigationMenuItem>
              {userRole === "admin" && (
                <NavigationMenuItem>
                  <Link to="/admin" className="hover:bg-gray-100 px-3 py-2">
                    Admin
                  </Link>
                </NavigationMenuItem>
              )}
            </>
          )}
          <NavigationMenuItem>
            <Link
              to="/about"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              About
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuItem>
            {isAuthenticated ? (
              <button
                onClick={onSignOut}
                className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/signin"
                className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
              >
                Sign In
              </Link>
            )}
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
};

export default Navigation;
