import React, { useState, useMemo } from 'react';
import type { Account, Transaction } from '../../db/types';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { calculateFire, type FireResult } from '../../lib/fire';
import {
  Flame,
  ShieldCheck,
  TrendingUp,
  Sliders,
  Info,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface FireRunwayViewProps {
  accounts: Account[];
  transactions: Transaction[];
  monthlyIncome?: number;
}

export const FireRunwayView: React.FC<FireRunwayViewProps> = ({
  accounts,
  transactions,
  monthlyIncome: propMonthlyIncome
}) => {
  const { formatAmount, symbol } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  // 1. Compute liquid assets and investments from accounts
  const { liquidAssets, investments } = useMemo(() => {
    let liquid = 0;
    let inv = 0;
    accounts.forEach(acc => {
      const bal = acc.balance;
      if (acc.type === 'cash' || acc.type === 'savings') {
        liquid += Math.max(0, bal);
      } else if (acc.type === 'investment') {
        inv += Math.max(0, bal);
      }
    });
    return { liquidAssets: liquid, investments: inv };
  }, [accounts]);

  // 2. Compute monthly burn rate and income from recent 30-day transactions
  const { derivedMonthlyBurn, derivedMonthlyIncome } = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let expenseTotal = 0;
    let incomeTotal = 0;

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      if (txDate >= thirtyDaysAgo) {
        if (t.type === 'expense') {
          expenseTotal += t.amount;
        } else if (t.type === 'income') {
          incomeTotal += t.amount;
        }
      }
    });

    return {
      derivedMonthlyBurn: expenseTotal > 0 ? expenseTotal : 35000,
      derivedMonthlyIncome: (propMonthlyIncome && propMonthlyIncome > 0)
        ? propMonthlyIncome
        : (incomeTotal > 0 ? incomeTotal : 75000)
    };
  }, [transactions, propMonthlyIncome]);

  // 3. User adjustable levers
  const [customBurn, setCustomBurn] = useState<number>(derivedMonthlyBurn);
  const [customIncome, setCustomIncome] = useState<number>(derivedMonthlyIncome);
  const [swrPct, setSwrPct] = useState<number>(4.0);
  const [returnRatePct, setReturnRatePct] = useState<number>(11.0);
  const [inflationPct, setInflationPct] = useState<number>(6.0);
  const [selectedMilestone, setSelectedMilestone] = useState<'lean' | 'standard' | 'fat'>('standard');

  // Sync if derived values change initially
  React.useEffect(() => {
    if (customBurn === 35000 && derivedMonthlyBurn !== 35000) {
      setCustomBurn(derivedMonthlyBurn);
    }
    if (customIncome === 75000 && derivedMonthlyIncome !== 75000) {
      setCustomIncome(derivedMonthlyIncome);
    }
  }, [derivedMonthlyBurn, derivedMonthlyIncome, customBurn, customIncome]);

  // 4. Run FIRE calculations
  const fireResult: FireResult = useMemo(() => {
    return calculateFire({
      currentLiquidAssets: liquidAssets,
      currentInvestments: investments,
      monthlyIncome: customIncome,
      monthlyBurn: customBurn,
      safeWithdrawalRate: swrPct / 100,
      annualReturnRate: returnRatePct / 100,
      inflationRate: inflationPct / 100
    });
  }, [liquidAssets, investments, customIncome, customBurn, swrPct, returnRatePct, inflationPct]);

  const activeFiTarget = useMemo(() => {
    switch (selectedMilestone) {
      case 'lean':
        return {
          title: 'Lean FIRE',
          amount: fireResult.leanFiNumber,
          desc: 'Basic living expenses covered (frugal freedom)',
          pct: Math.min(100, Math.round((fireResult.currentNetWorth / Math.max(1, fireResult.leanFiNumber)) * 100))
        };
      case 'fat':
        return {
          title: 'Fat FIRE',
          amount: fireResult.fatFiNumber,
          desc: 'Abundant luxury & extensive travel freedom',
          pct: Math.min(100, Math.round((fireResult.currentNetWorth / Math.max(1, fireResult.fatFiNumber)) * 100))
        };
      case 'standard':
      default:
        return {
          title: 'Standard FIRE',
          amount: fireResult.standardFiNumber,
          desc: '100% current lifestyle sustained indefinitely',
          pct: Math.min(100, Math.round(fireResult.percentToFi))
        };
    }
  }, [selectedMilestone, fireResult]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Top Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.95) 0%, rgba(30, 27, 54, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px'
              }}
            >
              <Flame size={13} />
              Financial Independence & Runway
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Freedom Horizon
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, maxWidth: '520px' }}>
              Real purchasing-power simulation of your emergency runway and your path to early retirement.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 18px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald-light)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Estimated Time to FI
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {fireResult.yearsToFi === null ? (
                  <span style={{ color: 'var(--accent-rose)', fontSize: '16px' }}>Deficit (Add Savings)</span>
                ) : fireResult.yearsToFi === 0 ? (
                  <span style={{ color: 'var(--accent-emerald-light)' }}>Achieved! 🏖️</span>
                ) : (
                  <span>{fireResult.yearsToFi} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>Years</span></span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                At {savingsRatePctSafe(fireResult.savingsRatePct)}% monthly savings rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Emergency Runway & Net Worth Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Card 1: Emergency Runway */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Emergency Runway</h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Survival duration if all income stops tomorrow</span>
                </div>
              </div>

              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: `${fireResult.runway.badgeColor}18`,
                  borderColor: `${fireResult.runway.badgeColor}40`,
                  border: `1px solid ${fireResult.runway.badgeColor}40`,
                  color: fireResult.runway.badgeColor
                }}
              >
                {fireResult.runway.label}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '14px 0' }}>
              <span style={{ fontSize: 'clamp(32px, 6vw, 44px)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {fireResult.runway.runwayMonths >= 999 ? '∞' : fireResult.runway.runwayMonths}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-muted)' }}>Months of Expenses</span>
            </div>

            {/* Progress bar visualizing runway up to 12 months target */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>0 mo</span>
                <span>3 mo (Baseline)</span>
                <span>6 mo (Safe)</span>
                <span>12+ mo (Fortress)</span>
              </div>
              <div style={{ height: '10px', width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden', padding: '1px', border: '1px solid var(--border-subtle)' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    transition: 'width 0.7s ease',
                    width: `${Math.min(100, (fireResult.runway.runwayMonths / 12) * 100)}%`,
                    backgroundColor: fireResult.runway.badgeColor
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Liquid Cash & Bank</span>
              <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isPrivacyMasked ? '••••••' : formatAmount(liquidAssets)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Monthly Burn Rate</span>
              <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-rose-light)' }}>
                {isPrivacyMasked ? '••••••' : formatAmount(customBurn)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Target 6-Mo Reserve</span>
              <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                {isPrivacyMasked ? '••••••' : formatAmount(customBurn * 6)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: FI Goal Gauge */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Compass size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>FI Milestone</h3>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Progress to financial independence</span>
              </div>
            </div>

            {/* Segmented Milestone Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
              {(['lean', 'standard', 'fat'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedMilestone(mode)}
                  style={{
                    padding: '6px 0',
                    textAlign: 'center',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedMilestone === mode ? 'var(--accent-emerald)' : 'transparent',
                    color: selectedMilestone === mode ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#818cf8' }}>
                {activeFiTarget.pct}%
              </div>
              <div className="font-mono" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {isPrivacyMasked ? '••••••' : formatAmount(fireResult.currentNetWorth)} of {isPrivacyMasked ? '••••••' : formatAmount(activeFiTarget.amount)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                {activeFiTarget.desc}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Capital Gap:</span>
            <span className="font-mono" style={{ fontWeight: 700, color: '#f59e0b' }}>
              {isPrivacyMasked
                ? '••••••'
                : formatAmount(Math.max(0, activeFiTarget.amount - fireResult.currentNetWorth))}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Levers & Simulator Controls */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Sliders size={18} color="#818cf8" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Interactive Levers & Parameters
          </h3>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Adjust sliders to see real-time impact
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Monthly Income Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Income</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatAmount(customIncome)}</span>
            </div>
            <input
              type="range"
              min="20000"
              max="500000"
              step="5000"
              value={customIncome}
              onChange={e => setCustomIncome(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#818cf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>₹20k</span>
              <span>₹5 Lakh</span>
            </div>
          </div>

          {/* Monthly Burn Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Burn</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-rose-light)' }}>{formatAmount(customBurn)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="300000"
              step="2500"
              value={customBurn}
              onChange={e => setCustomBurn(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-rose)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>₹10k</span>
              <span>₹3 Lakh</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Investment Return</span>
              <span className="font-mono" style={{ fontWeight: 700, color: 'var(--accent-emerald-light)' }}>{returnRatePct}% / yr</span>
            </div>
            <input
              type="range"
              min="6"
              max="18"
              step="0.5"
              value={returnRatePct}
              onChange={e => setReturnRatePct(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>6% (Debt/FD)</span>
              <span>18% (High Equity)</span>
            </div>
          </div>

          {/* Inflation & SWR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Inflation / SWR</span>
              <span className="font-mono" style={{ fontWeight: 700, color: '#818cf8' }}>
                {inflationPct}% Inf / {swrPct}% SWR
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <select
                value={inflationPct}
                onChange={e => setInflationPct(Number(e.target.value))}
                className="form-select"
                style={{ fontSize: '12px', padding: '6px' }}
              >
                <option value="4">4% Inflation</option>
                <option value="5">5% Inflation</option>
                <option value="6">6% Inflation</option>
                <option value="7">7% Inflation</option>
                <option value="8">8% Inflation</option>
              </select>
              <select
                value={swrPct}
                onChange={e => setSwrPct(Number(e.target.value))}
                className="form-select"
                style={{ fontSize: '12px', padding: '6px' }}
              >
                <option value="3.0">3.0% (33.3x)</option>
                <option value="3.5">3.5% (28.6x)</option>
                <option value="4.0">4.0% (25.0x)</option>
                <option value="4.5">4.5% (22.2x)</option>
                <option value="5.0">5.0% (20.0x)</option>
              </select>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Real Return: {Math.max(0, Math.round(((1 + returnRatePct / 100) / (1 + inflationPct / 100) - 1) * 1000) / 10)}%
            </div>
          </div>
        </div>

        {/* Warning if burn > income */}
        {customBurn > customIncome && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#fecdd3',
              fontSize: '12px'
            }}
          >
            <AlertTriangle size={18} color="var(--accent-rose-light)" style={{ flexShrink: 0 }} />
            <span>
              Monthly burn ({formatAmount(customBurn)}) exceeds monthly income ({formatAmount(customIncome)}). Deficit of {formatAmount(customBurn - customIncome)} is depleting capital.
            </span>
          </div>
        )}
      </div>

      {/* 30-Year Wealth Trajectory Chart */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                30-Year Real Wealth Trajectory
              </h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Purchasing-power adjusted net worth growth vs Standard FI Target line
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#6366f1' }} />
              <span>Projected Net Worth</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
              <span style={{ width: '14px', height: '2px', background: '#f59e0b' }} />
              <span>Standard FI Line ({formatAmount(fireResult.standardFiNumber)})</span>
            </div>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={fireResult.projection}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                tickFormatter={y => `Yr ${y}`}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                tickFormatter={val => {
                  if (val >= 10000000) return `${symbol}${(val / 10000000).toFixed(1)}Cr`;
                  if (val >= 100000) return `${symbol}${(val / 100000).toFixed(0)}L`;
                  return `${symbol}${val}`;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#F8FAFC',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                }}
                formatter={(val: any) => [
                  isPrivacyMasked ? '••••••' : formatAmount(Number(val)),
                  'Projected Value'
                ]}
                labelFormatter={label => `Year ${label} from now`}
              />
              <ReferenceLine
                y={fireResult.standardFiNumber}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="projectedWealth"
                stroke="#6366F1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wealthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explanatory Rule of 25 / Trinity Study Education Pill */}
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          color: 'var(--text-muted)',
          fontSize: '12px',
          lineHeight: '1.6'
        }}
      >
        <Info size={16} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>How the 4% Rule works:</span> According to the Trinity Study, if your investment portfolio equals 25 times your annual living expenses, a 4% annual withdrawal (adjusted for inflation) has historically lasted indefinitely without depleting your capital. Lean FIRE targets 75% of your baseline, while Fat FIRE provides a 50% luxury buffer.
        </div>
      </div>
    </div>
  );
};

function savingsRatePctSafe(pct: number): string {
  if (isNaN(pct) || !isFinite(pct)) return '0';
  return pct.toFixed(0);
}
