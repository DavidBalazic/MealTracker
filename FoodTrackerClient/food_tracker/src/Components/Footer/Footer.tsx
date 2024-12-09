import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-300 mt-12">
      <div className="container mx-auto py-6 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="text-2xl font-bold text-black mr-2">Food Tracker</div>
        </div>
        <div className="flex space-x-6 text-gray-700 text-sm">
          <a href="/home" className="hover:underline">
            Home
          </a>
          <a href="/dashboard" className="hover:underline">
            Dashboard
          </a>
          <a href="/meals" className="hover:underline">
            Meals
          </a>
        </div>
      </div>
      <div className="container mx-auto text-center text-gray-600 text-xs mt-4 mb-8 px-4 md:px-8">
        <p className="leading-relaxed">
          <strong>Use it with caution:</strong> This tool can be helpful, but it
          is not a substitute for your own knowledge and understanding.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
