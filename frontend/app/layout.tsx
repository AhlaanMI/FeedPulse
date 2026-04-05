import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedPulse - AI-Powered Feedback Platform",
  description: "Collect, analyze, and prioritize product feedback with AI. Share your insights and help us build better products.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "FeedPulse",
    description: "AI-Powered Product Feedback Platform",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FeedPulse",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1e293b" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>{children}</body>
    </html>
  );
}
