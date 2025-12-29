import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    { label: 'Menu Items', value: '30', icon: '🍽️', href: '/admin/menu' },
    { label: 'Active Offers', value: '6', icon: '🎉', href: '/offers' },
    { label: 'Locations', value: '2', icon: '📍', href: '/locations' },
    { label: 'FAQ Entries', value: '15', icon: '💬', href: '/admin/faq' },
  ];

  const quickActions = [
    { label: 'Review AI Bundles', desc: 'Approve suggested menu bundles', href: '/admin/bundles', icon: '✨' },
    { label: 'Update SEO', desc: 'Review auto-generated descriptions', href: '/admin/seo', icon: '🔍' },
    { label: 'Edit FAQ', desc: 'Update chatbot knowledge base', href: '/admin/faq', icon: '💬' },
    { label: 'Preview Menu', desc: 'View public menu display', href: '/admin/menu', icon: '👁️' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-2">
          Welcome to the Aroyb SiteBuilder admin panel (demo mode)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-bold text-primary-600">{stat.value}</span>
            </div>
            <p className="text-neutral-600 font-medium">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="bg-white rounded-xl p-6 shadow-soft hover:shadow-lg transition-all hover:-translate-y-1 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl flex-shrink-0">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">{action.label}</h3>
                <p className="text-sm text-neutral-600">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Demo Notice */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🎭 Demo Mode Active</h3>
        <p className="text-white/80 mb-4">
          This is a demonstration of the admin panel. In production, you would have full 
          control over menu items, orders, analytics, and more.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="badge bg-white/20 text-white">No real data affected</span>
          <span className="badge bg-white/20 text-white">Changes stored locally</span>
          <span className="badge bg-white/20 text-white">Full features in production</span>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">AI-Powered Features</h2>
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-lg">
              <span className="text-2xl">🧠</span>
              <div>
                <h4 className="font-semibold text-neutral-900">Smart Menu Search</h4>
                <p className="text-sm text-neutral-600">
                  Customers can search using natural language like &quot;gluten free spicy chicken&quot;
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold text-neutral-900">Personalised Recommendations</h4>
                <p className="text-sm text-neutral-600">
                  Context-aware add-on suggestions based on what customers order
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-lg">
              <span className="text-2xl">📦</span>
              <div>
                <h4 className="font-semibold text-neutral-900">AI Bundle Generator</h4>
                <p className="text-sm text-neutral-600">
                  Automatically creates value bundles from your menu for your approval
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-lg">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="font-semibold text-neutral-900">FAQ Chatbot</h4>
                <p className="text-sm text-neutral-600">
                  Answers customer questions using your restaurant&apos;s knowledge base
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
