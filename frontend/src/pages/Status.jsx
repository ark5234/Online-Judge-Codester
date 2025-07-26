import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const sampleStatus = [
  { id: 1, problem: "Two Sum", verdict: "Accepted", time: "0.12s" },
  { id: 2, problem: "Reverse Linked List", verdict: "Wrong Answer", time: "0.09s" },
  { id: 3, problem: "Word Ladder", verdict: "Time Limit Exceeded", time: "2.01s" },
];

export default function Status() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 pt-28">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 text-center min-h-[320px] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">Submission Status</h1>
        <table className="w-full text-left mt-4">
          <thead>
            <tr className="text-gray-700 dark:text-gray-200">
              <th className="pb-2">#</th>
              <th className="pb-2">Problem</th>
              <th className="pb-2">Verdict</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {sampleStatus.map((s) => (
              <tr key={s.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2">{s.id}</td>
                <td>{s.problem}</td>
                <td className={`font-semibold ${s.verdict === 'Accepted' ? 'text-green-600' : s.verdict === 'Wrong Answer' ? 'text-red-600' : 'text-yellow-600'}`}>{s.verdict}</td>
                <td>{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 