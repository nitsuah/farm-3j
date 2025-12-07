export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <section className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-green-900 dark:text-white">
            Welcome to Farm 3J
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-green-700 dark:text-green-300">
            Fresh, locally-grown produce and sustainable farming practices.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/farm"
              className="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              🌾 Interactive Farm Demo
            </a>
            <a
              href="/about"
              className="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              Learn More
            </a>
            <a
              href="#contact"
              className="rounded-lg border-2 border-green-600 px-6 py-3 text-green-600 transition-colors hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900"
            >
              Contact Us
            </a>
          </div>
        </section>

        <section className="mb-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-black dark:shadow-green-900/50">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Fresh Produce
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Seasonal vegetables and fruits grown with care and sustainability.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-black dark:shadow-green-900/50">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Local Community
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Supporting our local community with quality, farm-fresh products.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-black dark:shadow-green-900/50">
            <h3 className="mb-2 text-xl font-bold text-green-900 dark:text-white">
              Sustainable Farming
            </h3>
            <p className="text-green-700 dark:text-green-300">
              Environmentally responsible practices for a healthier future.
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-2xl rounded-lg bg-white p-8 shadow-md dark:bg-black dark:shadow-green-900/50"
        >
          <h2 className="mb-6 text-center text-3xl font-bold text-green-900 dark:text-white">
            Get in Touch
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-900 dark:text-white"
                placeholder="Your name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-900 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-medium text-green-900 dark:text-green-300"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full rounded-lg border border-green-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-green-700 dark:bg-gray-900 dark:text-white"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
