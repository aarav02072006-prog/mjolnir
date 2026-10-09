import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meesho — Fashion & Lifestyle",
  description: "Shop trendy products at the best prices with free delivery",
};

import { Suspense } from 'react';
import { Navbar } from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('theme')
                let theme = 'light'
                if (storedTheme) {
                  try {
                    const persisted = JSON.parse(storedTheme)
                    theme = persisted?.state?.theme || storedTheme
                  } catch {
                    theme = storedTheme
                  }
                }
                document.documentElement.classList.toggle('dark', theme === 'dark')
              } catch (_) {}
            `,
          }}
        />
        <Suspense fallback={<div className="h-20 bg-background border-b border-border" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
