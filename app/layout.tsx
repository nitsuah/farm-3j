import type React from 'react';
import Script from 'next/script';
import '@/app/globals.css';

export const metadata = {
  title: 'PG Farms - free browser farm strategy game',
  description:
    'A free browser real-time strategy game: gather, build and defend your farm against raiding waves.',
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
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-green-50 dark:bg-black">
        {children}
      </body>
    </html>
  );
}
