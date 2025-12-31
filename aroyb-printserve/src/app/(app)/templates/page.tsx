'use client';

import { useEffect, useState } from 'react';
import { getTemplateByBranch, updateTemplate, getActiveBranchId, getActiveBranch, getOrders } from '@/lib/storage';
import ReceiptPreview from '@/components/print/ReceiptPreview';
import DocketPreview from '@/components/print/DocketPreview';
import LabelPreview from '@/components/print/LabelPreview';
import type { Template, Branch, Order } from '@/types';

export default function TemplatesPage() {
  const [template, setTemplate] = useState<Template | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [sampleOrder, setSampleOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'receipt' | 'docket' | 'labels'>('receipt');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const branchId = getActiveBranchId();
    setTemplate(getTemplateByBranch(branchId) || null);
    setBranch(getActiveBranch() || null);
    setSampleOrder(getOrders()[0] || null);
    setLoading(false);
  }, []);
  
  const handleSave = () => {
    if (!template) return;
    updateTemplate(template.branchId, template);
    alert('Template saved!');
  };
  
  const updateReceiptTemplate = (updates: Partial<Template['receipt']>) => {
    if (!template) return;
    setTemplate({ ...template, receipt: { ...template.receipt, ...updates } });
  };
  
  const updateDocketTemplate = (updates: Partial<Template['docket']>) => {
    if (!template) return;
    setTemplate({ ...template, docket: { ...template.docket, ...updates } });
  };
  
  const updateLabelTemplate = (updates: Partial<Template['labels']>) => {
    if (!template) return;
    setTemplate({ ...template, labels: { ...template.labels, ...updates } });
  };
  
  if (loading || !template || !branch || !sampleOrder) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Print Templates</h1>
        <button onClick={handleSave} className="btn btn-primary">💾 Save Changes</button>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['receipt', 'docket', 'labels'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === tab ? 'bg-[#ed7424] text-white' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Settings</h2>
          
          {activeTab === 'receipt' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Header Lines</label>
                {template.receipt.headerLines.map((line, i) => (
                  <input
                    key={i}
                    type="text"
                    value={line}
                    onChange={(e) => {
                      const newLines = [...template.receipt.headerLines];
                      newLines[i] = e.target.value;
                      updateReceiptTemplate({ headerLines: newLines });
                    }}
                    className="input mb-2"
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Footer Text</label>
                <textarea
                  value={template.receipt.footerText}
                  onChange={(e) => updateReceiptTemplate({ footerText: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show VAT Number</span>
                <input
                  type="checkbox"
                  checked={template.receipt.showVat}
                  onChange={(e) => updateReceiptTemplate({ showVat: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Scale: {template.receipt.fontScale}</label>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.1"
                  value={template.receipt.fontScale}
                  onChange={(e) => updateReceiptTemplate({ fontScale: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          {activeTab === 'docket' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Group by Station</span>
                <input
                  type="checkbox"
                  checked={template.docket.groupByStation}
                  onChange={(e) => updateDocketTemplate({ groupByStation: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Notes at Top</span>
                <input
                  type="checkbox"
                  checked={template.docket.showNotesTop}
                  onChange={(e) => updateDocketTemplate({ showNotesTop: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Allergen Banner</span>
                <input
                  type="checkbox"
                  checked={template.docket.showAllergenBanner}
                  onChange={(e) => updateDocketTemplate({ showAllergenBanner: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Copy Count: {template.docket.copyCount}</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={template.docket.copyCount}
                  onChange={(e) => updateDocketTemplate({ copyCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <select
                  value={template.docket.fontSize}
                  onChange={(e) => updateDocketTemplate({ fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                  className="input"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          )}
          
          {activeTab === 'labels' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Label Size</label>
                <select
                  value={template.labels.sizePreset}
                  onChange={(e) => updateLabelTemplate({ sizePreset: e.target.value as 'small' | 'medium' | 'large' })}
                  className="input"
                >
                  <option value="small">Small (3 per row)</option>
                  <option value="medium">Medium (2 per row)</option>
                  <option value="large">Large (1 per row)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span>Show Checklist</span>
                <input
                  type="checkbox"
                  checked={template.labels.showChecklist}
                  onChange={(e) => updateLabelTemplate({ showChecklist: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Handling Icons</span>
                <input
                  type="checkbox"
                  checked={template.labels.showIcons}
                  onChange={(e) => updateLabelTemplate({ showIcons: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Show Allergen Warning</span>
                <input
                  type="checkbox"
                  checked={template.labels.showAllergenWarning}
                  onChange={(e) => updateLabelTemplate({ showAllergenWarning: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Preview */}
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Live Preview</h2>
          <div className="bg-neutral-900 p-4 rounded-lg flex justify-center overflow-auto max-h-[600px]">
            {activeTab === 'receipt' && (
              <ReceiptPreview order={sampleOrder} branch={branch} template={template.receipt} />
            )}
            {activeTab === 'docket' && (
              <DocketPreview order={sampleOrder} template={template.docket} />
            )}
            {activeTab === 'labels' && (
              <LabelPreview order={sampleOrder} template={template.labels} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
