export default function Hero({ title, description, children }) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-700 dark:text-white drop-shadow-sm">
        {title}
      </h1>
      <p className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">{children}</div>
    </section>
  );
}
