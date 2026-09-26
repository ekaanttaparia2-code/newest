import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, X, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { soundFx } from '../../lib/soundFx';

interface GettingStartedCardProps {
  hasTransactions: boolean;
  hasVisitedBudgets?: boolean;
  hasVisitedSimulator?: boolean;
  onOpenVoiceModal: () => void;
  onSelectTab: (tab: any) => void;
}

export const GettingStartedCard: React.FC<GettingStartedCardProps> = ({
  hasTransactions,
  hasVisitedBudgets = false,
  hasVisitedSimulator = false,
  onOpenVoiceModal,
  onSelectTab
}) => {
  const { language } = useLanguage();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('pockettrack_checklist_dismissed') === 'true';
  });

  const [budgetsDone, setBudgetsDone] = useState<boolean>(() => {
    return hasVisitedBudgets || localStorage.getItem('pockettrack_task_budgets_done') === 'true';
  });

  const [simulatorDone, setSimulatorDone] = useState<boolean>(() => {
    return hasVisitedSimulator || localStorage.getItem('pockettrack_task_simulator_done') === 'true';
  });

  useEffect(() => {
    if (hasVisitedBudgets) {
      localStorage.setItem('pockettrack_task_budgets_done', 'true');
    }
  }, [hasVisitedBudgets]);

  useEffect(() => {
    if (hasVisitedSimulator) {
      localStorage.setItem('pockettrack_task_simulator_done', 'true');
    }
  }, [hasVisitedSimulator]);

  if (isDismissed) return null;

  const handleActionBudgets = () => {
    setBudgetsDone(true);
    localStorage.setItem('pockettrack_task_budgets_done', 'true');
    onSelectTab('budgets');
  };

  const handleActionSimulator = () => {
    setSimulatorDone(true);
    localStorage.setItem('pockettrack_task_simulator_done', 'true');
    onSelectTab('simulator');
  };

  const tasks = [
    {
      id: 1,
      done: hasTransactions,
      title: language === 'hi' ? 'पहला खर्च दर्ज करें (चाय या स्विगी टैप करें)' : language === 'hinglish' ? 'Pehla kharcha log karein (Chai ya Swiggy)' : 'Log your first expense (Try 1-Tap Chai)',
      actionText: language === 'hi' ? 'बोलकर लिखें' : language === 'hinglish' ? 'Voice Log' : 'Voice Log',
      onAction: onOpenVoiceModal
    },
    {
      id: 2,
      done: hasVisitedBudgets || budgetsDone,
      title: language === 'hi' ? 'मासिक बजट की सीमा देखें' : language === 'hinglish' ? 'Monthly Food & Rent Budget check karein' : 'Review your category spending limits',
      actionText: language === 'hi' ? 'बजट देखें' : language === 'hinglish' ? 'Budgets' : 'Budgets',
      onAction: handleActionBudgets
    },
    {
      id: 3,
      done: hasVisitedSimulator || simulatorDone,
      title: language === 'hi' ? 'एक बचत लक्ष्य या एसआईपी सेट करें' : language === 'hinglish' ? 'Dream Goal ya SIP Simulator try karein' : 'Simulate compound growth or set a goal',
      actionText: language === 'hi' ? 'सिम्युलेटर' : language === 'hinglish' ? 'Simulator' : 'Simulator',
      onAction: handleActionSimulator
    }
  ];

  const completedCount = tasks.filter(t => t.done).length;
  const isAllComplete = completedCount === tasks.length;

  const handleDismiss = () => {
    soundFx.playPop();
    setIsDismissed(true);
    localStorage.setItem('pockettrack_checklist_dismissed', 'true');
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 24px',
        marginBottom: '20px',
        background: isAllComplete
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(14, 19, 31, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(14, 19, 31, 0.95) 100%)',
        borderColor: isAllComplete ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.25)',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: isAllComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.18)',
              color: isAllComplete ? 'var(--accent-emerald)' : '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isAllComplete ? <Trophy size={16} /> : <Sparkles size={16} />}
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isAllComplete
                ? (language === 'hi' ? '🎉 सभी 3 कदम पूरे हो गए!' : '🎉 All 3 Quick Start Steps Completed!')
                : (language === 'hi' ? 'शुरुआती गाइड: 3 आसान कदम' : language === 'hinglish' ? 'Quick Start: 3 Aasan Steps' : 'Quick Start Guide: 3 Easy Steps')}
            </h4>
            <span style={{ fontSize: '12px', color: isAllComplete ? 'var(--accent-emerald-light)' : 'var(--text-muted)' }}>
              {isAllComplete
                ? 'Your financial cockpit is fully set up and running!'
                : `${completedCount} of ${tasks.length} completed`}
            </span>
          </div>
        </div>

        <button className="btn-icon" onClick={handleDismiss} style={{ width: '28px', height: '28px' }} title="Dismiss checklist">
          <X size={14} />
        </button>
      </div>

      {/* Task Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map(task => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, marginRight: '8px' }}>
              {task.done ? (
                <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
              ) : (
                <Circle size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: task.done ? 'line-through' : 'none',
                  lineHeight: 1.35,
                  wordBreak: 'break-word'
                }}
              >
                {task.title}
              </span>
            </div>

            <button
              type="button"
              onClick={task.onAction}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: task.done ? 'var(--text-muted)' : 'var(--accent-emerald-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '6px',
                background: task.done ? 'rgba(255, 255, 255, 0.04)' : 'rgba(16, 185, 129, 0.1)',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            >
              <span>{task.done ? 'Done' : task.actionText}</span>
              {!task.done && <ArrowRight size={12} />}
            </button>
          </div>
        ))}
      </div>

      {isAllComplete && (
        <div style={{ marginTop: '14px', textAlign: 'right' }}>
          <button
            type="button"
            onClick={handleDismiss}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px', color: 'var(--accent-emerald-light)' }}
          >
            Dismiss Guide
          </button>
        </div>
      )}
    </div>
  );
};
