import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-store';
import { LocationProvider } from '@/lib/location-store';

export const metadata: Metadata = {
  title: 'Aroyb Grill & Curry | Authentic Indian Restaurant | Order Online',
  description: 'Experience the finest Indian cuisine at Aroyb Grill & Curry. Authentic curries, tandoori grills, and biryanis. Order online for delivery or collection across Manchester and Birmingham.',
  keywords: ['Indian restaurant', 'curry', 'tandoori', 'biryani', 'halal', 'delivery', 'Manchester', 'Birmingham'],
  authors: [{ name: 'Aroyb Grill & Curry' }],
  openGraph: {
    title: 'Aroyb Grill & Curry | Authentic Indian Restaurant',
    description: 'Experience the finest Indian cuisine. Order online for delivery or collection.',
    type: 'website',
    locale: 'en_GB',
    siteName: 'Aroyb Grill & Curry',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aroyb Grill & Curry',
    description: 'Authentic Indian restaurant. Order online for delivery.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <LocationProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </LocationProvider>
      </body>
    </html>
  );
}
