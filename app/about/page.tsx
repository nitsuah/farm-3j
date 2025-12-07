export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-green-900 mb-8">About Farm 3J</h1>
        
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Our Story</h2>
          <p className="text-green-800 mb-4">
            Farm 3J has been dedicated to sustainable farming practices and providing
            fresh, locally-grown produce to our community for years. We believe in
            working with nature, not against it.
          </p>
          <p className="text-green-800 mb-4">
            Our farm specializes in seasonal vegetables, fruits, and sustainable
            agricultural practices that prioritize soil health and environmental
            stewardship.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-green-900 mb-4">Our Values</h2>
          <ul className="space-y-3 text-green-800">
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span><strong>Sustainability:</strong> We practice crop rotation, composting, and natural pest management.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span><strong>Community:</strong> Supporting local families with fresh, healthy food options.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span><strong>Quality:</strong> Every harvest is carefully tended and picked at peak freshness.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">•</span>
              <span><strong>Education:</strong> Sharing our knowledge about sustainable agriculture with visitors.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
