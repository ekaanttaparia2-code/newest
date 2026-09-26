import React from 'react';
import type { CategoryBudgetStatus } from '../../hooks/useBudgets';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AlertCircle, ChevronRight } from 'lucide-react';

interface BudgetProgressOverviewProps {
  budgetStatuses: CategoryBudgetStatus[];
  onViewBudgets: () => void;
}

export const BudgetProgressOverview: React.FC<BudgetProgressOverviewProps> = ({
  budgetStatuses,
  onViewBudgets
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { formatAmount } = useCurrency();

  const totalBudgeted = budgetStatuses.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetStatuses.reduce((s, b) => s + b.spent, 0);
  const overallPercentage = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Monthly Budgets
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Spending limits & current progress
          </p>
        </div>
        <button
          onClick={onViewBudgets}
          style={{ fontSize: '13px', color: 'var(--accent-emerald-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}
        >
          Manage <ChevronRight size={14} />
        </button>
      </div>

      {/* Overall Month Metric */}
      <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '18px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Overall Budget Cap
          </span>
          <span className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatAmount(totalSpent, isPrivacyMasked)} / {formatAmount(totalBudgeted, isPrivacyMasked)}
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, overallPercentage)}%`,
              height: '100%',
              background: overallPercentage > 100 ? 'var(--accent-rose)' : overallPercentage > 85 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Category breakdown rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {budgetStatuses.slice(0, 4).map(status => {
          const isOver = status.isOverBudget;
          const isNear = status.isNearLimit;
          const progressColor = isOver ? 'var(--accent-rose)' : isNear ? 'var(--accent-amber)' : 'var(--accent-emerald)';

          return (
            <div key={status.category.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: status.category.color
                    }}
                  >
                    <CategoryIcon iconName={status.category.icon} size={14} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {status.category.name}
                  </span>
                  {isOver && (
                    <span title="Exceeded budget!">
                      <AlertCircle size={13} color="var(--accent-rose)" />
                    </span>
                  )}
                </div>

                <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ color: isOver ? 'var(--accent-rose-light)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {formatAmount(status.spent, isPrivacyMasked)}
                  </span>
                  {' '}/ {formatAmount(status.limit, isPrivacyMasked)}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.round(status.percentage))}%`,
                    height: '100%',
                    background: progressColor,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
