'use client';

import { useState } from 'react';
import { ContactModal } from '@/components/ContactModal';

export default function AboutPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-black dark:text-white">
            About Pretty Good Farm
          </h1>
          <button
            onClick={() => setIsContactOpen(true)}
            className="rounded-lg bg-green-600 px-6 py-3 text-white transition-all hover:bg-green-700 hover:shadow-lg"
          >
            📧 Contact Us
          </button>
        </div>

        <section className="mb-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-900 dark:shadow-green-900/50">
          <h2 className="mb-4 text-2xl font-bold text-green-900 dark:text-white">
            Our Story
          </h2>
          <p className="mb-4 text-green-700 dark:text-green-300">
            Pretty Good Farm (formerly Farm 3J) has been dedicated to
            sustainable farming practices and providing fresh, locally-grown
            produce to our community for years.
          </p>
          <p className="mb-4 text-green-700 dark:text-green-300">
            We believe in working with nature, not against it. Our farm
            specializes in seasonal vegetables, fruits, and sustainable
            agricultural practices that prioritize soil health and environmental
            stewardship.
          </p>
        </section>

        <section className="rounded-lg bg-white p-8 shadow-md dark:bg-gray-900 dark:shadow-green-900/50">
          <h2 className="mb-4 text-2xl font-bold text-green-900 dark:text-white">
            Our Values
          </h2>
          <ul className="space-y-3 text-green-700 dark:text-green-300">
            <li className="flex items-start">
              <span className="mr-2 font-bold">🌱</span>
              <span>
                <strong>Sustainability:</strong> We practice crop rotation,
                composting, and natural pest management.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">🤝</span>
              <span>
                <strong>Community:</strong> Supporting local families with
                fresh, healthy food options.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">⭐</span>
              <span>
                <strong>Quality:</strong> Every harvest is carefully tended and
                picked at peak freshness.
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">📚</span>
              <span>
                <strong>Education:</strong> Sharing our knowledge about
                sustainable agriculture with visitors.
              </span>
            </li>
          </ul>
        </section>
      </div>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
    </main>
  );
}
