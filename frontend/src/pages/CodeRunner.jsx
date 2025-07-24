import React, { useState } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Code Editor */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 card-hover flex flex-col h-[500px]">
          <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Code Editor</div>
          <textarea
            className="flex-1 w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-6">
          {/* Input */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 card-hover">
            <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Input</div>
            <textarea
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-2 font-mono text-sm text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={2}
              spellCheck={false}
            />
          </div>
          {/* Output */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 card-hover">
            <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Output</div>
            <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 font-mono text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{output}</pre>
          </div>
          {/* AI Review */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 card-hover">
            <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">AI Review</div>
            <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 font-mono text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{review}</pre>
          </div>
          {/* Buttons */}
          <div className="flex gap-4 mt-2">
            <button className="btn-primary flex-1 bg-blue-600 text-white hover:bg-blue-700">Run</button>
            <button className="btn-primary flex-1 bg-green-600 text-white hover:bg-green-700">AI Review</button>
          </div>
        </div>
      </div>
    </div>
  );
} 