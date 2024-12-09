import React from "react";

const About: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-12 p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-4xl font-bold text-center text-black mb-6">
        About Us
      </h1>
      <p className="text-gray-700 mb-4">
        Welcome to <strong>Food Tracker</strong>, your dedicated companion for
        tracking meals, monitoring nutrition, and achieving your health goals.
        Our mission is to empower you to make informed decisions about your diet
        and wellness journey.
      </p>
      <p className="text-gray-700 mb-4">
        At Food Tracker, we believe that understanding your food intake is
        essential to maintaining a healthy lifestyle. That's why we've created
        an intuitive platform where you can easily log your meals, track
        nutritional information, and visualize your progress over time.
      </p>
      <p className="text-gray-700 mb-4">
        Our team is passionate about combining technology with health to bring
        you a seamless experience. With our interactive dashboard, meal plans,
        and personalized insights, we are here to support you every step of the
        way.
      </p>
      <p className="text-gray-700 mb-4">
        Whether you're looking to improve your eating habits, manage a specific
        dietary plan, or simply gain a deeper understanding of your daily
        intake, Food Tracker is here for you.
      </p>
      <p className="text-gray-700">
        Thank you for choosing Food Tracker as your nutrition partner. We're
        excited to be part of your health journey!
      </p>
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          For any questions or feedback, feel free to contact us at{" "}
          <a
            href="mailto:support@foodtrackerapp.com"
            className="text-blue-500 underline"
          >
            support@foodtrackerapp.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default About;
