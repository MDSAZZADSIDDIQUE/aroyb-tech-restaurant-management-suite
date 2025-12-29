import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aroyb DineScan - QR Table Ordering',
  description: 'Scan, order, and pay at your table. A seamless dining experience.',
  keywords: ['restaurant', 'QR ordering', 'table ordering', 'dine-in', 'pay at table'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50">
        {children}
      </body>
    </html>
  );
}
