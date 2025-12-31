'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, saveCategories, getItemsByCategory, deleteCategory } from '@/lib/storage';
import { channelConfig, generateId } from '@/lib/formatting';
import type { Category, Channel } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setCategories(getCategories().sort((a, b) => a.sortOrder - b.sortOrder));
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (!editForm.name) return;
    
    let updated = [...categories];
    if (editingId === 'new') {
      updated.push({
        id: generateId('cat-'),
        name: editForm.name,
        description: editForm.description,
        sortOrder: categories.length + 1,
        channelsEnabled: editForm.channelsEnabled || ['web', 'app', 'qr'],
      });
    } else {
      updated = updated.map(c => c.id === editingId ? { ...c, ...editForm } : c);
    }
    
    saveCategories(updated);
    setCategories(updated.sort((a, b) => a.sortOrder - b.sortOrder));
    setEditingId(null);
    setEditForm({});
  };
  
  const handleDelete = (id: string) => {
    const itemCount = getItemsByCategory(id).length;
    if (itemCount > 0) {
      alert(`Cannot delete category with ${itemCount} items. Move or delete items first.`);
      return;
    }
    if (confirm('Delete this category?')) {
      deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    }
  };
  
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(c => c.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === categories.length - 1)) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...categories];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((c, i) => c.sortOrder = i + 1);
    
    saveCategories(updated);
    setCategories(updated);
  };
  
  const toggleChannel = (channel: Channel) => {
    const current = editForm.channelsEnabled || [];
    if (current.includes(channel)) {
      setEditForm({ ...editForm, channelsEnabled: current.filter(c => c !== channel) });
    } else {
      setEditForm({ ...editForm, channelsEnabled: [...current, channel] });
    }
  };
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setEditingId('new'); setEditForm({ channelsEnabled: ['web', 'app', 'qr'] }); }} className="btn btn-primary">+ Add Category</button>
      </div>
      
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Items</th>
              <th>Channels</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => handleMove(cat.id, 'up')} className="btn btn-ghost btn-sm">↑</button>
                    <button onClick={() => handleMove(cat.id, 'down')} className="btn btn-ghost btn-sm">↓</button>
                  </div>
                </td>
                <td>
                  <div className="font-bold">{cat.name}</div>
                  {cat.description && <div className="text-xs text-neutral-500">{cat.description}</div>}
                </td>
                <td>{getItemsByCategory(cat.id).length}</td>
                <td>
                  <div className="flex gap-1">
                    {cat.channelsEnabled.map(ch => (
                      <span key={ch} className="tag bg-neutral-700">{channelConfig[ch].icon}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(cat.id); setEditForm(cat); }} className="btn btn-ghost btn-sm">Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-sm text-red-400">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingId === 'new' ? 'Add Category' : 'Edit Category'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Channels</label>
                <div className="flex gap-2">
                  {(['web', 'app', 'qr'] as Channel[]).map(ch => (
                    <button
                      key={ch}
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-2 rounded-lg text-sm ${editForm.channelsEnabled?.includes(ch) ? 'bg-[#ed7424] text-white' : 'bg-neutral-700'}`}
                    >
                      {channelConfig[ch].icon} {channelConfig[ch].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingId(null)} className="btn btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary flex-1">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
