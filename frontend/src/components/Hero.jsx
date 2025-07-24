import React from "react";

const gradientCombos = [
  "from-blue-500 via-indigo-500 to-purple-600",
  "from-orange-400 via-pink-500 to-red-500",
  "from-teal-400 via-green-400 to-emerald-500",
];

export default function Hero({ title, description, children }) {
  const randomGradient = gradientCombos[Math.floor(Math.random() * gradientCombos.length)];
  return (
    <div className={`min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br ${randomGradient} text-center px-4 py-12`}>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow">{title}</h1>
      <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-xl">{description}</p>
      <div className="flex gap-4 justify-center">{children}</div>
    </div>
  );
}
