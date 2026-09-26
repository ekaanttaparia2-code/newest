import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Mic, Zap, EyeOff, Target, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { soundFx } from '../../lib/soundFx';
import confetti from 'canvas-confetti';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<number>(0);

  useModalAccessibility(isOpen, onClose);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <ShieldCheck size={36} color="#10b981" />,
      badge: 'Welcome to PocketTrack',
      title: language === 'hi' 
        ? 'आपका व्यक्तिगत धन और व्यय प्रबंधक' 
        : language === 'hinglish' 
        ? 'Aapka Private Paisa & Kharcha Manager' 
        : 'Your Private Financial Command Center',
      desc: language === 'hi'
        ? 'पॉकेटट्रैक पूरी तरह से ऑफलाइन काम करता है। आपका डेटा आपके डिवाइस पर 100% सुरक्षित रहता है बिना किसी ट्रैकिंग के।'
        : language === 'hinglish'
        ? 'PocketTrack bina internet ke bhi 100% chalta hai. Aapka data kisi ko nahi jata, pura secure aapke phone/laptop par rehta hai.'
        : 'PocketTrack works completely offline with zero tracking. Your accounts, net worth, and statements stay securely on your device.'
    },
    {
      icon: <Zap size={36} color="#f59e0b" />,
      badge: '1-Second Logging',
      title: language === 'hi'
        ? 'त्वरित 1-टैप बार (बिना टाइप किए)'
        : language === 'hinglish'
        ? '1-Tap Quick Kharcha (Chai, Auto, Swiggy)'
        : 'Instant 1-Tap Log Bar',
      desc: language === 'hi'
        ? 'दुकान से निकलते ही डैशबोर्ड के ऊपर ☕ चाय ₹20 या 🛺 ऑटो ₹80 पर सिर्फ एक क्लिक करें — खर्च तुरंत दर्ज हो जाएगा!'
        : language === 'hinglish'
        ? 'Dukaan se nikalte hi dashboard par ☕ Chai ₹20 ya 🛺 Auto ₹80 par bas 1 tap karein — bina kuch type kiye kharcha save ho jayega!'
        : 'Heading out from a cafe? Tap the ☕ Chai ₹20 or 🛺 Auto ₹80 chips right on the dashboard to log in a single millisecond.'
    },
    {
      icon: <Mic size={36} color="#10b981" />,
      badge: 'Magic Voice Logging',
      title: language === 'hi'
        ? 'बोलकर खर्च लिखें (हिंदी या अंग्रेजी)'
        : language === 'hinglish'
        ? 'Bolkar Kharcha Likhein'
        : 'Hands-Free Voice Recognition',
      desc: language === 'hi'
        ? 'माइक दबाएं और बोलें: "चाय 20 रुपये कैश से" या "स्विगी 350 रुपये कार्ड से"। ऐप अपने आप रकम, श्रेणी और खाता पहचान लेगा!'
        : language === 'hinglish'
        ? 'Mic dabayein aur bolein: "Chai 20 rupaye cash se" ya "Swiggy 350 card se". App apne aap amount aur category pehchan lega!'
        : 'Tap the mic and speak naturally: "Spent 20 rupees on chai with cash". The smart parser extracts amount, category, and account automatically.'
    },
    {
      icon: <EyeOff size={36} color="#f43f5e" />,
      badge: 'Public Discretion',
      title: language === 'hi'
        ? 'प्राइवेसी मोड (रकम छिपाएं)'
        : language === 'hinglish'
        ? 'Privacy Mode (Paisa Chhupayein)'
        : 'Privacy & Incognito Mode',
      desc: language === 'hi'
        ? 'मेट्रो या भीड़ में अपनी रकम छिपाने के लिए कीबोर्ड पर Ctrl+Shift+P दबाएं या ऊपर आंख के आइकन पर क्लिक करें।'
        : language === 'hinglish'
        ? 'Metro ya bheed mein apna balance chhupane ke liye Ctrl+Shift+P dabayein ya upar Eye icon click karein.'
        : 'In public or on a train? Press Ctrl+Shift+P or click the Eye icon in the header to instantly blur all sensitive monetary balances.'
    },
    {
      icon: <Target size={36} color="#38bdf8" />,
      badge: 'Wealth & Goals',
      title: language === 'hi'
        ? 'बचत लक्ष्य और एसआईपी सिम्युलेटर'
        : language === 'hinglish'
        ? 'Dream Goals & Compound Simulator'
        : 'Compound Interest & Goals Lab',
      desc: language === 'hi'
        ? 'गोवा ट्रिप या आपातकालीन फंड के लिए लक्ष्य बनाएं, और एसआईपी सिम्युलेटर से देखें कि हर महीने ₹15,000 कैसे करोड़ों में बदल सकते हैं!'
        : language === 'hinglish'
        ? 'Emergency Fund ya Vacation ke liye goals banayein, aur SIP Simulator mein dekhein ki monthly ₹15k kaise crore ban sakta hai!'
        : 'Set sinking funds for your dream vacation or new laptop, and use the Wealth Simulator to visualize compound growth over 10 years.'
    }
  ];

  const handleNext = () => {
    soundFx.playPop();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      soundFx.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
      localStorage.setItem('pockettrack_tour_completed', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    soundFx.playPop();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', overflow: 'hidden' }}>
        
        {/* Progress header bar */}
        <div style={{ height: '4px', width: '100%', background: 'rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #38bdf8 100%)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        <div style={{ padding: '32px 28px', textAlign: 'center' }}>
          
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-12px', marginRight: '-8px' }}>
            <button className="btn-icon" onClick={onClose} style={{ width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>

          {/* Icon visual */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.5)'
            }}
          >
            {step.icon}
          </div>

          {/* Badge */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-emerald-light)',
              padding: '4px 10px',
              borderRadius: '999px',
              display: 'inline-block',
              marginBottom: '10px'
            }}
          >
            Step {currentStep + 1} of {steps.length}: {step.badge}
          </span>

          {/* Title & Description */}
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.3 }}>
            {step.title}
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '28px', minHeight: '66px' }}>
            {step.desc}
          </p>

          {/* Dots Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
            {steps.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: idx === currentStep ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '999px',
                  background: idx === currentStep ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {currentStep > 0 ? (
              <button type="button" className="btn-secondary" onClick={handlePrev}>
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('pockettrack_tour_completed', 'true');
                  onClose();
                }}
                style={{ fontSize: '13px', color: 'var(--text-muted)' }}
              >
                Skip Tour
              </button>
            )}

            <button type="button" className="btn-primary" onClick={handleNext} style={{ minWidth: '130px' }}>
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
              {currentStep === steps.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
