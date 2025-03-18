import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dev-tools-hide.css";

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
          /* Hide Next.js debug button and other development tools */
          #__next-build-watcher,
          .__next-build-watcher,
          #nextjs-portal,
          #__next-portal-root,
          #__turbopack-root,
          #react-refresh-proxy-container,
          .Toastify,
          .__react-dev-overlay,
          .__web-inspector-hide-longpress-gesture,
          .__turbopack-error-overlay {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            z-index: -9999 !important;
            pointer-events: none !important;
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          // Immediately hide and remove development elements
          (function() {
            function removeDevTools() {
              const selectors = [
                '#__next-build-watcher',
                '.__next-build-watcher',
                '#nextjs-portal',
                '#__next-portal-root',
                '#__turbopack-root',
                '.Toastify',
                '.__react-dev-overlay',
                '[data-nextjs-portal]',
                '[data-nextjs-toast]'
              ];
              
              selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                  if (el && el.parentNode) {
                    el.parentNode.removeChild(el);
                  }
                });
              });
            }
            
            // Run immediately
            removeDevTools();
            
            // Set up observers to catch elements that might be added later
            const observer = new MutationObserver(function(mutations) {
              removeDevTools();
            });
            
            observer.observe(document.documentElement, {
              childList: true,
              subtree: true
            });
            
            // Also set interval as a fallback
            setInterval(removeDevTools, 200);
          })();
        ` }} />
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
