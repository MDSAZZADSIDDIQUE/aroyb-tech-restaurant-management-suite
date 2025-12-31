'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGiftCardProducts, addGiftCardIssued } from '@/lib/storage';
import { generateGiftCardCode, generateId, formatCurrency, giftCardDesignConfig } from '@/lib/formatting';
import type { GiftCardProduct, GiftCardIssued } from '@/types';

export default function IssueGiftCardPage() {
  const router = useRouter();
  const products = getGiftCardProducts();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<GiftCardProduct | null>(null);
  const [amount, setAmount] = useState(25);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [issuedCard, setIssuedCard] = useState<GiftCardIssued | null>(null);
  
  const handleIssue = () => {
    if (!selectedProduct) return;
    
    const expiresAt = selectedProduct.expiryDays 
      ? new Date(Date.now() + selectedProduct.expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;
    
    const card: GiftCardIssued = {
      id: generateId('gc-'),
      code: generateGiftCardCode(),
      productId: selectedProduct.id,
      initialBalance: amount,
      remainingBalance: amount,
      issuedToEmail: recipientEmail || undefined,
      issuedToName: recipientName || undefined,
      createdAt: new Date().toISOString(),
      expiresAt,
      redemptionCount: 0,
    };
    
    addGiftCardIssued(card);
    setIssuedCard(card);
    setStep(3);
  };
  
  return (
    <div className="p-6 max-w-2xl">
      <Link href="/gift-cards" className="btn btn-ghost mb-4">← Back to Gift Cards</Link>
      <h1 className="text-2xl font-bold mb-6">Issue Gift Card</h1>
      
      {/* Step 1: Select Product */}
      {step === 1 && (
        <div className="card">
          <h2 className="font-bold mb-4">Choose Gift Card</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.filter(p => p.active).map(product => (
              <button key={product.id} onClick={() => { setSelectedProduct(product); setAmount(product.amounts[0]); setStep(2); }} className="card card-hover text-left">
                <div className={`h-16 rounded-lg mb-3 bg-gradient-to-br ${giftCardDesignConfig[product.designTemplate]?.gradient}`}></div>
                <div className="font-bold">{product.name}</div>
                <div className="text-xs text-neutral-400">{product.amounts.map(a => formatCurrency(a)).join(' • ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Step 2: Details */}
      {step === 2 && selectedProduct && (
        <div className="card">
          <h2 className="font-bold mb-4">{selectedProduct.name}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.amounts.map(a => (
                  <button key={a} onClick={() => setAmount(a)} className={`btn ${amount === a ? 'btn-primary' : 'btn-secondary'}`}>
                    {formatCurrency(a)}
                  </button>
                ))}
                {selectedProduct.allowCustomAmount && (
                  <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="input w-24" min={selectedProduct.minCustomAmount} max={selectedProduct.maxCustomAmount} />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name (optional)</label>
              <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="John Smith" className="input" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email (optional)</label>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="john@example.com" className="input" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Personal Message (optional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Enjoy your gift!" className="textarea" />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
            <button onClick={handleIssue} className="btn btn-primary">Issue Card</button>
          </div>
        </div>
      )}
      
      {/* Step 3: Confirmation */}
      {step === 3 && issuedCard && selectedProduct && (
        <div className="card text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">Gift Card Issued!</h2>
          
          <div className={`h-32 rounded-xl my-6 bg-gradient-to-br ${giftCardDesignConfig[selectedProduct.designTemplate]?.gradient} flex flex-col items-center justify-center`}>
            <div className="text-white font-bold text-2xl">{formatCurrency(issuedCard.initialBalance)}</div>
            <code className="text-white/80 mt-2">{issuedCard.code}</code>
          </div>
          
          <div className="text-left p-4 rounded-lg bg-neutral-800 mb-4">
            <div className="text-sm space-y-1">
              <div><span className="text-neutral-400">Code:</span> <code className="text-[#ed7424]">{issuedCard.code}</code></div>
              <div><span className="text-neutral-400">Amount:</span> {formatCurrency(issuedCard.initialBalance)}</div>
              {issuedCard.issuedToName && <div><span className="text-neutral-400">To:</span> {issuedCard.issuedToName}</div>}
              {issuedCard.expiresAt && <div><span className="text-neutral-400">Expires:</span> {new Date(issuedCard.expiresAt).toLocaleDateString()}</div>}
            </div>
          </div>
          
          {issuedCard.issuedToEmail && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-4">
              <div className="text-sm text-blue-400">📧 Email Preview (Demo)</div>
              <div className="text-xs text-neutral-400 mt-2">
                To: {issuedCard.issuedToEmail}<br />
                Subject: You&apos;ve received a {formatCurrency(issuedCard.initialBalance)} gift card!
              </div>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            <button onClick={() => { setStep(1); setSelectedProduct(null); setIssuedCard(null); }} className="btn btn-secondary">Issue Another</button>
            <Link href="/gift-cards" className="btn btn-primary">Done</Link>
          </div>
        </div>
      )}
    </div>
  );
}
