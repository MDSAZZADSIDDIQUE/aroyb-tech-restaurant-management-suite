'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addPromo, getMenuItems, getCategories } from '@/lib/storage';
import { generateId, generateCode, promoTypeConfig, channelConfig, customerEligibilityConfig, dayConfig, formatCurrency } from '@/lib/formatting';
import type { Promo, PromoType, Channel, DiscountType, CustomerEligibility, DayOfWeek } from '@/types';

export default function NewPromoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<PromoType>('discount_code');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minBasket, setMinBasket] = useState(15);
  const [channels, setChannels] = useState<Channel[]>(['web', 'app']);
  const [eligibility, setEligibility] = useState<CustomerEligibility>('all');
  const [stackable, setStackable] = useState(false);
  const [scheduleDays, setScheduleDays] = useState<DayOfWeek[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(25);
  const [bundlePrice, setBundlePrice] = useState(14.99);
  
  const handleGenerateCode = () => {
    setCode(generateCode(8));
  };
  
  const handleChannelToggle = (ch: Channel) => {
    setChannels(channels.includes(ch) ? channels.filter(c => c !== ch) : [...channels, ch]);
  };
  
  const handleDayToggle = (day: DayOfWeek) => {
    setScheduleDays(scheduleDays.includes(day) ? scheduleDays.filter(d => d !== day) : [...scheduleDays, day]);
  };
  
  const handleSubmit = () => {
    const promo: Promo = {
      id: generateId('promo-'),
      type,
      name: name || `New ${promoTypeConfig[type].label}`,
      status: 'active',
      channels,
      code: type === 'discount_code' ? code : undefined,
      discount: type === 'discount_code' ? { type: discountType, value: discountValue } : undefined,
      freeDeliveryThreshold: type === 'free_delivery' ? freeDeliveryThreshold : undefined,
      bundleDefinition: type === 'bundle' ? { fixedPrice: bundlePrice, slots: [], allowSubstitutions: true } : undefined,
      bogofDefinition: type === 'bogof' ? { buyQuantity: 1, getQuantity: 1, applicableItems: 'same', lowestPricedFree: true } : undefined,
      minBasket: minBasket > 0 ? minBasket : undefined,
      customerEligibility: eligibility,
      stackable,
      schedule: scheduleDays.length > 0 ? { daysOfWeek: scheduleDays, startTime: startTime || '00:00', endTime: endTime || '23:59' } : undefined,
      usageLimits: { onePerOrder: true, newCustomersOnly: eligibility === 'new' },
      priority: 10,
      createdAt: new Date().toISOString(),
      stats: { impressions: 0, redemptions: 0, revenue: 0, avgOrderValue: 0, repeatRate: 0 },
    };
    
    addPromo(promo);
    router.push('/promos');
  };
  
  return (
    <div className="p-6 max-w-3xl">
      <Link href="/promos" className="btn btn-ghost mb-4">← Back to Promos</Link>
      <h1 className="text-2xl font-bold mb-6">Create New Promo</h1>
      
      {/* Step 1: Type Selection */}
      {step === 1 && (
        <div className="card">
          <h2 className="font-bold mb-4">Choose Promo Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(promoTypeConfig) as [PromoType, typeof promoTypeConfig[PromoType]][]).map(([key, cfg]) => (
              <button key={key} onClick={() => { setType(key); setStep(2); }} className={`card card-hover text-left ${type === key ? 'border-[#ed7424]' : ''}`}>
                <span className="text-2xl mb-2 block">{cfg.icon}</span>
                <div className="font-bold">{cfg.label}</div>
                <div className="text-xs text-neutral-400 mt-1">
                  {key === 'discount_code' && 'Percentage, fixed amount, or free item'}
                  {key === 'bogof' && 'Buy one get one free deals'}
                  {key === 'bundle' && 'Meal deals with fixed pricing'}
                  {key === 'free_delivery' && 'Waive delivery fee on qualifying orders'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Details */}
      {step === 2 && (
        <div className="card">
          <h2 className="font-bold mb-4">{promoTypeConfig[type].icon} {promoTypeConfig[type].label} Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Promo Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={`My ${promoTypeConfig[type].label}`} className="input" />
            </div>
            
            {type === 'discount_code' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="SAVE10" className="input flex-1" />
                    <button onClick={handleGenerateCode} className="btn btn-secondary">Generate</button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Type</label>
                    <select value={discountType} onChange={e => setDiscountType(e.target.value as DiscountType)} className="select">
                      <option value="percentage">Percentage Off</option>
                      <option value="fixed">Fixed Amount Off</option>
                      <option value="free_item">Free Item</option>
                      <option value="free_delivery">Free Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{discountType === 'percentage' ? 'Percentage (%)' : 'Amount (£)'}</label>
                    <input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="input" />
                  </div>
                </div>
              </>
            )}
            
            {type === 'free_delivery' && (
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order for Free Delivery (£)</label>
                <input type="number" value={freeDeliveryThreshold} onChange={e => setFreeDeliveryThreshold(Number(e.target.value))} className="input" />
              </div>
            )}
            
            {type === 'bundle' && (
              <div>
                <label className="block text-sm font-medium mb-2">Bundle Price (£)</label>
                <input type="number" step="0.01" value={bundlePrice} onChange={e => setBundlePrice(Number(e.target.value))} className="input" />
                <p className="text-xs text-neutral-400 mt-1">Configure items in the editor after creation</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Minimum Basket (£)</label>
              <input type="number" value={minBasket} onChange={e => setMinBasket(Number(e.target.value))} className="input" />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
            <button onClick={() => setStep(3)} className="btn btn-primary">Next</button>
          </div>
        </div>
      )}
      
      {/* Step 3: Rules */}
      {step === 3 && (
        <div className="card">
          <h2 className="font-bold mb-4">Rules & Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Channels</label>
              <div className="flex gap-2">
                {(['web', 'app', 'qr'] as Channel[]).map(ch => (
                  <button key={ch} onClick={() => handleChannelToggle(ch)} className={`btn ${channels.includes(ch) ? 'btn-primary' : 'btn-secondary'}`}>
                    {channelConfig[ch].icon} {channelConfig[ch].label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Customer Eligibility</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(customerEligibilityConfig) as [CustomerEligibility, typeof customerEligibilityConfig[CustomerEligibility]][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => setEligibility(key)} className={`btn ${eligibility === key ? 'btn-primary' : 'btn-secondary'} text-left`}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Schedule (optional)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as DayOfWeek[]).map(day => (
                  <button key={day} onClick={() => handleDayToggle(day)} className={`btn btn-sm ${scheduleDays.includes(day) ? 'btn-primary' : 'btn-secondary'}`}>
                    {dayConfig[day].short}
                  </button>
                ))}
              </div>
              {scheduleDays.length > 0 && (
                <div className="flex gap-2 mt-2">
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input w-32" placeholder="Start" />
                  <span className="self-center">to</span>
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input w-32" placeholder="End" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setStackable(!stackable)} className={`toggle ${stackable ? 'active' : ''}`}></button>
              <span>Stackable with other promos</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
            <button onClick={handleSubmit} className="btn btn-primary">Create Promo</button>
          </div>
        </div>
      )}
    </div>
  );
}
