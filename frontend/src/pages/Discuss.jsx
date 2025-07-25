import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const samplePosts = [
  { title: "How to optimize Dijkstra's algorithm?", author: "Alice" },
  { title: "Best resources for learning DP", author: "Bob" },
  { title: "Share your contest experience!", author: "Charlie" },
];

export default function Discuss() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 pt-28">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 card-hover text-center min-h-[320px] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">Discussion Forum</h1>
        <ul className="space-y-4">
          {samplePosts.map((p, i) => (
            <li key={i} className="flex flex-col items-start bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">by {p.author}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 