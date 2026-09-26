import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mic,
  Plus,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  HelpCircle,
  Smartphone,
  Monitor,
  MoreVertical,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useCurrency, type CurrencyCode } from '../../context/CurrencyContext';
import { useLanguage, type LanguageCode } from '../../context/LanguageContext';
import { soundFx } from '../../lib/soundFx';
import { db } from '../../db';

interface HeaderProps {
  onOpenVoiceModal: () => void;
  onOpenTransactionModal: () => void;
  onOpenTour: () => void;
  onReopenExplainer: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  pageTitle: string;
  onOpenLegalModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoiceModal,
  onOpenTransactionModal,
  onOpenTour,
  onReopenExplainer,
  isMobileFrame,
  onToggleMobileFrame,
  pageTitle,
  onOpenLegalModal
}) => {
  const { isPrivacyMasked, togglePrivacy } = usePrivacy();
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundFx.enabled);
  const [currencyOpen, setCurrencyOpen] = useState<boolean>(false);
  const [langOpen, setLangOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);

  const toggleSound = () => {
    soundFx.enabled = !soundFx.enabled;
    setSoundEnabled(soundFx.enabled);
    if (soundFx.enabled) soundFx.playPop();
  };

  const handleResetData = async () => {
    if (window.confirm('Reset vault to clean slate with 0 transactions?')) {
      await db.resetToCleanVault();
      soundFx.playCashChime();
      window.location.reload();
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobileFrame ? '10px 12px' : '14px 28px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 80,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Title / Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
        {isMobileFrame && (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Sparkles size={14} />
          </div>
        )}
        <h1
          style={{
            fontSize: isMobileFrame ? '15px' : '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobileFrame ? '4px' : '8px',
        flexShrink: 1,
        minWidth: 0,
        flexWrap: isMobileFrame ? 'wrap' : 'nowrap',
        justifyContent: 'flex-end'
      }}>
        
        {/* Phone View Simulator Toggle */}
        <button
          type="button"
          onClick={onToggleMobileFrame}
          className="btn-secondary"
          style={{
            padding: isMobileFrame ? '4px 6px' : '6px 10px',
            fontSize: '11px',
            fontWeight: 600,
            color: isMobileFrame ? 'var(--accent-emerald-light)' : 'var(--text-secondary)'
          }}
          title={isMobileFrame ? 'Switch to Full Desktop View' : 'Preview as Mobile Smartphone App'}
        >
          {isMobileFrame ? <Monitor size={13} /> : <Smartphone size={13} />}
          {!isMobileFrame && <span>Phone</span>}
        </button>

        {/* Currency Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCurrencyOpen(!currencyOpen);
              setLangOpen(false);
              setMoreMenuOpen(false);
            }}
            style={{
              padding: isMobileFrame ? '4px 6px' : '6px 10px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--accent-emerald-light)',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            }}
          >
            {isMobileFrame
              ? (currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£')
              : (currency === 'INR' ? '₹ INR' : currency === 'USD' ? '$ USD' : currency === 'EUR' ? '€ EUR' : '£ GBP')
            }
          </button>

          {currencyOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#121827',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '4px',
                zIndex: 150,
                boxShadow: 'var(--shadow-lg)',
                minWidth: '110px'
              }}
            >
              {(['INR', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setCurrency(c);
                    setCurrencyOpen(false);
                    soundFx.playPop();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    color: currency === c ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
                    background: currency === c ? 'rgba(16, 185, 129, 0.12)' : 'transparent'
                  }}
                >
                  {c === 'INR' ? '₹ Rupee' : c === 'USD' ? '$ Dollar' : c === 'EUR' ? '€ Euro' : '£ Pound'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setLangOpen(!langOpen);
              setCurrencyOpen(false);
              setMoreMenuOpen(false);
            }}
            style={{
              padding: isMobileFrame ? '4px 6px' : '6px 10px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Change Language"
          >
            <Globe size={isMobileFrame ? 11 : 12} color="var(--accent-emerald)" />
            <span>{isMobileFrame ? (language === 'hi' ? 'हि' : language === 'hinglish' ? 'Hi' : 'En') : (language === 'hi' ? 'हिन्दी' : language === 'hinglish' ? 'Hinglish' : 'Eng')}</span>
          </button>

          {langOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#121827',
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '4px',
                zIndex: 150,
                boxShadow: 'var(--shadow-lg)',
                minWidth: '120px'
              }}
            >
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी (Hindi)' },
                { code: 'hinglish', label: 'Hinglish' }
              ].map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguage(l.code as LanguageCode);
                    setLangOpen(false);
                    soundFx.playPop();
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    color: language === l.code ? 'var(--accent-emerald-light)' : 'var(--text-secondary)',
                    background: language === l.code ? 'rgba(16, 185, 129, 0.12)' : 'transparent'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* If Compact / Mobile Mode: Render sleek More Menu button to prevent header clutter */}
        {isMobileFrame ? (
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => {
                setMoreMenuOpen(!moreMenuOpen);
                setCurrencyOpen(false);
                setLangOpen(false);
              }}
              style={{ width: '30px', height: '30px' }}
              title="Quick Options"
            >
              <MoreVertical size={14} />
            </button>

            {moreMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: '#101524',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  padding: '6px',
                  zIndex: 160,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  minWidth: '170px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    togglePrivacy();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isPrivacyMasked ? 'var(--accent-rose-light)' : 'var(--text-primary)',
                    borderRadius: '6px'
                  }}
                >
                  {isPrivacyMasked ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{isPrivacyMasked ? 'Reveal Balances' : 'Mask Balances'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleSound();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRadius: '6px'
                  }}
                >
                  {soundEnabled ? <Volume2 size={14} color="var(--accent-emerald)" /> : <VolumeX size={14} color="var(--text-muted)" />}
                  <span>{soundEnabled ? 'Audio FX: On' : 'Audio FX: Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onReopenExplainer();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-emerald-light)',
                    borderRadius: '6px'
                  }}
                >
                  <Sparkles size={14} color="var(--accent-emerald-light)" />
                  <span>Meet Finny (Assessment)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onOpenTour();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderRadius: '6px'
                  }}
                >
                  <HelpCircle size={14} color="var(--accent-emerald-light)" />
                  <span>Guided Tour</span>
                </button>

                {onOpenLegalModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenLegalModal();
                      setMoreMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      borderRadius: '6px'
                    }}
                  >
                    <ShieldCheck size={14} color="var(--accent-emerald-light)" />
                    <span>Legal & Privacy Shield</span>
                  </button>
                )}

                <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    handleResetData();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--accent-rose-light)',
                    borderRadius: '6px'
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset to Clean Slate</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Desktop View: Full horizontal buttons */
          <>
            <button
              className="btn-secondary"
              onClick={() => {
                soundFx.playPop();
                onReopenExplainer();
              }}
              title="Meet Finny & Retake Personalized Assessment"
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.12)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: 'var(--accent-emerald-light)'
              }}
            >
              <Sparkles size={13} color="var(--accent-emerald-light)" />
              <span className="hide-on-small">{language === 'hi' ? 'फ़िनी (Finny)' : 'Meet Finny'}</span>
            </button>

            <button
              className="btn-icon"
              onClick={() => {
                soundFx.playPop();
                onOpenTour();
              }}
              title={t.helpTour}
              style={{ width: '34px', height: '34px', color: 'var(--accent-emerald-light)' }}
            >
              <HelpCircle size={16} />
            </button>

            <button
              className="btn-icon"
              onClick={toggleSound}
              title={soundEnabled ? 'Audio FX Enabled' : 'Audio FX Muted'}
              style={{ width: '34px', height: '34px' }}
            >
              {soundEnabled ? <Volume2 size={15} color="var(--accent-emerald)" /> : <VolumeX size={15} color="var(--text-muted)" />}
            </button>

            <button
              className="btn-icon"
              onClick={handleResetData}
              title="Reset to clean vault"
              style={{ width: '34px', height: '34px' }}
            >
              <RotateCcw size={15} />
            </button>

            <button
              className="btn-icon"
              onClick={togglePrivacy}
              title={isPrivacyMasked ? t.privacyOn : t.privacyOff}
              style={{
                width: '34px',
                height: '34px',
                color: isPrivacyMasked ? 'var(--accent-rose-light)' : 'var(--text-secondary)',
                borderColor: isPrivacyMasked ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)',
                background: isPrivacyMasked ? 'rgba(244, 63, 94, 0.1)' : 'var(--bg-surface-elevated)'
              }}
            >
              {isPrivacyMasked ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>

            <button
              className="btn-secondary"
              onClick={() => {
                soundFx.playPop();
                onOpenVoiceModal();
              }}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-emerald-light)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                padding: '7px 12px',
                fontSize: '12px'
              }}
            >
              <Mic size={14} />
              <span style={{ fontWeight: 600 }}>{t.voiceLog}</span>
            </button>

            <button
              className="btn-primary"
              onClick={() => {
                soundFx.playPop();
                onOpenTransactionModal();
              }}
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <Plus size={14} />
              <span>{t.newEntry}</span>
            </button>
          </>
        )}

      </div>
    </header>
  );
};
