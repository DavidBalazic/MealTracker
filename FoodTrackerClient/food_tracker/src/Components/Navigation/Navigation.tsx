import React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";

const Navigation: React.FC = () => {
  return (
    <NavigationMenu className="w-full bg-white text-black">
      <div className="container mx-auto flex justify-between items-center p-2">
        <NavigationMenuList className="flex space-x-6">
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/home"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/dashboard"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Dashboard
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/meals"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Meals
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/recipes"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Recipes
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/about"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              About
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              href="/signin"
              className="hover:bg-gray-100 hover:rounded-md px-3 py-2 text-sm font-medium transition-all"
            >
              Sign In
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
};

export default Navigation;
