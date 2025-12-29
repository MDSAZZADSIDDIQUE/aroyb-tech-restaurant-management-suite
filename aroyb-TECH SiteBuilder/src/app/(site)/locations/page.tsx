import Link from 'next/link';
import locationsData from '@/data/locations.json';
import { Location } from '@/types';

export default function LocationsPage() {
  const locations = locationsData.locations as Location[];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full 
                        text-sm font-medium mb-6">
            📍 Find Us
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Our Locations
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Visit us at our restaurants across Manchester and Birmingham
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/locations/${location.id}`}
              className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Map Placeholder */}
              <div className="h-48 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                <div className="text-center text-neutral-500">
                  <span className="text-4xl block mb-1">🗺️</span>
                  <p className="text-sm">{location.city}</p>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                  {location.shortName}
                </h2>
                <p className="text-neutral-600 mb-4">
                  {location.address}, {location.city} {location.postcode}
                </p>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="badge-success">
                    {location.acceptsDelivery && '🚚 Delivery'}
                  </span>
                  <span className="badge-primary">
                    {location.acceptsCollection && '🛍️ Collection'}
                  </span>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-4 text-sm text-neutral-600">
                  <span className="flex items-center gap-1">
                    <span>📞</span>
                    {location.phone}
                  </span>
                </div>

                {/* Delivery Zones */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <p className="text-sm text-neutral-500 mb-2">Delivery Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {location.deliveryZones.map((zone) => (
                      <span key={zone.id} className="badge-neutral text-xs">
                        {zone.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-primary-600 font-medium">
                  View Details →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
