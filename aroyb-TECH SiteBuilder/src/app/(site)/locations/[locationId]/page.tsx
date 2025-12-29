import Link from 'next/link';
import { notFound } from 'next/navigation';
import locationsData from '@/data/locations.json';
import { Location } from '@/types';

interface Props {
  params: { locationId: string };
}

export async function generateStaticParams() {
  const locations = locationsData.locations as Location[];
  return locations.map((loc) => ({ locationId: loc.id }));
}

export default function LocationDetailPage({ params }: Props) {
  const locations = locationsData.locations as Location[];
  const location = locations.find((l) => l.id === params.locationId);

  if (!location) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/locations" className="text-white/80 hover:text-white mb-4 inline-block">
            ← All Locations
          </Link>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {location.name}
          </h1>
          <p className="text-xl text-white/80">
            {location.address}, {location.city} {location.postcode}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    📞
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Phone</p>
                    <a href={`tel:${location.phone}`} className="text-neutral-900 font-medium hover:text-primary-600">
                      {location.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    ✉️
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Email</p>
                    <a href={`mailto:${location.email}`} className="text-neutral-900 font-medium hover:text-primary-600">
                      {location.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    📍
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Address</p>
                    <p className="text-neutral-900 font-medium">
                      {location.address}, {location.city} {location.postcode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Opening Hours</h2>
              <div className="space-y-3">
                {location.hours.map((h) => (
                  <div key={h.day} className="flex justify-between py-2 border-b border-neutral-100 last:border-0">
                    <span className="text-neutral-600">{h.day}</span>
                    <span className="font-medium text-neutral-900">
                      {h.closed ? 'Closed' : `${h.open} - ${h.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Zones */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Delivery Areas</h2>
              <div className="space-y-4">
                {location.deliveryZones.map((zone) => (
                  <div key={zone.id} className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-neutral-900">{zone.name}</h3>
                      <span className={`badge ${zone.fee === 0 ? 'badge-success' : 'badge-neutral'}`}>
                        {zone.fee === 0 ? 'Free delivery' : `£${zone.fee.toFixed(2)} delivery`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <span>Min order: £{zone.minOrder}</span>
                      <span>Est. time: {zone.estimatedTime}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-neutral-500">Postcodes: </span>
                      <span className="text-sm text-neutral-700">
                        {zone.postcodes.join(', ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                Minimum order: £{location.minOrder} | Prep time: {location.prepTimeRange[0]}-{location.prepTimeRange[1]} mins
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-neutral-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <span className="text-4xl block mb-2">🗺️</span>
                <p className="text-sm">Map</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/menu" className="btn-primary w-full">
                  Order Online
                </Link>
                <a href={`tel:${location.phone}`} className="btn-secondary w-full">
                  Call Restaurant
                </a>
                <Link href="/catering" className="btn-secondary w-full">
                  Catering Enquiry
                </Link>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-xl p-6 shadow-soft">
              <h3 className="font-semibold text-neutral-900 mb-4">Services</h3>
              <div className="space-y-2">
                {location.acceptsDelivery && (
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Delivery available</span>
                  </div>
                )}
                {location.acceptsCollection && (
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Collection available</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-green-700">
                  <span>✓</span>
                  <span>Dine-in available</span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <span>✓</span>
                  <span>Private dining room</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
