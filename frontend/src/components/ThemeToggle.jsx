import React from "react";

export default function ThemeToggle({ className = "" }) {
  // You may use your existing theme logic here
  const [theme, setTheme] = React.useState(
    localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title="Toggle Theme"
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white cursor-pointer hover:scale-110 transition text-2xl focus:outline-none ${className}`}
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
}