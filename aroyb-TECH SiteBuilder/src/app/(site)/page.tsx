import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import menuData from '@/data/menu.json';
import locationsData from '@/data/locations.json';
import offersData from '@/data/offers.json';
import { MenuItem, Location, Offer } from '@/types';

export const metadata: Metadata = {
  title: 'Aroyb Grill & Curry | Authentic Indian Restaurant | Order Online',
  description: 'Experience the finest Indian cuisine at Aroyb Grill & Curry. Authentic curries, tandoori grills, and biryanis. Order online for delivery or collection across Manchester and Birmingham.',
};

export default function HomePage() {
  const popularItems = (menuData.items as MenuItem[]).filter(item => item.popular).slice(0, 4);
  const locations = locationsData.locations as Location[];
  const featuredOffer = (offersData.offers as Offer[])[0];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1920"
            alt="Delicious Indian food"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-hero-pattern" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur rounded-full 
                          text-white text-sm font-medium mb-6">
              🌟 Voted Best Curry in Manchester 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Authentic Indian Flavours,{' '}
              <span className="text-secondary-400">Delivered Fresh</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              From our tandoor to your table. Experience handcrafted curries, sizzling grills, 
              and aromatic biryanis made with love and tradition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/menu" className="btn-primary text-lg px-8 py-4">
                Order Now
              </Link>
              <Link href="/menu" className="btn-secondary text-lg px-8 py-4 bg-white/10 border-white text-white hover:bg-white hover:text-primary-700">
                View Menu
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/20">
              <div>
                <p className="text-3xl font-bold text-white">25+</p>
                <p className="text-white/70">Years of tradition</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">50k+</p>
                <p className="text-white/70">Happy customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">4.8★</p>
                <p className="text-white/70">Average rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 
                           flex items-center justify-center text-3xl">
                🚚
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Fast Delivery</h3>
              <p className="text-neutral-600">
                Hot food delivered to your door in 25-45 minutes. Track your order in real-time.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 
                           flex items-center justify-center text-3xl">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">100% Halal</h3>
              <p className="text-neutral-600">
                All our meat is certified halal. We maintain the highest standards of quality.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 
                           flex items-center justify-center text-3xl">
                🌿
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Fresh Ingredients</h3>
              <p className="text-neutral-600">
                Daily sourced spices and ingredients. No artificial colours or preservatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offer Banner */}
      {featuredOffer && (
        <section className="py-8 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <span className="badge bg-secondary-500 text-neutral-900 mb-2">
                  {featuredOffer.discount}
                </span>
                <h3 className="text-2xl font-bold text-white">{featuredOffer.title}</h3>
                <p className="text-white/80">{featuredOffer.description}</p>
              </div>
              <Link href="/offers" className="btn-secondary bg-white text-primary-700 hover:bg-neutral-100 whitespace-nowrap">
                View All Offers
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Items */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-primary mb-4">Most Loved</span>
            <h2 className="section-heading">Customer Favourites</h2>
            <p className="section-subheading mx-auto mt-4">
              The dishes our customers can&apos;t stop ordering
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularItems.map((item) => (
              <Link href="/menu" key={item.id} className="card group">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.images[0] || 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="bg-white px-3 py-1 rounded-full font-bold text-neutral-900 shadow-soft">
                      £{item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-neutral-900 group-hover:text-primary-600 
                               transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-neutral-600 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/menu" className="btn-primary">
              View Full Menu →
            </Link>
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-primary mb-4">Delivery & Collection</span>
              <h2 className="section-heading mb-6">Your Way, Your Time</h2>
              <p className="text-neutral-600 text-lg mb-8 leading-relaxed">
                Whether you&apos;re craving a quick lunch or planning a family feast, 
                we&apos;ve got you covered. Choose delivery to your door or collect from 
                your nearest location.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Free delivery on orders over £25</h4>
                    <p className="text-neutral-600 text-sm">To qualifying postcodes</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Click & Collect ready in 15-25 mins</h4>
                    <p className="text-neutral-600 text-sm">Skip the queue, grab and go</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Schedule orders up to 7 days ahead</h4>
                    <p className="text-neutral-600 text-sm">Perfect for parties and events</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/locations" className="link text-lg">
                  Check delivery areas →
                </Link>
              </div>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800"
                alt="Delicious food ready for delivery"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge bg-secondary-500 text-neutral-900 mb-4">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah M.',
                location: 'Manchester',
                rating: 5,
                text: 'The best Indian food I\'ve had outside of India! The Chicken Tikka Masala is absolutely divine. Fast delivery too!',
              },
              {
                name: 'James K.',
                location: 'Birmingham',
                rating: 5,
                text: 'We order from Aroyb every Friday. The lamb biryani is our family favourite. Consistent quality every time.',
              },
              {
                name: 'Priya S.',
                location: 'Rusholme',
                rating: 5,
                text: 'Finally found a restaurant that does proper South Indian dishes! The allergen info is really helpful for my son.',
              },
            ].map((review, index) => (
              <div key={index} className="bg-neutral-800 rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-secondary-400">★</span>
                  ))}
                </div>
                <p className="text-neutral-300 mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-neutral-500">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="badge-primary mb-4">Our Locations</span>
            <h2 className="section-heading">Find Us Near You</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {locations.map((location) => (
              <div key={location.id} className="card-flat p-6">
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-2">
                  {location.shortName}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {location.address}, {location.city} {location.postcode}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-2 text-neutral-600">
                    <span>📞</span> {location.phone}
                  </span>
                  <span className="flex items-center gap-2 text-neutral-600">
                    <span>⏰</span> Open until 10pm
                  </span>
                </div>
                <Link 
                  href={`/locations/${location.id}`}
                  className="inline-block mt-4 text-primary-600 font-medium hover:text-primary-700"
                >
                  View details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Ready to Taste the Difference?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Order now and get 20% off your first order with code WELCOME20
          </p>
          <Link href="/menu" className="btn-accent text-lg px-10 py-4">
            Start Your Order
          </Link>
        </div>
      </section>
    </div>
  );
}
