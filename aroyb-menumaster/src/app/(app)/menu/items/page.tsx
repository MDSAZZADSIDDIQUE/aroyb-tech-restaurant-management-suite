'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getItems, getCategories, updateItem, addItem, deleteItem } from '@/lib/storage';
import { formatCurrency, stationConfig, dietaryTagConfig, generateId } from '@/lib/formatting';
import type { Item, Category } from '@/types';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStation, setFilterStation] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setItems(getItems());
    setCategories(getCategories());
    setLoading(false);
  }, []);
  
  const filtered = items.filter(item => {
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && item.categoryId !== filterCategory) return false;
    if (filterStation && item.station !== filterStation) return false;
    return true;
  });
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';
  
  const handleDuplicate = (item: Item) => {
    const newItem: Item = {
      ...item,
      id: generateId('i'),
      name: item.name + ' (Copy)',
    };
    addItem(newItem);
    setItems([...items, newItem]);
  };
  
  const handleToggleStock = (item: Item) => {
    updateItem(item.id, { availability: { ...item.availability, inStock: !item.availability.inStock } });
    setItems(items.map(i => i.id === item.id ? { ...i, availability: { ...i.availability, inStock: !i.availability.inStock } } : i));
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Delete this item?')) {
      deleteItem(id);
      setItems(items.filter(i => i.id !== id));
    }
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <Link href="/menu/items/new" className="btn btn-primary">+ Add Item</Link>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input type="text" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} className="input w-64" />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="select">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStation} onChange={e => setFilterStation(e.target.value)} className="select">
          <option value="">All Stations</option>
          {Object.entries(stationConfig).map(([id, cfg]) => <option key={id} value={id}>{cfg.icon} {cfg.label}</option>)}
        </select>
        <div className="text-neutral-400 self-center">{filtered.length} items</div>
      </div>
      
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Station</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-neutral-500 max-w-xs truncate">{item.description}</div>
                </td>
                <td>{getCategoryName(item.categoryId)}</td>
                <td className="font-semibold">{formatCurrency(item.basePrice)}</td>
                <td>
                  <span className={`badge ${stationConfig[item.station].color}`}>
                    {stationConfig[item.station].icon} {stationConfig[item.station].label}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1 flex-wrap max-w-[120px]">
                    {item.dietaryTags.slice(0, 2).map(tag => (
                      <span key={tag} className={`tag ${dietaryTagConfig[tag]?.color || 'bg-neutral-700'}`}>
                        {dietaryTagConfig[tag]?.icon}
                      </span>
                    ))}
                    {item.dietaryTags.length > 2 && <span className="tag bg-neutral-700">+{item.dietaryTags.length - 2}</span>}
                  </div>
                </td>
                <td>
                  <button onClick={() => handleToggleStock(item)} className={`badge cursor-pointer ${item.availability.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {item.availability.inStock ? 'In Stock' : '86\'d'}
                  </button>
                </td>
                <td>
                  <div className="flex gap-1">
                    <Link href={`/menu/items/${item.id}`} className="btn btn-ghost btn-sm">Edit</Link>
                    <button onClick={() => handleDuplicate(item)} className="btn btn-ghost btn-sm">📋</button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-ghost btn-sm text-red-400">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
