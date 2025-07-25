import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const sampleProblems = [
  { title: "Two Sum", difficulty: "Easy" },
  { title: "Reverse Linked List", difficulty: "Medium" },
  { title: "Word Ladder", difficulty: "Hard" },
];

export default function Problems() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const getDifficultyTag = (level) => {
    const base =
      "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold";
    if (level === "Easy")
      return `${base} bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400`;
    if (level === "Medium")
      return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400`;
    return `${base} bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 pt-28">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl text-center min-h-[320px] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">
          Problems
        </h1>
        <ul className="space-y-4">
          {sampleProblems.map((p, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {p.title}
              </span>
              <span className={getDifficultyTag(p.difficulty)}>
                {p.difficulty}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
