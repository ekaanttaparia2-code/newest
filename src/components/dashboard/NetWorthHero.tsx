import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Plus,
  Mic,
  Sparkles,
  ShieldCheck,
  CreditCard,
  EyeOff,
  Wallet
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { NetWorthSparkline } from './NetWorthSparkline';

interface NetWorthHeroProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpense: number;
  onOpenVoiceModal: () => void;
  onOpenTransactionModal: () => void;
}

export const NetWorthHero: React.FC<NetWorthHeroProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities,
  monthlyIncome,
  monthlyExpense,
  onOpenVoiceModal,
  onOpenTransactionModal
}) => {
  const { isPrivacyMasked, togglePrivacy } = usePrivacy();
  const { formatAmount } = useCurrency();

  // Smooth 60fps ease-out number animation
  const animatedNetWorth = useAnimatedNumber(netWorth, 750);
  const animatedAssets = useAnimatedNumber(totalAssets, 750);
  const animatedLiabilities = useAnimatedNumber(totalLiabilities, 750);

  const netCashFlow = monthlyIncome - monthlyExpense;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((netCashFlow / monthlyIncome) * 100)) : 0;
  const liquidPct = totalAssets > 0 ? Math.min(100, Math.round((totalAssets / Math.max(1, totalAssets + totalLiabilities)) * 100)) : 100;
  const debtRatio = totalAssets > 0 ? Math.min(100, Math.round((totalLiabilities / totalAssets) * 100)) : 0;

  return (
    <div
      className="glass-panel"
      style={{
        padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.96) 0%, rgba(20, 27, 44, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Two-layer dynamic ambient aurora glow */}
      <div
        className="aurora-glow-1"
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-40px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(99, 102, 241, 0.07) 55%, transparent 75%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />
      <div
        className="aurora-glow-2"
        style={{
          position: 'absolute',
          bottom: '-60px',
          left: '20%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.05) 60%, transparent 75%)',
          filter: 'blur(55px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Header Row: Metrics Summary & Quick Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: '26px'
          }}
        >
          {/* Left Column: Total Net Worth Hero Title & Amount */}
          <div style={{ flex: '1 1 340px', minWidth: '280px' }}>
            {/* Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)'
                }}
              >
                Total Net Worth
              </span>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--accent-emerald-light)',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                <TrendingUp size={12} />
                <span>Living Velocity</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  color: '#818cf8',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}
              >
                <Sparkles size={11} />
                <span>30-Day Trajectory</span>
              </div>
            </div>

            {/* Big Net Worth Number & Living Sparkline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: 'clamp(32px, 4.5vw, 44px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {isPrivacyMasked ? (
                  <span
                    onClick={togglePrivacy}
                    title="Click to unmask amounts"
                    style={{
                      letterSpacing: '0.12em',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <span>••••••••</span>
                    <EyeOff size={18} color="var(--text-muted)" />
                  </span>
                ) : (
                  <span className="font-mono">
                    {formatAmount(animatedNetWorth, false)}
                  </span>
                )}
              </div>

              {/* Sparkline display */}
              <div style={{ display: 'inline-flex', alignItems: 'center', opacity: isPrivacyMasked ? 0.4 : 1 }}>
                <NetWorthSparkline
                  currentNetWorth={netWorth}
                  monthlyIncome={monthlyIncome}
                  monthlyExpense={monthlyExpense}
                  height={44}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Tactile Primary Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <button
              onClick={onOpenVoiceModal}
              className="btn-secondary pressable"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: 'var(--accent-emerald-light)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 18px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Mic size={16} />
              <span>Voice Log</span>
            </button>
            <button
              onClick={onOpenTransactionModal}
              className="btn-primary pressable"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 16px -2px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Plus size={16} />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Bottom Financial Pulse Stat Strip (4-Card Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))',
            gap: '14px',
            marginTop: '10px'
          }}
        >
          {/* Stat 1: Liquid Assets */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.32)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Liquid Assets
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={13} color="var(--accent-emerald-light)" />
              </div>
            </div>
            <div
              className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
              style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}
            >
              {formatAmount(animatedAssets, isPrivacyMasked)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {liquidPct}% of total assets
            </div>
          </div>

          {/* Stat 2: Liabilities / Cards */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.32)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Liabilities & Cards
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={13} color="var(--accent-rose-light)" />
              </div>
            </div>
            <div
              className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
              style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-rose-light)' }}
            >
              {formatAmount(animatedLiabilities, isPrivacyMasked)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {debtRatio === 0 ? 'Zero debt burden' : `${debtRatio}% debt-to-asset`}
            </div>
          </div>

          {/* Stat 3: Monthly Cashflow */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.32)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Monthly Cash Flow
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <ArrowUpRight size={13} color="var(--accent-emerald)" />
                <ArrowDownRight size={13} color="var(--accent-rose)" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}
              >
                +{formatAmount(monthlyIncome, isPrivacyMasked)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/</span>
              <span
                className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-rose-light)' }}
              >
                -{formatAmount(monthlyExpense, isPrivacyMasked)}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: netCashFlow >= 0 ? 'var(--accent-emerald-light)' : 'var(--accent-rose-light)' }}>
              Net: {netCashFlow >= 0 ? '+' : ''}{formatAmount(netCashFlow, isPrivacyMasked)}
            </div>
          </div>

          {/* Stat 4: Savings Velocity */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.32)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Savings Velocity
              </span>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={13} color="#38bdf8" />
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>
              {savingsRate}%
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', marginTop: '2px' }}>
              <div
                style={{
                  width: `${Math.min(100, savingsRate)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                  borderRadius: '999px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
