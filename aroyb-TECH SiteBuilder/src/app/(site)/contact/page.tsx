'use client';

import { useState } from 'react';
import locationsData from '@/data/locations.json';
import { Location } from '@/types';

export default function ContactPage() {
  const locations = locationsData.locations as Location[];
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Questions, feedback, or reservations? We&apos;d love to hear from you
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
              Send Us a Message
            </h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 
                             flex items-center justify-center text-3xl">
                  ✓
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Message Sent!
                </h3>
                <p className="text-green-700">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <p className="text-sm text-green-600 mt-4">
                  (Demo mode: no actual email was sent)
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select a topic...</option>
                    <option value="reservation">Reservation</option>
                    <option value="feedback">Feedback</option>
                    <option value="catering">Catering Enquiry</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="input-field resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
              Our Locations
            </h2>

            <div className="space-y-6">
              {locations.map((location) => (
                <div key={location.id} className="bg-white rounded-xl p-6 shadow-soft">
                  <h3 className="font-semibold text-lg text-neutral-900 mb-3">
                    {location.shortName}
                  </h3>
                  
                  <div className="space-y-3 text-neutral-600">
                    <div className="flex items-start gap-3">
                      <span className="text-primary-500">📍</span>
                      <div>
                        <p>{location.address}</p>
                        <p>{location.city} {location.postcode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-primary-500">📞</span>
                      <a href={`tel:${location.phone}`} className="hover:text-primary-600">
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-primary-500">✉️</span>
                      <a href={`mailto:${location.email}`} className="hover:text-primary-600">
                        {location.email}
                      </a>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <h4 className="font-medium text-neutral-900 mb-2">Opening Hours</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {location.hours.slice(0, 4).map((h) => (
                        <div key={h.day} className="flex justify-between">
                          <span className="text-neutral-500">{h.day}</span>
                          <span className="text-neutral-700">{h.open}-{h.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 bg-neutral-200 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <span className="text-4xl block mb-2">🗺️</span>
                <p>Map would be displayed here</p>
                <p className="text-sm">(Google Maps integration)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact */}
        <div className="mt-16 bg-primary-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Need a Quick Answer?
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Call us directly or use our chatbot for instant answers
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+441615550123" className="btn-secondary bg-white text-primary-700 hover:bg-neutral-100">
              📞 Call Manchester
            </a>
            <a href="tel:+441215550456" className="btn-secondary bg-white text-primary-700 hover:bg-neutral-100">
              📞 Call Birmingham
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
