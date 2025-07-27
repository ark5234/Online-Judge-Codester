import React, { useState } from "react";
import { motion } from "framer-motion";


export default function CodeRunner() {
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    int num1, num2, sum;
    cin >> num1 >> num2;
    sum = num1 + num2;
    cout << "The sum of the two numbers is: " << sum;
    return 0;
}`);
  const [input, setInput] = useState("11 29");
  const [output, setOutput] = useState("The sum of the two numbers is: 40");
  const [review, setReview] = useState(
    `Review: This is a very basic and functional program that calculates the sum of two integers inputted by the user. It's straightforward and easy to understand.

Potential Improvements and Suggestions:
Error Handling: The code lacks error handling. It assumes the user will input valid integers. Consider adding checks to ensure the input is indeed an integer and handling cases where the input is invalid (e.g., using cin.fail() and cin.clear()).`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Code Runner
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Write, run, and get AI-powered feedback on your code
            </p>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Code Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 flex flex-col h-[600px]"
          >
            <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-4">Code Editor</div>
            <textarea
              className="flex-1 w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck={false}
            />
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-6 sm:space-y-8">
            {/* Input */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">Input</div>
              <textarea
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={3}
                spellCheck={false}
              />
            </motion.div>

            {/* Output */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">Output</div>
              <pre className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[80px]">{output}</pre>
            </motion.div>

            {/* AI Review */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6"
            >
              <div className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">AI Review</div>
              <pre className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-[120px] overflow-y-auto">{review}</pre>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <button className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Run Code
              </button>
              <button className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                AI Review
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 