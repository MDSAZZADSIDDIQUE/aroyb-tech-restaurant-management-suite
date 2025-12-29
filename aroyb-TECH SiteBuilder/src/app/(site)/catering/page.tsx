'use client';

import { useState } from 'react';
import Image from 'next/image';
import menuData from '@/data/menu.json';
import { MenuItem } from '@/types';

export default function CateringPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventType: '',
    guestCount: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  // Get items suitable for catering
  const cateringItems = (menuData.items as MenuItem[]).filter(
    item => ['curries', 'grills', 'biryanis', 'starters'].includes(item.categoryId) && item.available
  ).slice(0, 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: just show success
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1555244162-803834f70033?w=1920"
            alt="Catering setup"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-neutral-900/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full 
                        text-sm font-medium mb-6">
            🍽️ Events & Catering
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Make Your Event Unforgettable
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            From intimate gatherings to grand celebrations, we bring authentic 
            Indian flavours to your special occasions
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <h2 className="text-3xl font-display font-bold text-neutral-900 mb-6">
              Our Catering Services
            </h2>
            <p className="text-neutral-600 text-lg mb-8">
              Whether you&apos;re planning a wedding, corporate event, birthday party, or family 
              gathering, our catering team will create a memorable dining experience for you 
              and your guests.
            </p>

            {/* Service Types */}
            <div className="space-y-6 mb-10">
              {[
                {
                  icon: '💒',
                  title: 'Weddings & Receptions',
                  desc: 'Customised menus for your big day. From traditional to contemporary.',
                },
                {
                  icon: '🏢',
                  title: 'Corporate Events',
                  desc: 'Impress clients and colleagues with our professional catering.',
                },
                {
                  icon: '🎉',
                  title: 'Private Parties',
                  desc: 'Birthdays, anniversaries, and celebrations of all sizes.',
                },
                {
                  icon: '🍲',
                  title: 'Buffet Service',
                  desc: 'Self-service buffets with all your favourite dishes.',
                },
              ].map((service, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{service.title}</h3>
                    <p className="text-neutral-600 text-sm">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Choose Us */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Why Choose Our Catering?</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  100% Halal certified meat
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Vegetarian & vegan options available
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Professional setup and service staff
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Serving Manchester & Birmingham areas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Customisable menus to suit your needs
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold text-neutral-900 mb-6">
                Get a Quote
              </h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 
                               flex items-center justify-center text-4xl">
                    ✓
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    Thanks for your enquiry!
                  </h3>
                  <p className="text-neutral-600">
                    We&apos;ll get back to you within 24 hours with a customised quote.
                  </p>
                  <p className="text-sm text-neutral-500 mt-4">
                    (Demo mode: no actual email was sent)
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
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
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-field"
                      />
                    </div>
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
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Number of Guests *
                      </label>
                      <select
                        required
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select...</option>
                        <option value="10-25">10-25 guests</option>
                        <option value="25-50">25-50 guests</option>
                        <option value="50-100">50-100 guests</option>
                        <option value="100-200">100-200 guests</option>
                        <option value="200+">200+ guests</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select...</option>
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="religious">Religious Celebration</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Tell us about your event
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Dietary requirements, preferred dishes, budget, etc."
                      className="input-field resize-none"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    Submit Enquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sample Catering Menu */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="section-heading">Sample Catering Menu</h2>
            <p className="section-subheading mx-auto mt-4">
              Popular dishes for events - all menus are fully customisable
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cateringItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-soft">
                <div className="relative h-32">
                  <Image
                    src={item.images[0] || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-neutral-900 text-sm">{item.name}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{item.categoryId}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
