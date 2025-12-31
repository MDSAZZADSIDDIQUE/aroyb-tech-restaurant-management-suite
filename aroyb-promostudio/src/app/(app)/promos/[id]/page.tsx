'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPromoById, updatePromo, getMenuItems, getCategories } from '@/lib/storage';
import { applyPromo, canApplyPromo } from '@/lib/promo-engine';
import { formatCurrency, promoTypeConfig, promoStatusConfig, channelConfig, customerEligibilityConfig, dayConfig, formatDate } from '@/lib/formatting';
import type { Promo, Cart, CartItem, Channel, CustomerEligibility, DayOfWeek, PromoStatus } from '@/types';

export default function PromoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Cart preview state
  const menuItems = getMenuItems();
  const [cart, setCart] = useState<Cart>({
    items: [
      { id: 'item-30', name: 'Classic Burger', price: 12.95, quantity: 1, categoryId: 'cat-burgers' },
      { id: 'item-40', name: 'Chunky Chips', price: 3.95, quantity: 1, categoryId: 'cat-sides' },
      { id: 'item-50', name: 'Coca-Cola', price: 2.95, quantity: 1, categoryId: 'cat-drinks' },
    ],
    subtotal: 19.85,
    deliveryFee: 2.99,
    discount: 0,
    appliedPromos: [],
    total: 22.84,
    isDelivery: true,
  });
  
  useEffect(() => {
    const p = getPromoById(params.id as string);
    if (p) {
      setPromo(p);
    }
    setLoading(false);
  }, [params.id]);
  
  const updateCart = () => {
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    if (promo) {
      discount = applyPromo(promo, { ...cart, subtotal });
    }
    const total = subtotal + cart.deliveryFee - discount;
    setCart({ ...cart, subtotal, discount, total });
  };
  
  useEffect(() => {
    updateCart();
  }, [promo, cart.items, cart.isDelivery]);
  
  const handleSave = () => {
    if (promo) {
      updatePromo(promo.id, promo);
      alert('Promo saved!');
    }
  };
  
  const handleStatusChange = (status: PromoStatus) => {
    if (promo) {
      setPromo({ ...promo, status });
    }
  };
  
  const addToCart = (item: typeof menuItems[0]) => {
    const existing = cart.items.find(i => i.id === item.id);
    if (existing) {
      setCart({
        ...cart,
        items: cart.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i),
      });
    } else {
      setCart({
        ...cart,
        items: [...cart.items, { id: item.id, name: item.name, price: item.price, quantity: 1, categoryId: item.categoryId }],
      });
    }
  };
  
  const removeFromCart = (itemId: string) => {
    setCart({ ...cart, items: cart.items.filter(i => i.id !== itemId) });
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!promo) {
    return <div className="p-6"><div className="card text-center py-12"><h2>Promo not found</h2><Link href="/promos" className="btn btn-primary mt-4">Back to Promos</Link></div></div>;
  }
  
  const eligibility = promo ? canApplyPromo(promo, cart, cart.isDelivery) : { valid: false, reason: '' };
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/promos" className="btn btn-ghost">← Back</Link>
          <div>
            <h1 className="text-2xl font-bold">{promo.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${promoTypeConfig[promo.type].color}`}>{promoTypeConfig[promo.type].icon} {promoTypeConfig[promo.type].label}</span>
              <span className={`badge ${promoStatusConfig[promo.status].color}`}>{promoStatusConfig[promo.status].label}</span>
            </div>
          </div>
        </div>
        <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <div className="tabs">
            <button onClick={() => setActiveTab('details')} className={`tab ${activeTab === 'details' ? 'active' : ''}`}>Details</button>
            <button onClick={() => setActiveTab('rules')} className={`tab ${activeTab === 'rules' ? 'active' : ''}`}>Rules</button>
            <button onClick={() => setActiveTab('schedule')} className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}>Schedule</button>
            <button onClick={() => setActiveTab('stats')} className={`tab ${activeTab === 'stats' ? 'active' : ''}`}>Stats</button>
          </div>
          
          <div className="card">
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" value={promo.name} onChange={e => setPromo({ ...promo, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea value={promo.description || ''} onChange={e => setPromo({ ...promo, description: e.target.value })} className="textarea" />
                </div>
                {promo.code && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Promo Code</label>
                    <input type="text" value={promo.code} onChange={e => setPromo({ ...promo, code: e.target.value.toUpperCase() })} className="input" />
                  </div>
                )}
                {promo.discount && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Discount Value</label>
                      <input type="number" value={promo.discount.value} onChange={e => setPromo({ ...promo, discount: { ...promo.discount!, value: Number(e.target.value) } })} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <div className="p-3 bg-neutral-800 rounded-lg">{promo.discount.type}</div>
                    </div>
                  </div>
                )}
                {promo.freeDeliveryThreshold !== undefined && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Free Delivery Threshold (£)</label>
                    <input type="number" value={promo.freeDeliveryThreshold} onChange={e => setPromo({ ...promo, freeDeliveryThreshold: Number(e.target.value) })} className="input" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="flex gap-2">
                    {(['active', 'paused', 'draft'] as PromoStatus[]).map(s => (
                      <button key={s} onClick={() => handleStatusChange(s)} className={`btn ${promo.status === s ? 'btn-primary' : 'btn-secondary'}`}>
                        {promoStatusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Basket (£)</label>
                  <input type="number" value={promo.minBasket || 0} onChange={e => setPromo({ ...promo, minBasket: Number(e.target.value) })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Customer Eligibility</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(customerEligibilityConfig) as CustomerEligibility[]).map(key => (
                      <button key={key} onClick={() => setPromo({ ...promo, customerEligibility: key })} className={`btn ${promo.customerEligibility === key ? 'btn-primary' : 'btn-secondary'}`}>
                        {customerEligibilityConfig[key].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Channels</label>
                  <div className="flex gap-2">
                    {(['web', 'app', 'qr'] as Channel[]).map(ch => (
                      <button key={ch} onClick={() => setPromo({ ...promo, channels: promo.channels.includes(ch) ? promo.channels.filter(c => c !== ch) : [...promo.channels, ch] })} className={`btn ${promo.channels.includes(ch) ? 'btn-primary' : 'btn-secondary'}`}>
                        {channelConfig[ch].icon} {channelConfig[ch].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => setPromo({ ...promo, stackable: !promo.stackable })} className={`toggle ${promo.stackable ? 'active' : ''}`}></button>
                  <span>Stackable with other promos</span>
                </div>
              </div>
            )}
            
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as DayOfWeek[]).map(day => (
                      <button key={day} onClick={() => {
                        const days = promo.schedule?.daysOfWeek || [];
                        const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                        setPromo({ ...promo, schedule: { ...promo.schedule, daysOfWeek: newDays, startTime: promo.schedule?.startTime || '00:00', endTime: promo.schedule?.endTime || '23:59' } });
                      }} className={`btn btn-sm ${promo.schedule?.daysOfWeek?.includes(day) ? 'btn-primary' : 'btn-secondary'}`}>
                        {dayConfig[day].short}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input type="time" value={promo.schedule?.startTime || ''} onChange={e => setPromo({ ...promo, schedule: { ...promo.schedule!, startTime: e.target.value } })} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input type="time" value={promo.schedule?.endTime || ''} onChange={e => setPromo({ ...promo, schedule: { ...promo.schedule!, endTime: e.target.value } })} className="input" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority (higher = wins conflicts)</label>
                  <input type="number" value={promo.priority} onChange={e => setPromo({ ...promo, priority: Number(e.target.value) })} className="input w-24" />
                </div>
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="stat-card"><div className="stat-value">{promo.stats.impressions.toLocaleString()}</div><div className="stat-label">Impressions</div></div>
                <div className="stat-card"><div className="stat-value">{promo.stats.redemptions.toLocaleString()}</div><div className="stat-label">Redemptions</div></div>
                <div className="stat-card"><div className="stat-value">{formatCurrency(promo.stats.revenue)}</div><div className="stat-label">Revenue</div></div>
                <div className="stat-card"><div className="stat-value">{formatCurrency(promo.stats.avgOrderValue)}</div><div className="stat-label">Avg Order</div></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Cart Preview */}
        <div className="card h-fit sticky top-16">
          <h3 className="font-bold mb-4">🛒 Cart Preview</h3>
          
          <div className="flex gap-2 mb-4">
            <button onClick={() => setCart({ ...cart, isDelivery: true })} className={`btn btn-sm flex-1 ${cart.isDelivery ? 'btn-primary' : 'btn-secondary'}`}>Delivery</button>
            <button onClick={() => setCart({ ...cart, isDelivery: false })} className={`btn btn-sm flex-1 ${!cart.isDelivery ? 'btn-primary' : 'btn-secondary'}`}>Collection</button>
          </div>
          
          <div className="space-y-2 mb-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.quantity}× {item.name}</span>
                <div className="flex items-center gap-2">
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 text-xs">×</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-neutral-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
            {cart.isDelivery && <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(cart.deliveryFee)}</span></div>}
            {cart.discount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-{formatCurrency(cart.discount)}</span></div>}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-700"><span>Total</span><span>{formatCurrency(cart.total)}</span></div>
          </div>
          
          <div className={`mt-4 p-3 rounded-lg ${eligibility.valid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {eligibility.valid ? '✓ Promo applies!' : `✗ ${eligibility.reason}`}
          </div>
          
          <div className="mt-4">
            <select onChange={e => { const item = menuItems.find(i => i.id === e.target.value); if (item) addToCart(item); e.target.value = ''; }} className="select text-sm">
              <option value="">+ Add item to cart</option>
              {menuItems.map(item => <option key={item.id} value={item.id}>{item.name} - {formatCurrency(item.price)}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
