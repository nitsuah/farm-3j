import type React from 'react';
import '@/app/globals.css';

export const metadata = {
  title: 'Farm 3J - Fresh Local Produce',
  description:
    'Sustainable farming with a focus on community and quality produce.',
  generator: 'Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-green-50">
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-green-900">Farm 3J</h1>
              <div className="flex gap-6">
                <a href="/" className="text-green-700 hover:text-green-900">
                  Home
                </a>
                <a
                  href="/about"
                  className="text-green-700 hover:text-green-900"
                >
                  About
                </a>
              </div>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mt-16 bg-green-900 py-8 text-white">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 Farm 3J. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
