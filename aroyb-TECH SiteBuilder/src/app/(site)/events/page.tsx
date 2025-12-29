import Link from 'next/link';
import Image from 'next/image';
import eventsData from '@/data/events.json';
import { Event } from '@/types';

export default function EventsPage() {
  const events = eventsData.events as Event[];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full 
                        text-sm font-medium mb-6">
            🎉 What&apos;s On
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join us for special nights, tastings, live music, and celebrations
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Events List */}
        <div className="space-y-8">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="block card hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                {/* Date Badge */}
                <div className="md:w-48 flex-shrink-0 bg-primary-600 text-white p-6 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">
                    {new Date(event.date).getDate()}
                  </span>
                  <span className="text-lg uppercase">
                    {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                  </span>
                  <span className="text-sm opacity-80">
                    {new Date(event.date).getFullYear()}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {event.tags.map((tag) => (
                      <span key={tag} className="badge-primary capitalize">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                    {event.title}
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1">
                      <span>⏰</span>
                      {event.time} - {event.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      {event.location}
                    </span>
                    {event.price && (
                      <span className="flex items-center gap-1">
                        <span>💷</span>
                        £{event.price} per person
                      </span>
                    )}
                    {event.capacity && (
                      <span className="flex items-center gap-1">
                        <span>👥</span>
                        {event.capacity} spaces
                      </span>
                    )}
                  </div>
                  {event.bookingRequired && (
                    <span className="inline-block mt-4 text-primary-600 font-medium">
                      Booking required →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Events Fallback */}
        {events.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              No upcoming events
            </h3>
            <p className="text-neutral-600">
              Check back soon for new events!
            </p>
          </div>
        )}

        {/* Host Your Event CTA */}
        <div className="mt-16 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Want to Host Your Own Event?
          </h2>
          <p className="text-neutral-300 text-lg mb-8 max-w-2xl mx-auto">
            Our private dining room is perfect for birthdays, anniversaries, corporate events, 
            and special celebrations. Contact us to discuss your requirements.
          </p>
          <Link href="/catering" className="btn-primary">
            Enquire About Private Events
          </Link>
        </div>
      </div>
    </div>
  );
}
