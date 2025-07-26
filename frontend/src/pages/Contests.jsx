import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const sampleContests = [
  { name: "Spring Challenge 2024", date: "2024-05-10" },
  { name: "Weekly Coding Contest #12", date: "2024-05-17" },
  { name: "Beginner's Cup", date: "2024-05-24" },
];

export default function Contests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 pt-28 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white text-center mb-6 flex items-center justify-center gap-2">
          Upcoming Contests
        </h1>
        {sampleContests.length > 0 ? (
          <ul className="space-y-4">
            {sampleContests.map((contest, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow backdrop-blur-sm transition hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800 dark:text-white">{contest.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-blue-300">
                  <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-blue-300">
                    {contest.date}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300 mt-10">
            No upcoming contests. Stay tuned!
          </div>
        )}
      </div>
    </div>
  );
}
