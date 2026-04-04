import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FeedPulse - AI-Powered Feedback Platform',
  description: 'Collect, analyze, and prioritize product feedback with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
