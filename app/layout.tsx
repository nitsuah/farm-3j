import type React from 'react';
import '@/app/globals.css';
import { ThemeToggle } from '@/components/theme-toggle';
import { HeaderCropRow } from '@/components/animations/HeaderCropRow';

export const metadata = {
  title: 'Pretty Good Farms - Fresh Local Produce',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-green-50 dark:bg-black">
        {children}
      </body>
    </html>
  );
}
