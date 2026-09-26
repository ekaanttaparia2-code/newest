import React, { useState } from 'react';
import type { CategoryBudgetStatus, GroupBudgetSummary } from '../../hooks/useBudgets';
import type { Category } from '../../db/types';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EnvelopeSummary } from './EnvelopeSummary';
import { AlertTriangle, CheckCircle2, Edit2, Calendar, X, Check } from 'lucide-react';

interface BudgetsViewProps {
  budgetStatuses: CategoryBudgetStatus[];
  allCategories?: Category[];
  onUpdateLimit: (categoryId: string, limit: number) => Promise<void>;
  groupSummary?: GroupBudgetSummary;
  monthlyIncome?: number;
  onApplySalaryPlan?: (salary: number) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgetStatuses,
  allCategories = [],
  onUpdateLimit,
  groupSummary,
  monthlyIncome = 0,
  onApplySalaryPlan
}) => {
  const { isPrivacyMasked } = usePrivacy();
  const { formatAmount } = useCurrency();
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<string>('');

  // Calculate days left in month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);

  const totalBudgeted = budgetStatuses.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetStatuses.reduce((s, b) => s + b.spent, 0);
  const isNetOver = totalSpent > totalBudgeted && totalBudgeted > 0;
  const netOverAmount = Math.max(0, totalSpent - totalBudgeted);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const safeDailySpend = totalRemaining / daysRemaining;

  // Find expense categories that do not have an active budget limit (> 0)
  const budgetedCatIds = new Set(budgetStatuses.map(b => b.category.id));
  const unbudgetedCategories = (allCategories || []).filter(
    cat => cat.type === 'expense' && !budgetedCatIds.has(cat.id)
  );

  const handleStartEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setEditLimitValue(currentLimit.toString());
  };

  const handleSaveEdit = async (catId: string) => {
    const parsed = parseFloat(editLimitValue);
    if (!isNaN(parsed) && parsed >= 0) {
      await onUpdateLimit(catId, parsed);
    }
    setEditingCatId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 50-30-20 Envelope Allocation Model */}
      {groupSummary && onApplySalaryPlan && (
        <EnvelopeSummary
          groupSummary={groupSummary}
          monthlyIncome={monthlyIncome}
          onApplySalaryPlan={onApplySalaryPlan}
        />
      )}

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Monthly Category Budgets
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Guardrails to keep your spending controlled and conscious
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '8px 16px', borderRadius: 'var(--radius-md)' }}>
          <Calendar size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {daysRemaining} Days Left in {now.toLocaleString('default', { month: 'long' })}
          </span>
        </div>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Budgeted
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatAmount(totalBudgeted, isPrivacyMasked)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Actual Spent
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '22px', fontWeight: 800, color: isNetOver ? 'var(--accent-rose)' : 'var(--accent-rose-light)', marginTop: '4px' }}>
            {formatAmount(totalSpent, isPrivacyMasked)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            {isNetOver ? 'Net Over Budget' : 'Remaining Cap'}
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '22px', fontWeight: 800, color: isNetOver ? 'var(--accent-rose)' : 'var(--accent-emerald-light)', marginTop: '4px' }}>
            {isNetOver
              ? `+${formatAmount(netOverAmount, isPrivacyMasked)}`
              : formatAmount(totalRemaining, isPrivacyMasked)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
            Safe Daily Spend
          </span>
          <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '22px', fontWeight: 800, color: isNetOver ? 'var(--accent-rose-light)' : '#38bdf8', marginTop: '4px' }}>
            {isNetOver ? 'Over Limit' : `${formatAmount(safeDailySpend, isPrivacyMasked)}/day`}
          </div>
        </div>

      </div>

      {/* Active Budget Cards List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Budgets ({budgetStatuses.length})
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click any limit to modify (enter 0 to remove)
          </span>
        </div>

        {budgetStatuses.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              No active category budgets yet.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Choose a category below and set a monthly spending limit.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {budgetStatuses.map(status => {
              const isOver = status.isOverBudget;
              const isNear = status.isNearLimit;
              const progressPercent = Math.min(100, Math.round(status.percentage));
              const isEditing = editingCatId === status.category.id;

              return (
                <div
                  key={status.category.id}
                  className="glass-panel interactive-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderColor: isOver ? 'rgba(244, 63, 94, 0.4)' : undefined
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: status.category.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CategoryIcon iconName={status.category.icon} size={18} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {status.category.name}
                          </h4>
                          <span style={{ fontSize: '11px', color: isOver ? 'var(--accent-rose-light)' : 'var(--text-muted)', fontWeight: isOver ? 600 : 400 }}>
                            {isOver
                              ? `Over by ${formatAmount(status.overspentAmount, isPrivacyMasked)}`
                              : `${formatAmount(status.remaining, isPrivacyMasked)} remaining`}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {isOver ? (
                        <span className="badge-expense" style={{ fontSize: '11px', gap: '4px' }}>
                          <AlertTriangle size={12} /> Over Budget
                        </span>
                      ) : isNear ? (
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', fontSize: '11px', padding: '3px 8px', borderRadius: '999px', fontWeight: 600 }}>
                          80%+ Used
                        </span>
                      ) : (
                        <span className="badge-income" style={{ fontSize: '11px', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Healthy
                        </span>
                      )}
                    </div>

                    {/* Numbers */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Spent</span>
                        <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '17px', fontWeight: 700, color: isOver ? 'var(--accent-rose-light)' : 'var(--text-primary)' }}>
                          {formatAmount(status.spent, isPrivacyMasked)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Limit</span>
                        {isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <input
                              type="number"
                              className="form-input font-mono"
                              value={editLimitValue}
                              onChange={e => setEditLimitValue(e.target.value)}
                              style={{ width: '80px', padding: '4px 8px', fontSize: '13px' }}
                              autoFocus
                            />
                            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleSaveEdit(status.category.id)} title="Save">
                              <Check size={13} color="var(--accent-emerald)" />
                            </button>
                            <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => setEditingCatId(null)} title="Cancel">
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEdit(status.category.id, status.limit)}
                            className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`}
                            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Click to edit budget limit (set to 0 to remove)"
                          >
                            {formatAmount(status.limit, isPrivacyMasked)}
                            <Edit2 size={12} color="var(--text-muted)" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: isOver ? 'var(--accent-rose)' : isNear ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{Math.round(status.percentage)}% consumed</span>
                    <span style={{ color: isOver ? 'var(--accent-rose-light)' : 'var(--text-muted)', fontWeight: isOver ? 700 : 500 }}>
                      {isOver
                        ? `Over by ${formatAmount(status.overspentAmount, isPrivacyMasked)}`
                        : `${formatAmount(status.remaining, isPrivacyMasked)} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unbudgeted Categories Section */}
      {unbudgetedCategories.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Unbudgeted Categories ({unbudgetedCategories.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Set spending limits for these categories to prevent unexpected budget leakage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {unbudgetedCategories.map(cat => {
              const isSetting = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="glass-panel interactive-card"
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <CategoryIcon iconName={cat.icon} size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        No limit set
                      </span>
                    </div>
                  </div>

                  {isSetting ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      <input
                        type="number"
                        className="form-input font-mono"
                        placeholder="Limit"
                        value={editLimitValue}
                        onChange={e => setEditLimitValue(e.target.value)}
                        style={{ width: '85px', padding: '4px 8px', fontSize: '12px' }}
                        autoFocus
                      />
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleSaveEdit(cat.id)} title="Set limit">
                        <Check size={13} color="var(--accent-emerald)" />
                      </button>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => setEditingCatId(null)} title="Cancel">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat.id, 1000)}
                      className="btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '12px', flexShrink: 0 }}
                    >
                      + Set Budget
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
