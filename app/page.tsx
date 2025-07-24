"use client"

import EnhancedFarmMap from "@/components/enhanced-farm-map"
import SunNav from "@/components/sun-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const [activeSection, setActiveSection] = useState("explore")

  const renderContent = () => {
    switch (activeSection) {
      case "explore":
        return (
          <section className="-mt-16 relative z-20">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <h2 className="text-3xl font-bold text-green-900 mb-4">Explore Our Farm</h2>
              <p className="text-green-800 mb-6 max-w-3xl">
                Welcome to our interactive farm experience! Discover our 200-acre sustainable operation with real-time
                data, current crop information, and detailed insights into our farming practices.
              </p>
              <EnhancedFarmMap />
            </div>
          </section>
        )
      case "about":
        return (
          <section className="-mt-16 relative z-20">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h2 className="text-3xl font-bold text-green-900 mb-4">Our Farm</h2>
                  <p className="text-green-800 mb-4">
                    Located in the beautiful countryside of Greenfield County, PRETTY GOOD FARMS spans over 200 acres of
                    fertile land. We specialize in organic vegetables, free-range poultry, and sustainable farming
                    practices.
                  </p>
                  <p className="text-green-800 mb-6">
                    Our mission is to provide the community with fresh, nutritious food while preserving the environment
                    for future generations.
                  </p>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href="/about">Learn More</Link>
                    </Button>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <img
                    src="/placeholder.svg?height=400&width=600"
                    alt="Farmers at work"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            </div>
          </section>
        )
      case "contact":
        return (
          <section className="-mt-16 relative z-20">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
              <h2 className="text-3xl font-bold text-green-900 mb-6">Contact Us</h2>
              <div className="max-w-2xl mx-auto">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full mt-1">
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
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Address</h3>
                      <p className="text-green-800">123 Farm Road, Greenfield County, GF 12345</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full mt-1">
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Phone</h3>
                      <p className="text-green-800">(555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full mt-1">
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
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Email</h3>
                      <p className="text-green-800">info@prettygoodfarms.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-3 rounded-full mt-1">
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
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">Farm Hours</h3>
                      <p className="text-green-800">
                        Monday - Saturday: 8am - 6pm
                        <br />
                        Sunday: 10am - 4pm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5e6]">
      {/* Header with pasture background */}
      <header className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f8f5e6]/60 z-10" />
        <img
          src="/placeholder.svg?height=800&width=1600"
          alt="PRETTY GOOD FARMS rolling green pasture with scattered oak trees and red barn"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Top navigation bar */}
        <div className="relative z-30 container mx-auto px-4 py-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-2">PRETTY GOOD FARMS</h1>
            <p className="text-lg md:text-xl text-green-800 max-w-lg">
              Sustainable farming practices with a focus on community and quality produce since 1985.
            </p>
          </div>

          <SunNav activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">{renderContent()}</main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-6 mt-8">
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
          <div className="mt-4 text-center text-green-200">
            <p>&copy; {new Date().getFullYear()} PRETTY GOOD FARMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
