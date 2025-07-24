import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f5e6]">
      <header className="bg-green-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">PRETTY GOOD FARMS</h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:text-green-300 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-green-300 transition-colors font-bold">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/#contact" className="hover:text-green-300 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Our Story</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <p className="text-green-800 mb-4">
                PRETTY GOOD FARMS was established in 1985 by the Johnson family with a vision to create a sustainable
                farm that would provide fresh, organic produce to the local community while preserving the natural
                environment.
              </p>
              <p className="text-green-800 mb-4">
                What started as a small 50-acre farm has now grown to over 200 acres of fertile land where we grow a
                variety of organic vegetables, fruits, and raise free-range poultry. Our farming practices are guided by
                our commitment to sustainability, biodiversity, and soil health.
              </p>
              <p className="text-green-800">
                Today, the farm is run by the second generation of the Johnson family, who continue to uphold the values
                and principles established by their parents while embracing modern sustainable farming techniques.
              </p>
            </div>
            <div className="md:w-1/2">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="The Johnson Family"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Our Mission</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-xl text-green-800 italic text-center">
              "To grow nutritious food using sustainable practices that nurture the soil, protect the environment, and
              strengthen our community."
            </p>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-green-900 mb-6">Sustainable Practices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="M16 6a4 4 0 0 0-8 0"></path>
                  <path d="M16 18a4 4 0 0 0-8 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Organic Farming</h3>
              <p className="text-green-800">
                We use natural fertilizers and pest management techniques to grow our crops without synthetic chemicals
                or pesticides.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Water Conservation</h3>
              <p className="text-green-800">
                Our drip irrigation systems and rainwater collection methods help us minimize water usage while keeping
                our crops hydrated.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m2 12 20 0"></path>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Biodiversity</h3>
              <p className="text-green-800">
                We maintain hedgerows, wildflower meadows, and natural habitats to support beneficial insects, birds,
                and wildlife.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Waste Reduction</h3>
              <p className="text-green-800">
                We compost organic waste to create nutrient-rich soil amendments and use recyclable or biodegradable
                packaging for our products.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M12 3v19"></path>
                  <path d="M5 8c1.5 2.5 5 3 7 3s5.5-.5 7-3"></path>
                  <path d="M5 19c1.5-2.5 5-3 7-3s5.5.5 7 3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Crop Rotation</h3>
              <p className="text-green-800">
                We rotate crops to maintain soil fertility, reduce pest pressure, and prevent soil erosion and nutrient
                depletion.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-700"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Community Support</h3>
              <p className="text-green-800">
                We offer educational programs, farm tours, and volunteer opportunities to engage the community in
                sustainable agriculture.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-900 mb-6">Visit Our Farm</h2>
            <p className="text-green-800 mb-6 max-w-2xl mx-auto">
              We welcome visitors to our farm to learn about sustainable farming practices, purchase fresh produce, and
              enjoy the beautiful countryside.
            </p>
            <Button asChild size="lg">
              <Link href="/#contact">Contact Us to Schedule a Visit</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-green-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">PRETTY GOOD FARMS</h3>
              <p className="text-green-200">Sustainable farming since 1985</p>
            </div>
            <div>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-300 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-green-200">
            <p>&copy; {new Date().getFullYear()} PRETTY GOOD FARMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
