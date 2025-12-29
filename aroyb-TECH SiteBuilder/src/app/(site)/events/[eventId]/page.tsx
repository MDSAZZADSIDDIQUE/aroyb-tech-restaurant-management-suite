import Link from 'next/link';
import { notFound } from 'next/navigation';
import eventsData from '@/data/events.json';
import { Event } from '@/types';

interface Props {
  params: { eventId: string };
}

export async function generateStaticParams() {
  const events = eventsData.events as Event[];
  return events.map((event) => ({ eventId: event.id }));
}

export default function EventDetailPage({ params }: Props) {
  const events = eventsData.events as Event[];
  const event = events.find((e) => e.id === params.eventId);

  if (!event) {
    notFound();
  }

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/events" className="text-primary-600 hover:text-primary-700">
            ← Back to Events
          </Link>
        </nav>

        {/* Event Card */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-4">
              {event.tags.map((tag) => (
                <span key={tag} className="badge bg-white/20 text-white capitalize">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-white/80">
              {event.description}
            </p>
          </div>

          {/* Details */}
          <div className="p-8 md:p-12">
            {/* Key Info Grid */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                  📅
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Date</p>
                  <p className="text-neutral-600">{formatDate(event.date)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                  ⏰
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Time</p>
                  <p className="text-neutral-600">{event.time} - {event.endTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                  📍
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Location</p>
                  <p className="text-neutral-600">{event.location}</p>
                </div>
              </div>
              {event.price !== undefined && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                    💷
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Price</p>
                    <p className="text-neutral-600">
                      {event.price === 0 ? 'Free' : `£${event.price} per person`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.longDescription && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">About This Event</h2>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
                  {event.longDescription}
                </p>
              </div>
            )}

            {/* Capacity */}
            {event.capacity && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                <p className="text-amber-800">
                  <span className="font-semibold">Limited spaces:</span> Only {event.capacity} places available
                </p>
              </div>
            )}

            {/* Booking CTA */}
            {event.bookingRequired ? (
              <div className="bg-neutral-50 rounded-xl p-6 text-center">
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Ready to Join?
                </h3>
                <p className="text-neutral-600 mb-4">
                  This event requires advance booking
                </p>
                <Link href="/contact" className="btn-primary">
                  Book Your Place
                </Link>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <p className="text-green-800 font-medium">
                  ✓ No booking required - just turn up on the day!
                </p>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
