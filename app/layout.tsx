import type React from 'react';
import Script from 'next/script';
import '@/app/globals.css';

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
