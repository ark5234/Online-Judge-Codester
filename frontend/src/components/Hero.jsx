export default function Hero({ title, description, children }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 text-center px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700 dark:text-white drop-shadow">{title}</h1>
      <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-xl">{description}</p>
      <div className="flex gap-4 justify-center">{children}</div>
    </div>
  );
} 