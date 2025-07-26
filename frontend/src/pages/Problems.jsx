import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const sampleProblems = [
  { 
    id: 1, 
    title: "Two Sum", 
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      }
    ]
  },
  { 
    id: 2, 
    title: "Reverse Linked List", 
    difficulty: "Medium",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: [
      "The number of nodes in the list is the range [0, 5000]",
      "-5000 <= Node.val <= 5000"
    ],
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "The original list is reversed to become [5,4,3,2,1]."
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "The original list is reversed to become [2,1]."
      }
    ]
  },
  { 
    id: 3, 
    title: "Word Ladder", 
    difficulty: "Hard",
    description: "A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that: Every adjacent pair of words differs by a single letter, and every si for 1 <= i <= k is in wordList. Given two words, beginWord and endWord, and a dictionary wordList, return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no such sequence exists.",
    constraints: [
      "1 <= beginWord.length <= 10",
      "endWord.length == beginWord.length",
      "1 <= wordList.length <= 5000",
      "wordList[i].length == beginWord.length",
      "beginWord, endWord, and wordList[i] consist of lowercase English letters",
      "beginWord != endWord",
      "All the words in wordList are unique"
    ],
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: "5",
        explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
      },
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]',
        output: "0",
        explanation: "The endWord 'cog' is not in wordList, therefore there is no valid transformation sequence."
      }
    ]
  },
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
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 text-center min-h-[320px] flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-blue-700 dark:text-white mb-4">
          Problems
        </h1>
        <ul className="space-y-4">
          {sampleProblems.map((p, i) => (
            <li
              key={i}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
            >
              <Link
                to={`/problems/${p.id}`}
                className="font-medium text-gray-900 dark:text-gray-100 hover:underline transition flex-1"
                style={{ textDecoration: 'none' }}
              >
                {p.title}
              </Link>
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
