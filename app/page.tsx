export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-900 mb-4">
            Welcome to Farm 3J
          </h1>
          <p className="text-xl text-green-700 mb-8 max-w-2xl mx-auto">
            Fresh, locally-grown produce and sustainable farming practices.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/about" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Learn More
            </a>
            <a 
              href="#contact" 
              className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-green-900 mb-2">Fresh Produce</h3>
            <p className="text-green-700">
              Seasonal vegetables and fruits grown with care and sustainability.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-green-900 mb-2">Local Community</h3>
            <p className="text-green-700">
              Supporting our local community with quality, farm-fresh products.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-green-900 mb-2">Sustainable Farming</h3>
            <p className="text-green-700">
              Environmentally responsible practices for a healthier future.
            </p>
          </div>
        </section>

        <section id="contact" className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">Get in Touch</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-green-900 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-green-900 mb-1">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
