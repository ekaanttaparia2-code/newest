import React, { useState } from 'react';
import type { GroupBudgetSummary } from '../../hooks/useBudgets';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { soundFx } from '../../lib/soundFx';
import { ShieldCheck, Sparkles, TrendingUp, Check, X } from 'lucide-react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface EnvelopeSummaryProps {
  groupSummary: GroupBudgetSummary;
  monthlyIncome: number;
  onApplySalaryPlan: (salary: number) => Promise<void>;
}

export const EnvelopeSummary: React.FC<EnvelopeSummaryProps> = ({
  groupSummary,
  monthlyIncome,
  onApplySalaryPlan
}) => {
  const { formatAmount, symbol } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [inputSalary, setInputSalary] = useState<string>(() => (monthlyIncome > 0 ? String(monthlyIncome) : '50000'));
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useModalAccessibility(isWizardOpen, () => setIsWizardOpen(false));

  const parsedSalary = parseFloat(inputSalary) || 0;
  const targetNeeds = Math.round(parsedSalary * 0.50);
  const targetWants = Math.round(parsedSalary * 0.30);
  const targetSavings = Math.round(parsedSalary * 0.20);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSalary <= 0) return;
    setIsApplying(true);
    soundFx.playCashChime();
    await onApplySalaryPlan(parsedSalary);
    setIsApplying(false);
    setIsWizardOpen(false);
  };

  const envelopes = [
    {
      id: 'needs',
      title: 'Must-Pay (Needs)',
      rule: '50% Rule',
      desc: 'Housing, Groceries, Utilities, Transport & Health',
      color: '#3b82f6',
      data: groupSummary.needs,
      icon: <ShieldCheck size={18} color="#3b82f6" />
    },
    {
      id: 'wants',
      title: 'Nice-to-Have (Wants)',
      rule: '30% Rule',
      desc: 'Dining out, Shopping, Entertainment & Tech',
      color: '#ec4899',
      data: groupSummary.wants,
      icon: <Sparkles size={18} color="#ec4899" />
    },
    {
      id: 'savings',
      title: 'Put Away (Savings)',
      rule: '20% Rule',
      desc: 'SIPs, Investments, Mutual Funds & Emergency Vault',
      color: '#10b981',
      data: groupSummary.savings,
      icon: <TrendingUp size={18} color="#10b981" />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
      
      {/* Header bar with 1-click wizard button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            50-30-20 Envelope Allocation
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Gold-standard budgeting: 50% Essentials • 30% Lifestyle • 20% Compounding
          </span>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setIsWizardOpen(true)}
          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles size={14} color="var(--accent-emerald-light)" />
          <span>Set Plan from Salary</span>
        </button>
      </div>

      {/* 3 Envelope Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {envelopes.map(env => {
          const pct = Math.min(100, Math.round(env.data.percentage));
          const isOver = env.data.spent > env.data.limit && env.data.limit > 0;
          const barColor = isOver
            ? 'var(--accent-rose)'
            : env.data.percentage >= 80
            ? 'var(--accent-amber)'
            : env.color;

          return (
            <div
              key={env.id}
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderTop: `3px solid ${env.color}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {env.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {env.title}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {env.rule} • {env.desc.split(',')[0]}
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '999px',
                    background: isOver ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                    color: isOver ? 'var(--accent-rose-light)' : 'var(--text-secondary)'
                  }}
                >
                  {Math.round(env.data.percentage)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: barColor,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {/* Spent vs Planned Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Spent: <strong style={{ color: 'var(--text-primary)' }}>{formatAmount(env.data.spent, isPrivacyMasked)}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Cap: <strong style={{ color: 'var(--text-primary)' }}>{formatAmount(env.data.limit, isPrivacyMasked)}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Salary Wizard Modal */}
      {isWizardOpen && (
        <div className="modal-overlay" onClick={() => setIsWizardOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-emerald)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  50-30-20 Salary Planner
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setIsWizardOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApply} style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Enter your take-home monthly salary. PocketTrack will automatically calculate and assign optimal budget limits across all your categories.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">Monthly Take-Home Salary ({symbol})</label>
                <input
                  type="number"
                  step="1000"
                  className="form-input font-mono"
                  placeholder="50000"
                  value={inputSalary}
                  onChange={e => setInputSalary(e.target.value)}
                  style={{ fontSize: '17px', fontWeight: 700 }}
                  required
                />
              </div>

              {/* Live Distribution Preview */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12.5px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#3b82f6' }}>
                  <span>50% Needs (Rent, Kirana, Bills, Cab):</span>
                  <strong className="font-mono">{formatAmount(targetNeeds, isPrivacyMasked)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ec4899' }}>
                  <span>30% Wants (Dining, Shopping, OTT):</span>
                  <strong className="font-mono">{formatAmount(targetWants, isPrivacyMasked)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>20% Savings (Mutual Funds, SIP):</span>
                  <strong className="font-mono">{formatAmount(targetSavings, isPrivacyMasked)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsWizardOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isApplying}>
                  <Check size={16} />
                  <span>Apply Category Limits</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
