import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="w-full bg-blue-600 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Become a true programming master</h1>
          <p className="text-lg md:text-2xl mb-6 font-medium">Learn how to code and build efficient algorithms</p>
          <div className="mb-6 text-base md:text-lg font-semibold">
            <span className="mr-2">3,486,565 submissions,</span>
            <span className="mr-2">1,252,084 registered users,</span>
            <span>7,009 public problems</span>
          </div>
          <Link to="/register" className="btn-primary bg-white text-blue-700 hover:bg-blue-100 text-lg font-bold px-8 py-3 rounded-lg shadow transition">Sign up & Start coding!</Link>
        </div>
      </section>

      {/* Promo/Feature Section */}
      <section className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl mt-10 p-8 flex flex-col items-center">
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Brain_wars_logo.png" alt="Brain Wars" className="w-2/3 max-w-xs mb-6" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Brain Wars</h2>
        <div className="flex gap-6 mb-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/ADB_logo.png" alt="adb" className="h-8" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/WIEA_logo.png" alt="wiea" className="h-8" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-base text-center max-w-xl">
          Are you passionate about coding? Try your luck in a brain challenge and join ADB Brain Wars contest!
        </p>
      </section>
    </div>
  );
}
