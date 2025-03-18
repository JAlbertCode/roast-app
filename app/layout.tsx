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
  title: "Sir Croaksworth's Roast DApp",
  description: "Get your crypto wallet transactions roasted by Sir Croaksworth, the savage frog banker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          /* Hide Next.js debug button */
          #__next-build-watcher,
          .__next-build-watcher,
          #nextjs-portal {
            display: none !important;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
