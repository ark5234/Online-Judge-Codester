import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const sampleRanks = [
  { rank: 1, name: "Alice", score: 980 },
  { rank: 2, name: "Bob", score: 920 },
  { rank: 3, name: "Charlie", score: 900 },
];

export default function Ranks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 pt-28">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 text-center min-h-[320px] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">Leaderboard</h1>
        <ol className="space-y-3">
          {sampleRanks.map((r) => (
            <li key={r.rank} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow">
              <span className="font-bold text-lg">#{r.rank}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{r.name}</span>
              <span className="text-blue-700 dark:text-blue-300 font-semibold">{r.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
} 