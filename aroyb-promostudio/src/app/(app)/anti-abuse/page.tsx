'use client';

import { useEffect, useState } from 'react';
import { getAbuseLogs, getAntiAbuseRules, saveAntiAbuseRules, getAllowlist, saveAllowlist } from '@/lib/storage';
import { formatDateTime, formatCurrency } from '@/lib/formatting';
import type { AttemptLog, AntiAbuseRule, AllowlistEntry } from '@/types';

export default function AntiAbusePage() {
  const [logs, setLogs] = useState<AttemptLog[]>([]);
  const [rules, setRules] = useState<AntiAbuseRule[]>([]);
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLogs(getAbuseLogs());
    setRules(getAntiAbuseRules());
    setAllowlist(getAllowlist());
    setLoading(false);
  }, []);
  
  const toggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    saveAntiAbuseRules(updated);
    setRules(updated);
  };
  
  const blockedCount = logs.filter(l => l.actionTaken === 'blocked').length;
  const flaggedCount = logs.filter(l => l.actionTaken === 'flagged').length;
  
  if (loading) {
    return <div className="p-6 flex items-center justify-center min-h-screen"><div className="w-12 h-12 border-4 border-[#ed7424] border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Anti-Abuse Controls</h1>
          <p className="text-neutral-400 text-sm">Fraud detection and usage limits</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card"><div className="stat-value text-red-400">{blockedCount}</div><div className="stat-label">Blocked Attempts</div></div>
        <div className="stat-card"><div className="stat-value text-amber-400">{flaggedCount}</div><div className="stat-label">Flagged for Review</div></div>
        <div className="stat-card"><div className="stat-value">{rules.filter(r => r.enabled).length}</div><div className="stat-label">Active Rules</div></div>
        <div className="stat-card"><div className="stat-value">{allowlist.length}</div><div className="stat-label">Allowlist Entries</div></div>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab('logs')} className={`tab ${activeTab === 'logs' ? 'active' : ''}`}>Attempt Logs</button>
        <button onClick={() => setActiveTab('rules')} className={`tab ${activeTab === 'rules' ? 'active' : ''}`}>Rules</button>
        <button onClick={() => setActiveTab('allowlist')} className={`tab ${activeTab === 'allowlist' ? 'active' : ''}`}>Allowlist</button>
      </div>
      
      {activeTab === 'logs' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Promo</th>
                <th>Reason</th>
                <th>Customer</th>
                <th>Basket</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 30).map(log => (
                <tr key={log.id}>
                  <td className="text-sm text-neutral-400">{formatDateTime(log.timestamp)}</td>
                  <td>
                    {log.promoCode ? <code className="text-[#ed7424]">{log.promoCode}</code> : <span className="text-neutral-500">N/A</span>}
                  </td>
                  <td className="text-sm max-w-xs truncate">{log.reason}</td>
                  <td className="text-sm">{log.customerId || <span className="text-neutral-500">Anonymous</span>}</td>
                  <td className="text-sm">{log.basketValue ? formatCurrency(log.basketValue) : '-'}</td>
                  <td>
                    <span className={`badge ${log.actionTaken === 'blocked' ? 'bg-red-500/20 text-red-400' : log.actionTaken === 'flagged' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                      {log.actionTaken}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {activeTab === 'rules' && (
        <div className="card">
          <div className="space-y-4">
            {rules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-800">
                <div className="flex-1">
                  <div className="font-medium">{rule.name}</div>
                  <div className="text-sm text-neutral-400">{rule.description}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="tag">Threshold: {rule.threshold}</span>
                    <span className="tag">Action: {rule.action}</span>
                  </div>
                </div>
                <button onClick={() => toggleRule(rule.id)} className={`toggle ${rule.enabled ? 'active' : ''}`}></button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'allowlist' && (
        <div className="card">
          {allowlist.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">✅</span>
              <p>No allowlist entries</p>
              <p className="text-sm text-neutral-500">Add trusted customers or devices here</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Type</th><th>Value</th><th>Added</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {allowlist.map(entry => (
                  <tr key={entry.id}>
                    <td><span className="tag">{entry.type}</span></td>
                    <td><code>{entry.value}</code></td>
                    <td>{formatDateTime(entry.addedAt)}</td>
                    <td>{entry.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
