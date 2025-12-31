'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getGiftCardProducts, getGiftCardsIssued } from '@/lib/storage';
import { formatCurrency, giftCardDesignConfig, formatDate } from '@/lib/formatting';
import type { GiftCardProduct, GiftCardIssued } from '@/types';

export default function GiftCardsPage() {
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [issued, setIssued] = useState<GiftCardIssued[]>([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setProducts(getGiftCardProducts());
    setIssued(getGiftCardsIssued());
    setLoading(false);
  }, []);
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const totalBalance = issued.reduce((sum, gc) => sum + gc.remainingBalance, 0);
  const activeCards = issued.filter(gc => gc.remainingBalance > 0).length;
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gift Cards</h1>
          <p className="text-neutral-400 text-sm">{products.length} products, {issued.length} issued</p>
        </div>
        <Link href="/gift-cards/issue" className="btn btn-primary">✉️ Issue Card</Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card"><div className="stat-value">{issued.length}</div><div className="stat-label">Total Issued</div></div>
        <div className="stat-card"><div className="stat-value">{activeCards}</div><div className="stat-label">Active Cards</div></div>
        <div className="stat-card"><div className="stat-value">{formatCurrency(totalBalance)}</div><div className="stat-label">Outstanding Balance</div></div>
        <div className="stat-card"><div className="stat-value">{issued.reduce((sum, gc) => sum + gc.redemptionCount, 0)}</div><div className="stat-label">Total Redemptions</div></div>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab('products')} className={`tab ${activeTab === 'products' ? 'active' : ''}`}>Products</button>
        <button onClick={() => setActiveTab('issued')} className={`tab ${activeTab === 'issued' ? 'active' : ''}`}>Issued Cards</button>
      </div>
      
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="card">
              <div className={`h-24 rounded-lg mb-4 bg-gradient-to-br ${giftCardDesignConfig[product.designTemplate]?.gradient || 'from-neutral-700 to-neutral-900'} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{product.name}</span>
              </div>
              <h3 className="font-bold">{product.name}</h3>
              <div className="text-sm text-neutral-400 mt-1">
                {product.amounts.map(a => formatCurrency(a)).join(' • ')}
                {product.allowCustomAmount && ' • Custom'}
              </div>
              <div className="text-xs text-neutral-500 mt-2">
                {product.expiryDays ? `Expires in ${product.expiryDays} days` : 'No expiry'}
              </div>
              <div className={`mt-3 inline-block px-2 py-1 rounded text-xs ${product.active ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'}`}>
                {product.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'issued' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Recipient</th>
                <th>Balance</th>
                <th>Issued</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issued.slice(0, 20).map(gc => {
                const product = products.find(p => p.id === gc.productId);
                return (
                  <tr key={gc.id}>
                    <td><code className="text-[#ed7424]">{gc.code}</code></td>
                    <td>{product?.name || 'Unknown'}</td>
                    <td>
                      {gc.issuedToName || gc.issuedToEmail || <span className="text-neutral-500">Anonymous</span>}
                    </td>
                    <td>
                      <span className={gc.remainingBalance > 0 ? 'text-green-400' : 'text-neutral-500'}>
                        {formatCurrency(gc.remainingBalance)}
                      </span>
                      <span className="text-neutral-500 text-xs"> / {formatCurrency(gc.initialBalance)}</span>
                    </td>
                    <td className="text-neutral-400">{formatDate(gc.createdAt)}</td>
                    <td>
                      {gc.remainingBalance === 0 ? (
                        <span className="badge bg-neutral-500/20 text-neutral-400">Redeemed</span>
                      ) : gc.remainingBalance < gc.initialBalance ? (
                        <span className="badge bg-amber-500/20 text-amber-400">Partial</span>
                      ) : (
                        <span className="badge bg-green-500/20 text-green-400">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
