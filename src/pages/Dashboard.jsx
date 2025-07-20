import React from 'react';

export default function Dashboard() {
  // Dummy data
  const user = { username: 'johndoe', email: 'john@example.com', role: 'user' };
  const submissions = [
    { id: 1, problem: 'Two Sum', verdict: 'AC', time: '2024-07-20' },
    { id: 2, problem: 'Reverse Linked List', verdict: 'WA', time: '2024-07-19' },
  ];
  const verdictColor = v =>
    v === 'AC' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
    v === 'WA' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Dashboard</h2>
        <div className="mb-4">
          <div><span className="font-semibold">Username:</span> {user.username}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Role:</span> {user.role}</div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Submissions</h3>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left p-2">Problem</th>
              <th className="text-left p-2">Verdict</th>
              <th className="text-left p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.problem}</td>
                <td className={`p-2 font-bold ${verdictColor(s.verdict)}`}>{s.verdict}</td>
                <td className="p-2">{s.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 