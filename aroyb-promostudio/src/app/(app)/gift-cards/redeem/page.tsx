'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getGiftCardByCode, getMenuItems, updateGiftCardIssued } from '@/lib/storage';
import { formatCurrency } from '@/lib/formatting';
import type { GiftCardIssued, Cart, CartItem } from '@/types';

export default function RedeemGiftCardPage() {
  const menuItems = getMenuItems();
  const [code, setCode] = useState('');
  const [giftCard, setGiftCard] = useState<GiftCardIssued | null>(null);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<Cart>({
    items: [
      { id: 'item-30', name: 'Classic Burger', price: 12.95, quantity: 1, categoryId: 'cat-burgers' },
      { id: 'item-40', name: 'Chunky Chips', price: 3.95, quantity: 1, categoryId: 'cat-sides' },
    ],
    subtotal: 16.90,
    deliveryFee: 2.99,
    discount: 0,
    appliedPromos: [],
    total: 19.89,
    isDelivery: true,
  });
  const [appliedAmount, setAppliedAmount] = useState(0);
  const [redeemed, setRedeemed] = useState(false);
  
  const handleLookup = () => {
    setError('');
    const gc = getGiftCardByCode(code.toUpperCase());
    if (!gc) {
      setError('Gift card not found');
      return;
    }
    if (gc.remainingBalance <= 0) {
      setError('Gift card has no remaining balance');
      return;
    }
    setGiftCard(gc);
    setAppliedAmount(Math.min(gc.remainingBalance, cart.total));
  };
  
  const updateCart = () => {
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = subtotal + (cart.isDelivery ? cart.deliveryFee : 0) - cart.discount;
    setCart({ ...cart, subtotal, total });
  };
  
  const handleApply = () => {
    if (!giftCard) return;
    
    const amountToUse = Math.min(giftCard.remainingBalance, cart.total);
    const newBalance = giftCard.remainingBalance - amountToUse;
    
    updateGiftCardIssued(giftCard.code, {
      remainingBalance: newBalance,
      redemptionCount: giftCard.redemptionCount + 1,
      redeemedAt: newBalance === 0 ? new Date().toISOString() : undefined,
    });
    
    setAppliedAmount(amountToUse);
    setRedeemed(true);
  };
  
  const addToCart = (item: typeof menuItems[0]) => {
    const existing = cart.items.find(i => i.id === item.id);
    if (existing) {
      const newCart = { ...cart, items: cart.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) };
      const subtotal = newCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      setCart({ ...newCart, subtotal, total: subtotal + (newCart.isDelivery ? newCart.deliveryFee : 0) });
    } else {
      const newCart = { ...cart, items: [...cart.items, { id: item.id, name: item.name, price: item.price, quantity: 1, categoryId: item.categoryId }] };
      const subtotal = newCart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      setCart({ ...newCart, subtotal, total: subtotal + (newCart.isDelivery ? newCart.deliveryFee : 0) });
    }
  };
  
  return (
    <div className="p-6 max-w-2xl">
      <Link href="/gift-cards" className="btn btn-ghost mb-4">← Back to Gift Cards</Link>
      <h1 className="text-2xl font-bold mb-6">Redeem Gift Card</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lookup */}
        <div className="card">
          <h2 className="font-bold mb-4">Enter Gift Card Code</h2>
          <div className="flex gap-2">
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="GC-XXXXXXXX" className="input flex-1 font-mono" />
            <button onClick={handleLookup} className="btn btn-primary">Lookup</button>
          </div>
          
          {error && <div className="mt-3 p-3 rounded-lg bg-red-500/10 text-red-400 text-sm">{error}</div>}
          
          {giftCard && !redeemed && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="text-green-400 font-bold">✓ Valid Gift Card</div>
              <div className="text-sm mt-2 space-y-1">
                <div>Balance: <span className="font-bold">{formatCurrency(giftCard.remainingBalance)}</span></div>
                {giftCard.issuedToName && <div>Issued to: {giftCard.issuedToName}</div>}
              </div>
              <button onClick={handleApply} className="btn btn-success mt-4 w-full">
                Apply {formatCurrency(appliedAmount)} to Order
              </button>
            </div>
          )}
          
          {redeemed && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-green-400 font-bold">Gift Card Applied!</div>
              <div className="text-sm mt-2">
                {formatCurrency(appliedAmount)} deducted from order
                <br />
                Remaining balance: {formatCurrency((giftCard?.remainingBalance || 0) - appliedAmount)}
              </div>
            </div>
          )}
        </div>
        
        {/* Cart Preview */}
        <div className="card">
          <h3 className="font-bold mb-4">🛒 Demo Cart</h3>
          
          <div className="space-y-2 mb-4">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span>{item.quantity}× {item.name}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-neutral-700 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span></div>
            {cart.isDelivery && <div className="flex justify-between"><span>Delivery</span><span>{formatCurrency(cart.deliveryFee)}</span></div>}
            {redeemed && <div className="flex justify-between text-green-400"><span>Gift Card</span><span>-{formatCurrency(appliedAmount)}</span></div>}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-neutral-700">
              <span>Total</span>
              <span>{formatCurrency(Math.max(0, cart.total - (redeemed ? appliedAmount : 0)))}</span>
            </div>
          </div>
          
          <select onChange={e => { const item = menuItems.find(i => i.id === e.target.value); if (item) addToCart(item); e.target.value = ''; }} className="select text-sm mt-4">
            <option value="">+ Add item</option>
            {menuItems.map(item => <option key={item.id} value={item.id}>{item.name} - {formatCurrency(item.price)}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
