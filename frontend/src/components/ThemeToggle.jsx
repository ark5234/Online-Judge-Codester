import { useTheme } from "../context/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:scale-105 transition"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌞" : "🌙"}
    </button>
  );
} 