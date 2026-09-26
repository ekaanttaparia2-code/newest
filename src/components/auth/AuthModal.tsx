import React, { useState } from 'react';
import { X, Mail, Shield, Cloud, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  useModalAccessibility(isOpen, onClose);

  const { isSupabaseConfigured, signInWithEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSentMessage(null);

    const { error } = await signInWithEmail(email.trim());
    setLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Error signing in. Please check your credentials.');
    } else {
      setSentMessage(`Magic sign-in link sent to ${email}. Check your inbox!`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
              <Cloud size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 600 }}>Multi-Device Cloud Sync</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Secure end-to-end cloud backup</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          
          {/* Privacy badge banner */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <Shield size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Offline-First & Private:</strong> PocketTrack saves everything locally on your device in Dexie.js. You can keep using it 100% offline without an account forever!
              </div>
            </div>
          </div>

          {!isSupabaseConfigured ? (
            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', padding: '16px', color: 'var(--text-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-amber)', fontWeight: 600, fontSize: '13px' }}>
                <KeyRound size={16} />
                <span>Supabase Configuration Ready</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your local database is fully operational. To enable cloud multi-device synchronization, add your <code style={{ color: 'var(--accent-emerald-light)' }}>VITE_SUPABASE_URL</code> and <code style={{ color: 'var(--accent-emerald-light)' }}>VITE_SUPABASE_ANON_KEY</code> to your <code style={{ color: 'var(--accent-emerald-light)' }}>.env</code> file.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Your Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>

              {errorMessage && (
                <div style={{ color: 'var(--accent-rose)', fontSize: '13px', marginBottom: '12px' }}>
                  {errorMessage}
                </div>
              )}

              {sentMessage && (
                <div style={{ color: 'var(--accent-emerald-light)', fontSize: '13px', marginBottom: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}>
                  {sentMessage}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Sending Link...' : 'Send Magic Link'}</span>
              </button>
            </form>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ fontSize: '13px', color: 'var(--text-muted)' }}
            >
              Continue in Offline Vault Mode
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
