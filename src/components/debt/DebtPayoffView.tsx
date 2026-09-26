import React, { useState, useMemo } from 'react';
import type { Account } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { simulatePayoff, type DebtLine } from '../../lib/debt';
import {
  Zap,
  TrendingDown,
  Calendar,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Award
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DebtPayoffViewProps {
  accounts: Account[];
  onUpdateAccount?: (id: string, updates: Partial<Account>) => Promise<void>;
}

export const DebtPayoffView: React.FC<DebtPayoffViewProps> = ({ accounts }) => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  // Strategy selection
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

  // Debts state: initialized from liability accounts and persisted in local state
  const [debts, setDebts] = useState<DebtLine[]>(() => {
    // Collect active liability accounts
    const liabilityAccounts = accounts.filter(a => !a.isArchived && (a.type === 'credit' || a.balance < 0));
    
    if (liabilityAccounts.length > 0) {
      return liabilityAccounts.map(a => ({
        id: a.id,
        name: a.name,
        balance: Math.abs(a.balance) || 25000,
        annualRatePct: a.type === 'credit' ? 42 : 14,
        minimumPayment: Math.max(500, Math.round((Math.abs(a.balance) || 25000) * 0.05))
      }));
    }

    // Default starter template debts if no credit cards exist yet
    return [
      { id: 'debt-cc', name: 'Credit Card Outstanding', balance: 45000, annualRatePct: 42, minimumPayment: 2500 },
      { id: 'debt-loan', name: 'Personal Loan', balance: 180000, annualRatePct: 14, minimumPayment: 6000 }
    ];
  });

  // Calculate default monthly budget (sum of minimums + 20% surplus)
  const totalMinPayments = useMemo(() => debts.reduce((sum, d) => sum + d.minimumPayment, 0), [debts]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => Math.max(12000, totalMinPayments + 3000));

  // Run both simulations for direct comparison
  const avalancheResult = useMemo(() => simulatePayoff(debts, monthlyBudget, 'avalanche'), [debts, monthlyBudget]);
  const snowballResult = useMemo(() => simulatePayoff(debts, monthlyBudget, 'snowball'), [debts, monthlyBudget]);

  const activeResult = strategy === 'avalanche' ? avalancheResult : snowballResult;

  // Comparison metrics between Avalanche and Snowball
  const comparison = useMemo(() => {
    if (avalancheResult.success && snowballResult.success) {
      const interestSaved = Math.max(0, snowballResult.plan.totalInterest - avalancheResult.plan.totalInterest);
      const monthsDiff = snowballResult.plan.months - avalancheResult.plan.months;
      return {
        interestSaved,
        monthsDiff,
        avalancheInterest: avalancheResult.plan.totalInterest,
        snowballInterest: snowballResult.plan.totalInterest,
        avalancheMonths: avalancheResult.plan.months,
        snowballMonths: snowballResult.plan.months
      };
    }
    return null;
  }, [avalancheResult, snowballResult]);

  // Debt management helpers
  const handleUpdateDebt = (id: string, field: keyof DebtLine, value: number) => {
    setDebts(prev => prev.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleAddDebt = () => {
    const newDebt: DebtLine = {
      id: `debt-${Date.now()}`,
      name: 'New Debt / Card',
      balance: 30000,
      annualRatePct: 18,
      minimumPayment: 1500
    };
    setDebts(prev => [...prev, newDebt]);
  };

  const handleDeleteDebt = (id: string) => {
    if (window.confirm('Remove this debt from the payoff plan?')) {
      setDebts(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-rose-light)' }}>
                Debt Elimination Strategy
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Debt Payoff Planner
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0', maxWidth: '640px' }}>
              Simulate exact mathematical amortization schedules to extinguish credit card dues and high-interest loans with maximum velocity.
            </p>
          </div>

          {/* Strategy Toggle Tabs */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => setStrategy('avalanche')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: strategy === 'avalanche' ? 'var(--accent-emerald)' : 'transparent',
                color: strategy === 'avalanche' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              ⚡ Debt Avalanche (Save Max Interest)
            </button>
            <button
              type="button"
              onClick={() => setStrategy('snowball')}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: strategy === 'snowball' ? 'var(--accent-emerald)' : 'transparent',
                color: strategy === 'snowball' ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              🎯 Debt Snowball (Quick Wins First)
            </button>
          </div>
        </div>

        {/* Strategy Explainer Bar */}
        <div
          style={{
            marginTop: '18px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {strategy === 'avalanche' ? (
            <>
              <Zap size={16} color="var(--accent-emerald-light)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Avalanche Strategy:</strong> Directs all extra money toward the debt with the highest APR interest rate (e.g. 42% credit cards). Mathematically saves the most money.
              </span>
            </>
          ) : (
            <>
              <Sparkles size={16} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
              <span>
                <strong>Snowball Strategy:</strong> Directs all extra money toward the smallest loan balance first. Eliminates accounts quickly to build psychological momentum.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Left Column: Debt Roster & Budget Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Monthly Budget Controller */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Total Monthly Repayment Budget
              </label>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                {formatAmount(monthlyBudget, isPrivacyMasked)} / mo
              </span>
            </div>

            <input
              type="range"
              min={Math.max(1000, totalMinPayments)}
              max={Math.max(50000, totalMinPayments * 3)}
              step="500"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>Minimum Required: {formatAmount(totalMinPayments, isPrivacyMasked)}</span>
              <span>Accelerated: {formatAmount(Math.max(50000, totalMinPayments * 3), isPrivacyMasked)}</span>
            </div>

            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {[
                { label: 'Minimums Only', val: totalMinPayments },
                { label: '+₹2,500 Extra', val: totalMinPayments + 2500 },
                { label: '+₹5,000 Extra', val: totalMinPayments + 5000 },
                { label: '+₹10,000 Aggressive', val: totalMinPayments + 10000 }
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="btn-secondary"
                  onClick={() => setMonthlyBudget(p.val)}
                  style={{ fontSize: '11px', padding: '4px 8px' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Debts Table / Cards */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Active Debts & Liabilities</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Enter balances, annual interest APRs, and minimum payments
                </span>
              </div>
              <button type="button" className="btn-secondary" onClick={handleAddDebt} style={{ fontSize: '12px', padding: '6px 10px' }}>
                <Plus size={14} />
                <span>Add Debt</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {debts.map((debt, idx) => (
                <div
                  key={debt.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: 'var(--accent-rose-light)',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={e => setDebts(prev => prev.map(d => d.id === debt.id ? { ...d, name: e.target.value } : d))}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '13.5px' }}
                      />
                    </div>
                    {debts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDebt(debt.id)}
                        className="btn-icon"
                        style={{ width: '26px', height: '26px', color: 'var(--text-faint)' }}
                        title="Remove debt"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                        Balance ({symbol})
                      </label>
                      <input
                        type="number"
                        step="500"
                        className="form-input font-mono"
                        value={debt.balance}
                        onChange={e => handleUpdateDebt(debt.id, 'balance', Math.max(0, Number(e.target.value)))}
                        style={{ height: '32px', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                        Annual APR (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-input font-mono"
                        value={debt.annualRatePct}
                        onChange={e => handleUpdateDebt(debt.id, 'annualRatePct', Math.max(0, Number(e.target.value)))}
                        style={{ height: '32px', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                        Min Payment ({symbol})
                      </label>
                      <input
                        type="number"
                        step="100"
                        className="form-input font-mono"
                        value={debt.minimumPayment}
                        onChange={e => handleUpdateDebt(debt.id, 'minimumPayment', Math.max(0, Number(e.target.value)))}
                        style={{ height: '32px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Outcomes, Comparison & Amortization Curve */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key Metric Headline Cards */}
          {activeResult.success ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                
                {/* Debt Free Date */}
                <div className="glass-panel" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-emerald-light)' }}>
                    <Calendar size={16} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Debt-Free Horizon</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activeResult.plan.months} Months
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Estimated completion: {new Date(activeResult.plan.payoffDateISO).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                {/* Total Interest Cost */}
                <div className="glass-panel" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-rose-light)' }}>
                    <TrendingDown size={16} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Total Interest Cost</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-rose-light)' }}>
                    {formatAmount(activeResult.plan.totalInterest, isPrivacyMasked)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Total repayment: {formatAmount(activeResult.plan.totalPaid, isPrivacyMasked)}
                  </div>
                </div>

              </div>

              {/* Head-to-Head Strategy Comparison Banner */}
              {comparison && (
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Award size={20} color="var(--accent-emerald-light)" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                    {comparison.interestSaved > 10 ? (
                      <span>
                        <strong>Strategy Verdict:</strong> Avalanche saves you{' '}
                        <strong style={{ color: 'var(--accent-emerald-light)' }}>
                          {formatAmount(comparison.interestSaved, isPrivacyMasked)}
                        </strong>{' '}
                        in interest over Snowball while clearing all debt at the same time.
                      </span>
                    ) : (
                      <span>
                        <strong>Strategy Verdict:</strong> Both strategies produce very similar interest outcomes on these balances. Pick <strong>Snowball</strong> for fastest behavioral motivation!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Trajectory Amortization Chart */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                    Debt Balance Payoff Trajectory
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--accent-emerald-light)', fontWeight: 600 }}>
                    Zero Balance at Month {activeResult.plan.months}
                  </span>
                </div>

                <div style={{ height: '220px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activeResult.plan.schedule.filter((_, i) => i === 0 || (i + 1) % 2 === 0 || i === activeResult.plan.schedule.length - 1)}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={m => `M${m}`} />
                      <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`} />
                      <Tooltip
                        contentStyle={{ background: '#121827', border: '1px solid #1e293b', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val: any) => [formatAmount(Number(val) || 0, isPrivacyMasked), 'Remaining Debt']}
                        labelFormatter={m => `Month ${m}`}
                      />
                      <Area type="monotone" dataKey="totalBalance" stroke="#f43f5e" strokeWidth={2.5} fill="url(#debtGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div
              className="glass-panel"
              style={{
                padding: '32px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <AlertCircle size={32} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Budget Below Minimum Payment Requirement
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, maxWidth: '400px' }}>
                Your current monthly budget is short by{' '}
                <strong style={{ color: 'var(--accent-rose-light)' }}>
                  {formatAmount((activeResult as any).shortfall || 0, isPrivacyMasked)}
                </strong>{' '}
                to meet the minimum required payments across all debts. Increase your budget slider to at least{' '}
                <strong>{formatAmount(totalMinPayments, isPrivacyMasked)}</strong>.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
