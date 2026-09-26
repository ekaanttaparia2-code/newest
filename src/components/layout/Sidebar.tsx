import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  PieChart,
  TrendingUp,
  Target,
  Calculator,
  TrendingDown,
  Flame,
  Calendar,
  Shield,
  ShieldCheck,
  Sparkles,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard' 
  | 'transactions' 
  | 'accounts' 
  | 'budgets' 
  | 'analytics' 
  | 'goals' 
  | 'simulator' 
  | 'debt'
  | 'fire'
  | 'subscriptions';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAuthModal: () => void;
  onOpenLegalModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuthModal,
  onOpenLegalModal
}) => {
  const { user, isGuest, signOut } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'transactions', label: 'Transaction Activity', icon: <Receipt size={18} /> },
    { id: 'accounts', label: 'Accounts & Vault', icon: <Landmark size={18} /> },
    { id: 'budgets', label: 'Budgets & Limits', icon: <PieChart size={18} /> },
    { id: 'analytics', label: 'Cash Flow Insights', icon: <TrendingUp size={18} /> },
    { id: 'goals', label: 'Savings Goals', icon: <Target size={18} />, badge: 'New' },
    { id: 'simulator', label: 'Wealth & SIP Simulator', icon: <Calculator size={18} />, badge: 'Lab' },
    { id: 'debt', label: 'Debt Payoff Planner', icon: <TrendingDown size={18} />, badge: 'Payoff' },
    { id: 'fire', label: 'FIRE & Runway Horizon', icon: <Flame size={18} />, badge: 'Freedom' },
    { id: 'subscriptions', label: 'Subscriptions Radar', icon: <Calendar size={18} /> },
  ];

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        flexShrink: 0
      }}
    >
      <div>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px 8px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 20px -2px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              PocketTrack
            </div>
            <div style={{ fontSize: '10px', color: 'var(--accent-emerald-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Personal Wealth OS
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-medium)' : 'transparent'}`,
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: isActive ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      fontSize: '9px',
                      textTransform: 'uppercase',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      background: item.badge === 'Lab' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: item.badge === 'Lab' ? '#38bdf8' : 'var(--accent-emerald-light)',
                      fontWeight: 700
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Account / Sync Status Card at bottom */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isGuest ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isGuest ? 'var(--accent-amber)' : 'var(--accent-emerald)'
            }}
          >
            {isGuest ? <Shield size={14} /> : <UserCheck size={14} />}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {isGuest ? 'Local Offline Vault' : (user?.email || 'Authenticated')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {isGuest ? 'Private on this device' : 'Encrypted cloud backup'}
            </div>
          </div>
        </div>

        {isGuest ? (
          <button
            type="button"
            onClick={onOpenAuthModal}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: 600,
              padding: '5px 8px',
              borderRadius: '6px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={12} color="var(--accent-emerald)" />
            Enable Cloud Backup
          </button>
        ) : (
          <button
            type="button"
            onClick={signOut}
            style={{
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '11px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <LogOut size={12} />
            Sign Out
          </button>
        )}

        {onOpenLegalModal && (
          <button
            type="button"
            onClick={onOpenLegalModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-faint)',
              fontSize: '10.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              paddingTop: '4px',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-emerald-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
          >
            <ShieldCheck size={12} />
            <span>Legal & Privacy Shield</span>
          </button>
        )}
      </div>

    </aside>
  );
};
