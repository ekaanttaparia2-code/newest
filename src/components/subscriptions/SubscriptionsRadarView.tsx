import React, { useState } from 'react';
import { Plus, Trash2, Zap, Film, Music, Dumbbell, Wifi, Sparkles, X, Check } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { soundFx } from '../../lib/soundFx';

interface SubItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
  billingDay: number; // day of month
  billingMonth?: number; // 0-11 for yearly renewals
  category: string;
  color: string;
  icon: string;
  isActive: boolean;
}

export const SubscriptionsRadarView: React.FC = () => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  const [subscriptions, setSubscriptions] = useState<SubItem[]>(() => {
    const saved = localStorage.getItem('pockettrack_subscriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* ignore */
      }
    }
    // Clean start by default
    return [];
  });

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [subName, setSubName] = useState<string>('');
  const [subAmount, setSubAmount] = useState<string>('');
  const [subDay, setSubDay] = useState<string>('5');
  const [subMonth, setSubMonth] = useState<number>(() => new Date().getMonth());
  const [subFreq, setSubFreq] = useState<'monthly' | 'yearly'>('monthly');

  useModalAccessibility(isAddOpen, () => setIsAddOpen(false));

  const now = new Date();
  const todayDate = now.getDate();

  const getDaysUntilDue = (sub: SubItem) => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (sub.frequency === 'yearly') {
      const bMonth = sub.billingMonth !== undefined ? sub.billingMonth : now.getMonth();
      let nextDue = new Date(now.getFullYear(), bMonth, sub.billingDay);
      if (nextDue < today) {
        nextDue = new Date(now.getFullYear() + 1, bMonth, sub.billingDay);
      }
      const diffTime = nextDue.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    // Monthly
    if (sub.billingDay >= todayDate) {
      return sub.billingDay - todayDate;
    }
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return daysInCurrentMonth - todayDate + sub.billingDay;
  };

  const monthlyBurn = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + (s.frequency === 'yearly' ? s.amount / 12 : s.amount), 0);

  const yearlyBurn = monthlyBurn * 12;

  const toggleActive = (id: string) => {
    soundFx.playPop();
    const updated = subscriptions.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    setSubscriptions(updated);
    localStorage.setItem('pockettrack_subscriptions', JSON.stringify(updated));
  };

  const handleDeleteSub = (id: string) => {
    if (window.confirm('Are you sure you want to remove this recurring subscription?')) {
      soundFx.playPop();
      const updated = subscriptions.filter(s => s.id !== id);
      setSubscriptions(updated);
      localStorage.setItem('pockettrack_subscriptions', JSON.stringify(updated));
    }
  };

  const handleCreateTemplate = (template: { name: string; amount: number; frequency: 'monthly' | 'yearly'; billingDay: number; category: string; color: string; icon: string }) => {
    soundFx.playCashChime();
    const newSub: SubItem = {
      id: `sub-${Date.now()}`,
      name: template.name,
      amount: template.amount,
      frequency: template.frequency,
      billingDay: template.billingDay,
      category: template.category,
      color: template.color,
      icon: template.icon,
      isActive: true
    };
    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    localStorage.setItem('pockettrack_subscriptions', JSON.stringify(updated));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(subAmount);
    if (!subName.trim() || isNaN(amount) || amount <= 0) return;

    const newSub: SubItem = {
      id: `sub-${Date.now()}`,
      name: subName.trim(),
      amount,
      frequency: subFreq,
      billingDay: parseInt(subDay, 10) || 1,
      billingMonth: subFreq === 'yearly' ? subMonth : undefined,
      category: 'Subscription',
      color: '#38bdf8',
      icon: 'Zap',
      isActive: true
    };

    const updated = [...subscriptions, newSub];
    setSubscriptions(updated);
    localStorage.setItem('pockettrack_subscriptions', JSON.stringify(updated));
    setSubName('');
    setSubAmount('');
    setIsAddOpen(false);
  };

  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'Film': return <Film size={18} />;
      case 'Music': return <Music size={18} />;
      case 'Dumbbell': return <Dumbbell size={18} />;
      case 'Wifi': return <Wifi size={18} />;
      default: return <Zap size={18} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Subscriptions & Recurring Radar
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Detect quiet monthly leakage, OTT bills, and renewal timelines
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span>Track Subscription</span>
        </button>
      </div>

      {/* Burn Rate Stat Cards (only shown if subscriptions exist) */}
      {subscriptions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Monthly Subscription Burn
            </span>
            <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-rose-light)', marginTop: '4px' }}>
              {formatAmount(Math.round(monthlyBurn), isPrivacyMasked)}/mo
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Annual Recurring Cost
            </span>
            <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {formatAmount(Math.round(yearlyBurn), isPrivacyMasked)}/yr
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Active Services
            </span>
            <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {subscriptions.filter(s => s.isActive).length} / {subscriptions.length} Services
            </div>
          </div>
        </div>
      )}

      {/* Empty State with Quick Starter Presets */}
      {subscriptions.length === 0 && (
        <div className="glass-panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Recurring Subscriptions Tracked Yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Never get surprised by auto-debits again. Add your recurring OTT, broadband, or gym memberships to monitor renewal alerts.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'Netflix Premium 4K', amount: 649, frequency: 'monthly', billingDay: 5, category: 'OTT', color: '#f43f5e', icon: 'Film' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Film size={14} color="#f43f5e" />
              <span>+ Netflix ({symbol}649/mo)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'JioFiber / Airtel Broadband', amount: 999, frequency: 'monthly', billingDay: 12, category: 'Wifi', color: '#06b6d4', icon: 'Wifi' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Wifi size={14} color="#06b6d4" />
              <span>+ Wifi Broadband ({symbol}999/mo)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'Spotify Duo / Family', amount: 149, frequency: 'monthly', billingDay: 18, category: 'Music', color: '#10b981', icon: 'Music' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Music size={14} color="#10b981" />
              <span>+ Spotify ({symbol}149/mo)</span>
            </button>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      {subscriptions.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {subscriptions.map(sub => {
            const daysDue = getDaysUntilDue(sub);
            const isDueSoon = daysDue <= 3 && sub.isActive;

            return (
              <div
                key={sub.id}
                className="glass-panel interactive-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: sub.isActive ? 1 : 0.6
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: `${sub.color}22`,
                          color: sub.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {renderIcon(sub.icon)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{sub.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {sub.frequency === 'yearly'
                            ? `Renews yearly on ${sub.billingDay} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][sub.billingMonth ?? now.getMonth()]}`
                            : `Renews on day ${sub.billingDay} of month`}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isDueSoon ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isDueSoon ? 'var(--accent-rose-light)' : 'var(--text-secondary)',
                          fontWeight: 600
                        }}
                      >
                        {daysDue === 0 ? 'Due Today!' : `Renews in ${daysDue}d`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSub(sub.id)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px', color: 'var(--text-faint)' }}
                        title="Delete subscription"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Cost</span>
                      <span className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatAmount(sub.amount, isPrivacyMasked)}
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          /{sub.frequency === 'yearly' ? 'yr' : 'mo'}
                        </span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleActive(sub.id)}
                      className="btn-secondary"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                    >
                      {sub.isActive ? 'Active · Pause' : 'Paused · Resume'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subscription Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="sheet-notch" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Track New Subscription</h3>
              <button className="btn-icon" onClick={() => setIsAddOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdd} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Service / Platform Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Netflix, ChatGPT Plus, Gym"
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Cost ({symbol})</label>
                  <input
                    type="number"
                    step="1"
                    className="form-input font-mono"
                    placeholder="649"
                    value={subAmount}
                    onChange={e => setSubAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Billing Cadence</label>
                  <select
                    className="form-select"
                    value={subFreq}
                    onChange={e => setSubFreq(e.target.value as any)}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly / Annual</option>
                  </select>
                </div>
              </div>

              {subFreq === 'yearly' && (
                <div style={{ marginBottom: '14px' }}>
                  <label className="form-label">Annual Renewal Month</label>
                  <select
                    className="form-select"
                    value={subMonth}
                    onChange={e => setSubMonth(Number(e.target.value))}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Billing Day of Month (1 - 31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-input font-mono"
                  value={subDay}
                  onChange={e => setSubDay(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
