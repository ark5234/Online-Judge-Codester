import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAward, FiTrendingUp, FiUser, FiLogIn } from "react-icons/fi";
import adminService from "../services/adminService";

export default function Ranks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminService.getUsers();
        // Sort users by score/points if available
        const sorted = (data.users || []).sort((a, b) => (b.score || b.points || 0) - (a.score || a.points || 0));
        setUsers(sorted);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleInteraction = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiAward className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <FiAward className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <FiAward className="w-5 h-5 text-orange-600" />;
    return null;
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">Leaderboard</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problems Solved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {users.map((u, idx) => (
                <tr key={u._id || u.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap font-bold">{getRankIcon(idx + 1) || idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.name || u.username || u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.score || u.points || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.problemsSolved || u.solved || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 