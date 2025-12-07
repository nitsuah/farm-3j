export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold text-black dark:text-white">
          About Farm 3J
        </h1>

        <section className="mb-8 rounded-lg bg-white p-8 shadow-md dark:bg-black dark:shadow-green-900/50">
          <h2 className="mb-4 text-2xl font-bold text-green-900 dark:text-white">
            Our Story
          </h2>
          <p className="mb-4 text-green-700 dark:text-green-300">
            Farm 3J has been dedicated to sustainable farming practices and
            providing fresh, locally-grown produce to our community for years.
            We believe in working with nature, not against it.
          </p>
          <p className="mb-4 text-green-700 dark:text-green-300">
            Our farm specializes in seasonal vegetables, fruits, and sustainable
            agricultural practices that prioritize soil health and environmental
            stewardship.
          </p>
        </section>

        <section className="rounded-lg bg-white p-8 shadow-md dark:bg-black dark:shadow-green-900/50">
          <h2 className="mb-4 text-2xl font-bold text-green-900 dark:text-white">
            Our Values
          </h2>
          <ul className="space-y-3 text-green-700 dark:text-green-300">
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>
                <strong>Sustainability:</strong> We practice crop rotation,
                composting, and natural pest management.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>
                <strong>Community:</strong> Supporting local families with
                fresh, healthy food options.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>
                <strong>Quality:</strong> Every harvest is carefully tended and
                picked at peak freshness.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>
                <strong>Education:</strong> Sharing our knowledge about
                sustainable agriculture with visitors.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
