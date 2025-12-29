import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location } from '@/types';

export default function HomePage() {
  const locations = locationsData.locations as Location[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Demo Banner */}
      <div className="demo-banner">
        🍽️ Demo Mode — This is a preview of Aroyb DineScan
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center text-white mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full mb-6">
            <span className="text-2xl">📱</span>
            <span className="font-medium">Scan • Order • Enjoy</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
            Order from Your Table
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/80 max-w-2xl mx-auto mb-8">
            No queues, no waiting. Scan the QR code at your table and order directly from your phone.
          </p>
        </div>

        {/* Demo Options */}
        <div className="bg-white rounded-3xl shadow-elevated p-6 sm:p-10 mb-8">
          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6 text-center">
            Try the Demo
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            {/* Customer Demo */}
            <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-neutral-200">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">Customer View</h3>
              <p className="text-neutral-600 mb-4">
                Experience the ordering flow as a guest at Table 1
              </p>
              <Link 
                href={`/t/${locations[0].id}/t1`}
                className="btn-primary w-full"
              >
                Try as Customer
              </Link>
            </div>

            {/* Admin Demo */}
            <div className="bg-neutral-50 rounded-2xl p-6 border-2 border-neutral-200">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">Admin View</h3>
              <p className="text-neutral-600 mb-4">
                See live sessions, orders, and kitchen controls
              </p>
              <Link href="/admin" className="btn-secondary w-full">
                Open Admin Panel
              </Link>
            </div>
          </div>

          {/* QR Generator */}
          <div className="text-center pt-6 border-t border-neutral-200">
            <p className="text-neutral-500 mb-3">Or generate QR codes for any table</p>
            <Link href="/qr" className="btn-ghost">
              📄 QR Code Generator →
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-6 text-white">
          <div className="text-center p-6">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-semibold mb-2">Multi-Guest Ordering</h3>
            <p className="text-white/70 text-sm">
              Each guest has their own cart. See everyone's orders at checkout.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-semibold mb-2">Course Pacing</h3>
            <p className="text-white/70 text-sm">
              Send starters now, mains later. Perfect timing for every course.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-3">💳</div>
            <h3 className="font-semibold mb-2">Pay at Table</h3>
            <p className="text-white/70 text-sm">
              Split the bill, add tips, and pay without waiting for staff.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
