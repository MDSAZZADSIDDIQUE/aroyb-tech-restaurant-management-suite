'use client';

import { useState, useEffect } from 'react';
import faqData from '@/data/faq-kb.json';
import { FAQEntry } from '@/types';
import { getCustomFAQs, addCustomFAQ, removeCustomFAQ } from '@/lib/chatbot-retrieval';

export default function AdminFAQPage() {
  const [staticFAQs] = useState<FAQEntry[]>(faqData.entries as FAQEntry[]);
  const [customFAQs, setCustomFAQs] = useState<FAQEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState('');
  const [newFAQ, setNewFAQ] = useState({
    question: '',
    answer: '',
    category: 'general',
    keywords: '',
  });

  useEffect(() => {
    setCustomFAQs(getCustomFAQs());
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    const faqEntry: FAQEntry = {
      id: `custom-${Date.now()}`,
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category,
      keywords: newFAQ.keywords.split(',').map(k => k.trim()).filter(Boolean),
    };

    addCustomFAQ(faqEntry);
    setCustomFAQs(getCustomFAQs());
    setNewFAQ({ question: '', answer: '', category: 'general', keywords: '' });
    setShowAddForm(false);
    setShowSuccess('FAQ added successfully!');
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleRemove = (id: string) => {
    removeCustomFAQ(id);
    setCustomFAQs(getCustomFAQs());
  };

  const categories = ['general', 'delivery', 'menu', 'allergens', 'hours', 'payment', 'catering'];

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-neutral-900">FAQ Editor</h1>
          <p className="text-neutral-600 mt-2">
            Manage your chatbot&apos;s knowledge base
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary"
        >
          + Add FAQ
        </button>
      </div>

      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ {showSuccess}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-primary-600">{staticFAQs.length}</span>
          <span className="text-neutral-600 ml-2">built-in FAQs</span>
        </div>
        <div className="bg-white rounded-lg px-4 py-3 shadow-soft">
          <span className="text-2xl font-bold text-secondary-600">{customFAQs.length}</span>
          <span className="text-neutral-600 ml-2">custom FAQs</span>
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Add New FAQ</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  className="input-field"
                  placeholder="What is your question?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="The answer to the question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={newFAQ.category}
                  onChange={(e) => setNewFAQ({ ...newFAQ, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={newFAQ.keywords}
                  onChange={(e) => setNewFAQ({ ...newFAQ, keywords: e.target.value })}
                  className="input-field"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Add FAQ
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom FAQs */}
      {customFAQs.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <span className="text-secondary-500">✏️</span>
            Custom FAQs
          </h2>
          <div className="bg-white rounded-xl shadow-soft overflow-hidden">
            <div className="divide-y divide-neutral-100">
              {customFAQs.map((faq) => (
                <div key={faq.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-secondary text-xs capitalize">{faq.category}</span>
                      </div>
                      <h3 className="font-medium text-neutral-900 mb-1">{faq.question}</h3>
                      <p className="text-sm text-neutral-600">{faq.answer}</p>
                      {faq.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {faq.keywords.map((kw, idx) => (
                            <span key={idx} className="text-xs text-neutral-400">#{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(faq.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Built-in FAQs */}
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
          <span>📚</span>
          Built-in FAQs
        </h2>
        
        {/* Group by category */}
        {categories.map((category) => {
          const categoryFAQs = staticFAQs.filter(f => f.category === category);
          if (categoryFAQs.length === 0) return null;

          return (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                {category} ({categoryFAQs.length})
              </h3>
              <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                <div className="divide-y divide-neutral-100">
                  {categoryFAQs.map((faq) => (
                    <details key={faq.id} className="group">
                      <summary className="px-4 py-3 cursor-pointer hover:bg-neutral-50 flex items-center justify-between">
                        <span className="font-medium text-neutral-900">{faq.question}</span>
                        <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100">
                        <p className="text-neutral-600">{faq.answer}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {faq.keywords.map((kw, idx) => (
                            <span key={idx} className="text-xs text-neutral-400">#{kw}</span>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-900">How the FAQ Chatbot Works</h4>
            <p className="text-sm text-blue-800 mt-1">
              The chatbot uses keyword matching and similarity scoring to find the best answers 
              to customer questions. Custom FAQs are prioritized over built-in ones. Add keywords 
              to improve matching accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
