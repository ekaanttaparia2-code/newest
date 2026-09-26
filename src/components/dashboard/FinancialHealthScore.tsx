import React from 'react';
import { Award, Flame } from 'lucide-react';

interface FinancialHealthScoreProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpense: number;
  streak?: number;
  isLoggedToday?: boolean;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  totalAssets,
  totalLiabilities,
  monthlyIncome,
  monthlyExpense,
  streak = 0,
  isLoggedToday = false
}) => {

  // Dynamic Score Calculation
  // 1. Savings Rate component (max 40 pts)
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) : 0;
  const savingsScore = Math.min(40, Math.max(0, Math.round(savingsRate * 50)));

  // 2. Debt to Asset ratio (max 30 pts)
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) : 0;
  const debtScore = Math.min(30, Math.max(0, Math.round((1 - debtRatio) * 30)));

  // 3. Positive Cash Flow bonus (max 30 pts)
  const cashFlowScore = monthlyIncome > monthlyExpense ? 30 : 10;

  const totalScore = Math.min(100, Math.max(25, savingsScore + debtScore + cashFlowScore));

  const getScoreTier = (score: number) => {
    if (score >= 85) return { title: 'Wealth Architect', color: '#10b981', desc: 'Elite financial discipline and compounding velocity.' };
    if (score >= 70) return { title: 'Pristine Builder', color: '#38bdf8', desc: 'Solid cash flow surplus and healthy debt management.' };
    if (score >= 50) return { title: 'Steady Ascender', color: '#f59e0b', desc: 'Positive balance, with room to optimize recurring outlays.' };
    return { title: 'Stabilizer', color: '#f43f5e', desc: 'Focus on reducing liabilities and boosting monthly savings.' };
  };

  const getTierBadge = (score: number) => {
    if (score >= 85) return 'Optimal Resilience';
    if (score >= 70) return 'Strong Health';
    if (score >= 50) return 'Fair Balance';
    return 'Attention Needed';
  };

  const tier = getScoreTier(totalScore);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(14, 19, 31, 0.95) 0%, rgba(26, 36, 56, 0.85) 100%)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}
    >
      {/* Background radial accent */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tier.color}22 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${tier.color}22`, color: tier.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Financial Health Index
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Real-time Capital Performance</span>
          </div>
        </div>

        {/* Streak counter badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: streak > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${streak > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: streak > 0 ? 'var(--accent-amber)' : 'var(--text-muted)',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700
          }}
          title={isLoggedToday ? 'You logged today!' : 'Log an expense today to keep your streak active!'}
        >
          <Flame size={14} color={streak > 0 ? 'var(--accent-amber)' : 'var(--text-muted)'} />
          <span>{streak > 0 ? `${streak}-Day Logging Streak` : '0-Day Streak'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px' }}>
        
        {/* Score Ring */}
        <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={tier.color}
              strokeWidth="8"
              strokeDasharray={264}
              strokeDashoffset={264 - (264 * totalScore) / 100}
              strokeLinecap="round"
              fill="transparent"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="font-mono" style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {totalScore}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              / 100
            </span>
          </div>
        </div>

        {/* Tier Details */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: tier.color }}>
              {tier.title}
            </span>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {getTierBadge(totalScore)}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '10px' }}>
            {tier.desc}
          </p>

          {/* Sub-bars */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>Savings Velocity</span>
                <span className="font-mono">{Math.round(savingsRate * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round(savingsRate * 100))}%`, height: '100%', background: 'var(--accent-emerald)', borderRadius: '999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                <span>Liability Cushion</span>
                <span className="font-mono">{Math.round((1 - debtRatio) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, Math.round((1 - debtRatio) * 100))}%`, height: '100%', background: '#38bdf8', borderRadius: '999px' }} />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
