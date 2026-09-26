import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Mic,
  Landmark,
  Menu,
  X,
  PieChart,
  TrendingUp,
  Target,
  TrendingDown,
  Flame,
  Calculator,
  Calendar,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import type { NavTab } from './Sidebar';
import { soundFx } from '../../lib/soundFx';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenVoiceModal: () => void;
  onOpenAuthModal?: () => void;
  onOpenLegalModal?: () => void;
  onReopenExplainer?: () => void;
  isMobileFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenVoiceModal,
  onOpenAuthModal,
  onOpenLegalModal,
  onReopenExplainer,
  isMobileFrame = false
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);

  const moreTabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'budgets', label: 'Budgets & Envelopes', icon: <PieChart size={18} color="#fbbf24" /> },
    { id: 'analytics', label: 'Cash Flow & Inflation', icon: <TrendingUp size={18} color="#34d399" /> },
    { id: 'goals', label: 'Savings Goals', icon: <Target size={18} color="#818cf8" /> },
    { id: 'debt', label: 'Debt Payoff', icon: <TrendingDown size={18} color="#fb7185" />, badge: 'Payoff' },
    { id: 'fire', label: 'FIRE & Runway', icon: <Flame size={18} color="#f59e0b" />, badge: 'Freedom' },
    { id: 'simulator', label: 'Wealth Simulator', icon: <Calculator size={18} color="#38bdf8" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Calendar size={18} color="#c084fc" /> },
  ];

  const isMoreTabActive = moreTabs.some(t => t.id === currentTab);

  const handleSelectTab = (tab: NavTab) => {
    soundFx.playPop();
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav
        className="mobile-only-nav"
        style={{
          position: isMobileFrame ? 'absolute' : 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '64px',
          background: 'rgba(12, 16, 28, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
          paddingBottom: isMobileFrame ? '8px' : 'env(safe-area-inset-bottom, 4px)',
          boxSizing: 'border-box'
        }}
      >
        {/* Dashboard */}
        <button
          onClick={() => handleSelectTab('dashboard')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: currentTab === 'dashboard' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            padding: '4px 8px'
          }}
        >
          <LayoutDashboard size={18} />
          <span>Home</span>
        </button>

        {/* Transactions */}
        <button
          onClick={() => handleSelectTab('transactions')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: currentTab === 'transactions' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            padding: '4px 8px'
          }}
        >
          <Receipt size={18} />
          <span>Activity</span>
        </button>

        {/* Center Voice Mic Floating Action Button */}
        <button
          onClick={() => {
            soundFx.playPop();
            onOpenVoiceModal();
          }}
          title="Voice Log"
          style={{
            marginTop: '-22px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
            border: '3px solid #080b11',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Mic size={22} />
        </button>

        {/* Accounts */}
        <button
          onClick={() => handleSelectTab('accounts')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: currentTab === 'accounts' ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            padding: '4px 8px'
          }}
        >
          <Landmark size={18} />
          <span>Accounts</span>
        </button>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => {
            soundFx.playPop();
            setIsMoreOpen(!isMoreOpen);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            color: isMoreTabActive || isMoreOpen ? 'var(--accent-emerald)' : 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            padding: '4px 8px'
          }}
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet Drawer for More Features */}
      {isMoreOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsMoreOpen(false)}
          style={{
            zIndex: 1000,
            alignItems: 'flex-end',
            padding: 0
          }}
        >
          <div
            className="mobile-bottom-sheet"
            onClick={e => e.stopPropagation()}
            style={{
              padding: '20px 16px 32px 16px',
              background: '#0d1322',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px 24px 0 0',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              animation: 'slideUpSheet 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div className="sheet-notch" />

            {/* Header Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
                marginBottom: '16px'
              }}
            >
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  More Features & Portals
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  All tools & financial views
                </p>
              </div>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="btn-icon"
                title="Close"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Finny Assessment Replay Banner */}
            {onReopenExplainer && (
              <button
                type="button"
                onClick={() => {
                  setIsMoreOpen(false);
                  onReopenExplainer();
                }}
                className="pressable"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 78, 59, 0.45) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  marginBottom: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#10b981',
                    color: '#064e3b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={20} color="#ffffff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                    Meet Finny & Retake Assessment
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-emerald-light)' }}>
                    Personalize your budget, triggers & blueprint
                  </div>
                </div>
              </button>
            )}

            {/* Feature Grid — Vertical Card Tiles */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {moreTabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTab(t.id)}
                  className="pressable"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '14px 8px',
                    borderRadius: '12px',
                    border: currentTab === t.id
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: currentTab === t.id
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(15, 23, 42, 0.6)',
                    color: currentTab === t.id
                      ? 'var(--accent-emerald-light)'
                      : 'var(--text-secondary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    minWidth: 0
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {t.icon}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    maxWidth: '100%'
                  }}>
                    {t.label}
                  </span>
                  {t.badge && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(99, 102, 241, 0.3)'
                    }}>
                      {t.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Actions: Cloud Backup & Legal */}
            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid rgba(30, 41, 59, 0.8)',
              display: 'flex',
              gap: '8px'
            }}>
              {onOpenAuthModal && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenAuthModal();
                  }}
                  className="pressable"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <UserCheck size={14} color="#818cf8" />
                  <span>Cloud Sync</span>
                </button>
              )}
              {onOpenLegalModal && (
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                    onOpenLegalModal();
                  }}
                  className="pressable"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(51, 65, 85, 0.5)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={14} color="#34d399" />
                  <span>Legal & Privacy</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
