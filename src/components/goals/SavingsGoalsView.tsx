import React, { useState } from 'react';
import { Target, Plus, Shield, Plane, Laptop, Home, Heart, Trash2, Sparkles, Check, X } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { soundFx } from '../../lib/soundFx';
import confetti from 'canvas-confetti';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  category: string;
  icon: string;
  color: string;
}

export const SavingsGoalsView: React.FC = () => {
  const { symbol, formatAmount } = useCurrency();
  const { isPrivacyMasked } = usePrivacy();

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('pockettrack_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* ignore */
      }
    }
    // Clean, honest start: empty by default
    return [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  useModalAccessibility(isAddModalOpen, () => setIsAddModalOpen(false));
  const [newGoalName, setNewGoalName] = useState<string>('');
  const [newGoalTarget, setNewGoalTarget] = useState<string>('');
  const [newGoalCurrent, setNewGoalCurrent] = useState<string>('0');
  const [newGoalIcon, setNewGoalIcon] = useState<string>('Target');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Personal');

  const saveGoals = (updated: Goal[]) => {
    setGoals(updated);
    localStorage.setItem('pockettrack_goals', JSON.stringify(updated));
  };

  const handleDeposit = (id: string, amount: number) => {
    soundFx.playLevelUp();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#38bdf8', '#fbbf24']
    });

    const updated = goals.map(g => {
      if (g.id === id) {
        return { ...g, current: Math.min(g.target * 2, g.current + amount) };
      }
      return g;
    });
    saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      soundFx.playPop();
      const updated = goals.filter(g => g.id !== id);
      saveGoals(updated);
    }
  };

  const handleCreateTemplate = (template: { name: string; target: number; category: string; icon: string; color: string }) => {
    soundFx.playCashChime();
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: template.name,
      target: template.target,
      current: 0,
      category: template.category,
      icon: template.icon,
      color: template.color
    };
    saveGoals([...goals, newGoal]);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    const current = parseFloat(newGoalCurrent) || 0;
    if (!newGoalName.trim() || isNaN(target) || target <= 0) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      name: newGoalName.trim(),
      target,
      current: Math.max(0, current),
      category: newGoalCategory.trim() || 'Custom Goal',
      icon: newGoalIcon,
      color: '#10b981'
    };

    saveGoals([...goals, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('0');
    setIsAddModalOpen(false);
  };

  const renderIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'Shield': return <Shield size={size} />;
      case 'Laptop': return <Laptop size={size} />;
      case 'Plane': return <Plane size={size} />;
      case 'Home': return <Home size={size} />;
      case 'Heart': return <Heart size={size} />;
      default: return <Target size={size} />;
    }
  };

  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.current, 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Savings Goals & Sinking Funds
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Target funds for high-ticket dreams, emergencies, and purchases
              </p>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>New Goal</span>
        </button>
      </div>

      {/* Overview Stat Bar (only shown if goals exist) */}
      {goals.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Total Capital In Goals
            </span>
            <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-emerald-light)' }}>
              {formatAmount(totalSaved, isPrivacyMasked)} / {formatAmount(totalTarget, isPrivacyMasked)}
            </div>
          </div>

          <div style={{ flex: '1', minWidth: '220px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Overall Completion</span>
              <span className="font-mono" style={{ color: 'var(--accent-emerald-light)' }}>{overallPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, overallPercent)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Empty State with Fast Templates */}
      {goals.length === 0 && (
        <div className="glass-panel" style={{ padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Active Savings Goals Yet
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Sinking funds give every rupee a clear purpose. Tap a starter template below or create your own custom goal.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'Emergency Safety Vault', target: 100000, category: 'Emergency', icon: 'Shield', color: '#10b981' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={14} color="#10b981" />
              <span>+ Emergency Fund ({symbol}1,00,000)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'Dream Vacation / Trip', target: 50000, category: 'Travel', icon: 'Plane', color: '#38bdf8' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plane size={14} color="#38bdf8" />
              <span>+ Vacation Trip ({symbol}50,000)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateTemplate({ name: 'Gadget / Laptop Upgrade', target: 80000, category: 'Tech', icon: 'Laptop', color: '#f59e0b' })}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Laptop size={14} color="#f59e0b" />
              <span>+ Tech Upgrade ({symbol}80,000)</span>
            </button>
          </div>
        </div>
      )}

      {/* Goal Cards Grid */}
      {goals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
          {goals.map(goal => {
            const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const isDone = goal.current >= goal.target;

            return (
              <div
                key={goal.id}
                className="glass-panel interactive-card"
                style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: `${goal.color}22`,
                          color: goal.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {renderIcon(goal.icon, 20)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {goal.name}
                        </h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: isDone ? 'var(--accent-emerald-light)' : goal.color,
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {percent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="btn-icon"
                        style={{ width: '28px', height: '28px', color: 'var(--text-faint)' }}
                        title="Delete goal"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Amount figures */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Saved</span>
                      <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {formatAmount(goal.current, isPrivacyMasked)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target</span>
                      <div className={`font-mono ${isPrivacyMasked ? 'privacy-masked' : ''}`} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {formatAmount(goal.target, isPrivacyMasked)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: isDone ? 'var(--accent-emerald)' : goal.color,
                        borderRadius: '999px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Deposit Chips */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '4px' }}>
                    Add:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeposit(goal.id, 500)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  >
                    +{symbol}500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeposit(goal.id, 2000)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  >
                    +{symbol}2,000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeposit(goal.id, 5000)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  >
                    +{symbol}5,000
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Create New Savings Goal</h3>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} style={{ padding: '20px 24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Goal Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., iPhone 17 Pro, Goa Vacation"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="form-label">Target Amount ({symbol})</label>
                  <input
                    type="number"
                    step="100"
                    className="form-input font-mono"
                    placeholder="50000"
                    value={newGoalTarget}
                    onChange={e => setNewGoalTarget(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Initial Saved ({symbol})</label>
                  <input
                    type="number"
                    step="100"
                    className="form-input font-mono"
                    placeholder="0"
                    value={newGoalCurrent}
                    onChange={e => setNewGoalCurrent(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Travel, Tech"
                    value={newGoalCategory}
                    onChange={e => setNewGoalCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Icon</label>
                  <select
                    className="form-select"
                    value={newGoalIcon}
                    onChange={e => setNewGoalIcon(e.target.value)}
                  >
                    <option value="Target">Target 🎯</option>
                    <option value="Shield">Safety 🛡️</option>
                    <option value="Plane">Travel ✈️</option>
                    <option value="Laptop">Tech 💻</option>
                    <option value="Home">Home 🏠</option>
                    <option value="Heart">Personal ❤️</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} />
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
