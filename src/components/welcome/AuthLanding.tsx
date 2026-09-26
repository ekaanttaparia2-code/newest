import React, { useState } from 'react';
import { Shield, ArrowRight, ArrowLeft, Mail, User, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useLanguage } from '../../context/LanguageContext';
import { soundFx } from '../../lib/soundFx';

interface AuthLandingProps {
  onBackToExplainer: () => void;
  onEnterApp: (userData: { name: string; startingBalance: number; accountName: string }) => Promise<void>;
  onReturnToApp?: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onBackToExplainer,
  onEnterApp,
  onReturnToApp
}) => {
  const { isSupabaseConfigured, signInWithEmail } = useAuth();
  const { symbol } = useCurrency();
  const { language } = useLanguage();

  const [authMode, setAuthMode] = useState<'offline' | 'cloud'>('offline');
  const [userName, setUserName] = useState<string>('');
  const [accountType, setAccountType] = useState<string>('UPI & Cash');
  const [initialBalance, setInitialBalance] = useState<string>('2000');
  const [email, setEmail] = useState<string>('');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (authMode === 'cloud' && email.trim() && isSupabaseConfigured) {
      await signInWithEmail(email.trim());
      setEmailSent(true);
    }

    soundFx.playLevelUp();
    await onEnterApp({
      name: userName.trim() || (language === 'hi' ? 'उपयोगकर्ता' : 'User'),
      startingBalance: parseFloat(initialBalance) || 0,
      accountName: accountType
    });

    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle at 50% 20%, #151d30 0%, #080b11 80%)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px'
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%' }}>
        
        {/* Top Navigation Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={onBackToExplainer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'hi' ? 'वापस जाएं' : 'Back to Overview'}</span>
          </button>

          {onReturnToApp && (
            <button
              type="button"
              onClick={onReturnToApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: 'var(--accent-emerald-light)',
                borderRadius: '999px',
                padding: '6px 14px',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>{language === 'hi' ? 'वॉल्ट पर वापस जाएं' : language === 'hinglish' ? 'Wapas Vault Me Jayein' : 'Back to My Vault'}</span>
            </button>
          )}
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '32px 28px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}
            >
              <Shield size={26} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>
              {language === 'hi' ? 'अपनी निजी तिजोरी सेट करें' : language === 'hinglish' ? 'Apna Personal Vault Setup Karein' : 'Set Up Your Private Vault'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {language === 'hi' 
                ? 'कोई पूर्व-निर्मित फर्जी डेटा नहीं। अपना वास्तविक बैलेंस जोड़ें।' 
                : language === 'hinglish'
                ? 'No fake data. Apna real starting balance enter karein.'
                : 'Clean slate. Add your starting balance to begin.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setAuthMode('offline');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                color: authMode === 'offline' ? '#fff' : 'var(--text-muted)',
                background: authMode === 'offline' ? 'var(--accent-emerald-dark)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              🔒 {language === 'hi' ? 'ऑफलाइन मोड (अनुशंसित)' : 'Offline Vault (Instant)'}
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playPop();
                setAuthMode('cloud');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                color: authMode === 'cloud' ? '#fff' : 'var(--text-muted)',
                background: authMode === 'cloud' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              ☁️ {language === 'hi' ? 'क्लाउड सिंक' : 'Cloud Sync (Email)'}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            
            {/* User Name */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">{language === 'hi' ? 'आपका नाम' : 'Your Name'}</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul, Priya, Alex"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
            </div>

            {/* If Cloud Auth Mode */}
            {authMode === 'cloud' && (
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Email (for Multi-Device Sync)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required={authMode === 'cloud'}
                  />
                </div>
                {emailSent && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald-light)', fontSize: '12px', marginTop: '6px' }}>
                    <Check size={14} />
                    <span>Sync confirmation sent to {email}!</span>
                  </div>
                )}
              </div>
            )}

            {/* Starting Account Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">{language === 'hi' ? 'पहला खाता' : 'First Account'}</label>
                <select
                  className="form-select"
                  value={accountType}
                  onChange={e => setAccountType(e.target.value)}
                >
                  <option value="UPI & Cash">UPI & Cash Wallet</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="SBI Account">SBI Account</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Primary Checking">Primary Checking</option>
                </select>
              </div>

              <div>
                <label className="form-label">{language === 'hi' ? 'शुरुआती बैलेंस' : 'Starting Balance'}</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--accent-emerald-light)' }}>
                    {symbol}
                  </span>
                  <input
                    type="number"
                    step="1"
                    className="form-input font-mono"
                    placeholder="0"
                    value={initialBalance}
                    onChange={e => setInitialBalance(e.target.value)}
                    style={{ paddingLeft: '28px', fontWeight: 700 }}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '15px' }}
            >
              <span>{language === 'hi' ? 'तिजोरी खोलें और शुरू करें' : language === 'hinglish' ? 'Vault Kholein & Shuru Karein' : 'Open Vault & Enter App'}</span>
              <ArrowRight size={16} />
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};
