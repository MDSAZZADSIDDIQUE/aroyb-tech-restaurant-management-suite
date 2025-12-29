'use client';

import Header from '@/components/layout/Header';

export default function ConnectorsSettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Marketplace Connectors" subtitle="Connect to third-party ordering platforms" />
      
      <div className="p-6 space-y-6">
        {/* Coming Soon */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Marketplace Integrations</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Connect your restaurant to popular food delivery platforms and manage all orders in one place.
          </p>
          
          {/* Placeholder Connectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {['Deliveroo', 'Uber Eats', 'Just Eat', 'DoorDash'].map(platform => (
              <div key={platform} className="p-4 border border-gray-200 rounded-lg opacity-50">
                <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  🍔
                </div>
                <p className="font-medium text-sm">{platform}</p>
                <span className="text-xs text-gray-400">Coming Soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Features */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Planned Features</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">✓</span>
              Automatic order sync from marketplace platforms
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">✓</span>
              Menu sync and price management
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">✓</span>
              Item availability (86) pushed to all platforms
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs">✓</span>
              Consolidated analytics across all channels
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
