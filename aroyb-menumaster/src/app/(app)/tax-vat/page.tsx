'use client';

import { useEffect, useState } from 'react';
import { getVATSettings, saveVATSettings, getItems, getCategories } from '@/lib/storage';
import { vatCategoryConfig, formatCurrency } from '@/lib/formatting';
import type { VATSettings, Item, Category, VATCategory } from '@/types';

export default function TaxVatPage() {
  const [settings, setSettings] = useState<VATSettings | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setSettings(getVATSettings());
    setItems(getItems());
    setCategories(getCategories());
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (settings) saveVATSettings(settings);
  };
  
  const handleExportCSV = () => {
    const rows = [['Item', 'Category', 'Base Price', 'VAT Category', 'VAT Rate', 'VAT Amount', 'Price Inc VAT']];
    items.forEach(item => {
      const cat = categories.find(c => c.id === item.categoryId)?.name || '';
      const rate = vatCategoryConfig[item.vatCategory]?.rate || 20;
      const vatAmount = item.basePrice * (rate / 100);
      rows.push([item.name, cat, item.basePrice.toFixed(2), item.vatCategory, `${rate}%`, vatAmount.toFixed(2), (item.basePrice + vatAmount).toFixed(2)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-vat-export.csv';
    a.click();
  };
  
  if (loading || !settings) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  // Summary
  const vatSummary = Object.entries(vatCategoryConfig).map(([key, cfg]) => {
    const catItems = items.filter(i => i.vatCategory === key);
    const revenue = catItems.reduce((sum, i) => sum + i.basePrice, 0);
    const vat = revenue * (cfg.rate / 100);
    return { category: cfg.label, count: catItems.length, revenue, vat };
  });
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tax & VAT Configuration</h1>
        <button onClick={handleExportCSV} className="btn btn-primary">📥 Export CSV</button>
      </div>
      
      {/* VAT Rates */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">VAT Rates</h2>
        <div className="space-y-3">
          {settings.rates.map((rate, i) => (
            <div key={rate.id} className="flex items-center gap-4">
              <input type="text" value={rate.name} onChange={e => {
                const rates = [...settings.rates];
                rates[i] = { ...rate, name: e.target.value };
                setSettings({ ...settings, rates });
              }} className="input flex-1" />
              <div className="flex items-center gap-1">
                <input type="number" value={rate.rate} onChange={e => {
                  const rates = [...settings.rates];
                  rates[i] = { ...rate, rate: parseFloat(e.target.value) || 0 };
                  setSettings({ ...settings, rates });
                }} className="input w-20" />
                <span>%</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSave} className="btn btn-primary mt-4">Save Changes</button>
      </div>
      
      {/* Summary */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">VAT Summary by Category</h2>
        <table className="table">
          <thead>
            <tr>
              <th>VAT Category</th>
              <th>Items</th>
              <th>Total Revenue (Net)</th>
              <th>VAT Amount</th>
            </tr>
          </thead>
          <tbody>
            {vatSummary.map(s => (
              <tr key={s.category}>
                <td>{s.category}</td>
                <td>{s.count}</td>
                <td>{formatCurrency(s.revenue)}</td>
                <td>{formatCurrency(s.vat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Export Preview */}
      <div className="card">
        <h2 className="font-bold mb-4">Export Preview</h2>
        <div className="overflow-auto max-h-64">
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Net Price</th>
                <th>VAT %</th>
                <th>VAT</th>
                <th>Gross</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 15).map(item => {
                const rate = vatCategoryConfig[item.vatCategory]?.rate || 20;
                const vat = item.basePrice * (rate / 100);
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{categories.find(c => c.id === item.categoryId)?.name}</td>
                    <td>{formatCurrency(item.basePrice)}</td>
                    <td>{rate}%</td>
                    <td>{formatCurrency(vat)}</td>
                    <td className="font-semibold">{formatCurrency(item.basePrice + vat)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500 mt-2">Showing first 15 items. Export full list with button above.</p>
      </div>
    </div>
  );
}
