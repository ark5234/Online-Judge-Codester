import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Trophy, Star } from "lucide-react"; // using lucide icons

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
      <div className="w-full max-w-xl glass-card p-8 shadow-xl rounded-2xl animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white text-center mb-6 flex items-center justify-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-400" />
          Upcoming Contests
        </h1>

        {sampleContests.length > 0 ? (
          <ul className="space-y-4">
            {sampleContests.map((contest, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 bg-white/60 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm border border-white/20 dark:border-gray-700 transition hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <Star className="text-blue-600 dark:text-blue-300 w-5 h-5" />
                  <span className="font-medium text-gray-800 dark:text-white">{contest.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-blue-300">
                  <CalendarDays className="w-4 h-4" />
                  {contest.date}
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
