import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Utensils,
  Receipt,
  Zap,
  TrendingDown,
  ShieldAlert,
  Flame,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { FinnyMascot, type MascotPose, type MascotEmotion } from '../mascot/FinnyMascot';
import { useLanguage, type LanguageCode } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { soundFx } from '../../lib/soundFx';

export interface OnboardingProfileData {
  stressLevel: number;
  triggers: string[];
  primaryGoal: string;
  monthlyIncome: number;
  userName: string;
  startingBalance: number;
  accountName: string;
}

interface InteractiveOnboardingFlowProps {
  onComplete: (data: OnboardingProfileData) => void;
  onQuickStartGuest?: () => void;
  onReturnToApp?: () => void;
}

export const InteractiveOnboardingFlow: React.FC<InteractiveOnboardingFlowProps> = ({
  onComplete,
  onQuickStartGuest: _onQuickStartGuest,
  onReturnToApp
}) => {
  const { language, setLanguage } = useLanguage();
  const { symbol, currency } = useCurrency();

  // Current Slide Step: 0 to 6 (7 total slides)
  const [step, setStep] = useState<number>(0);

  // Questionnaire States
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([
    'online_shopping',
    'food_delivery',
    'hidden_subscriptions'
  ]);
  const [primaryGoal, setPrimaryGoal] = useState<string>('simple_tracking');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(currency === 'INR' ? 50000 : 3500);
  const [userName, setUserName] = useState<string>('My Vault');
  const [startingBalance, setStartingBalance] = useState<number>(currency === 'INR' ? 5000 : 500);
  const [accountName, setAccountName] = useState<string>(
    currency === 'INR' ? 'Primary Bank / UPI' : 'Main Checking'
  );

  // Quick helper income presets (includes student / pocket allowance)
  const quickIncomePresets = currency === 'INR' ? [
    { label: '₹300 (Student / Pocket)', val: 300 },
    { label: '₹15,000', val: 15000 },
    { label: '₹40,000', val: 40000 },
    { label: '₹80,000', val: 80000 },
    { label: '₹1,50,000', val: 150000 }
  ] : [
    { label: '$50 (Student / Pocket)', val: 50 },
    { label: '$800', val: 800 },
    { label: '$2,500', val: 2500 },
    { label: '$5,000', val: 5000 },
    { label: '$10,000', val: 10000 }
  ];

  // Step 4 (Calculation Ring) Animation state
  const [calcProgress, setCalcProgress] = useState<number>(0);
  const [activeChecklistIdx, setActiveChecklistIdx] = useState<number>(0);

  // Run the 0% to 100% calculation animation when entering Step 4
  useEffect(() => {
    if (step === 4) {
      setCalcProgress(0);
      setActiveChecklistIdx(0);

      const interval = setInterval(() => {
        setCalcProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          const next = prev + 2;
          if (next >= 20 && next < 40) setActiveChecklistIdx(1);
          else if (next >= 40 && next < 60) setActiveChecklistIdx(2);
          else if (next >= 60 && next < 85) setActiveChecklistIdx(3);
          else if (next >= 85) setActiveChecklistIdx(4);
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Handle auto-advance from Step 4 to Step 5 once calculation reaches 100%
  useEffect(() => {
    if (step === 4 && calcProgress === 100) {
      const timer = setTimeout(() => {
        soundFx.playLevelUp();
        setStep(5);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, calcProgress]);

  const handleNext = () => {
    soundFx.playPop();
    if (step < 6) {
      setStep(prev => prev + 1);
    } else {
      soundFx.playCashChime();
      onComplete({
        stressLevel,
        triggers: selectedTriggers,
        primaryGoal,
        monthlyIncome,
        userName,
        startingBalance,
        accountName
      });
    }
  };

  const handleBack = () => {
    soundFx.playPop();
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const toggleTrigger = (id: string) => {
    soundFx.playPop();
    setSelectedTriggers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // Color gradient for Stress Slider (1 to 5)
  const getStressDetails = (val: number) => {
    switch (val) {
      case 1:
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          title: language === 'hi' ? 'पूरी तरह नियंत्रण में' : language === 'hinglish' ? 'Full Control Me' : 'In Complete Control',
          desc: language === 'hi' ? 'शून्य तनाव, हर खर्च का हिसाब स्पष्ट है।' : language === 'hinglish' ? 'Zero stress, sab sort hai.' : 'Zero anxiety, intentional spending.'
        };
      case 2:
        return {
          color: '#84cc16',
          bg: 'rgba(132, 204, 22, 0.15)',
          title: language === 'hi' ? 'हल्का तनाव' : language === 'hinglish' ? 'Thoda Stress' : 'Mild Occasional Stress',
          desc: language === 'hi' ? 'कभी-कभी महीने के अंत में चिंता होती है।' : language === 'hinglish' ? 'Month end par thodi dikkat hoti hai.' : 'Occasional month-end budget worries.'
        };
      case 3:
        return {
          color: '#eab308',
          bg: 'rgba(234, 179, 8, 0.15)',
          title: language === 'hi' ? 'मध्यम दबाव' : language === 'hinglish' ? 'Paycheck to Paycheck' : 'Moderate Pressure',
          desc: language === 'hi' ? 'सैलरी आते ही खर्च हो जाती है, बचत कम।' : language === 'hinglish' ? 'Paisa aata hai aur nikal jata hai.' : 'Living month-to-month, savings stall.'
        };
      case 4:
        return {
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.15)',
          title: language === 'hi' ? 'उच्च चिंता' : language === 'hinglish' ? 'Kafi Jyada Tension' : 'High Anxiety',
          desc: language === 'hi' ? 'अचानक बिलों का डर, क्रेडिट कार्ड का बोझ।' : language === 'hinglish' ? 'Emergency aane par tension badh jati hai.' : 'Constant fear of surprise bills or debt.'
        };
      case 5:
      default:
        return {
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          title: language === 'hi' ? 'अत्यधिक तनावग्रस्त' : language === 'hinglish' ? 'Losing Sleep Over Money' : 'Overwhelmed & Sleepless',
          desc: language === 'hi' ? 'पैसे की चिंता में नींद नहीं आती, हर वक्त उलझन।' : language === 'hinglish' ? 'Neend nahi aati kharche ki chinta me.' : 'Money stress affects health and well-being.'
        };
    }
  };

  const stressInfo = getStressDetails(stressLevel);

  // Trigger options with rich context
  const triggerOptions = [
    {
      id: 'online_shopping',
      icon: <ShoppingBag size={18} />,
      title: language === 'hi' ? 'देर रात ऑनलाइन शॉपिंग' : language === 'hinglish' ? 'Late-Night Online Shopping' : 'Late-Night Online Shopping',
      desc: 'Amazon, Flipkart, Myntra impulse buys'
    },
    {
      id: 'food_delivery',
      icon: <Utensils size={18} />,
      title: language === 'hi' ? 'खाना ऑर्डर और रेस्टोरेंट' : language === 'hinglish' ? 'Swiggy/Zomato Food Delivery' : 'Food Delivery & Cafes',
      desc: 'Frequent Swiggy, Zomato, Starbucks orders'
    },
    {
      id: 'hidden_subscriptions',
      icon: <Receipt size={18} />,
      title: language === 'hi' ? 'छिपे हुए सब्सक्रिप्शन' : language === 'hinglish' ? 'Sneaky Auto-Renewals' : 'Hidden Subscriptions & Trials',
      desc: 'Unused streaming, gym & forgotten app trials'
    },
    {
      id: 'micro_spends',
      icon: <Zap size={18} />,
      title: language === 'hi' ? 'छोटे UPI और कैश खर्च' : language === 'hinglish' ? 'Chai & Micro UPI Spends' : 'Untracked Daily Micro-Spends',
      desc: 'Frequent ₹20–₹100 payments that add up'
    },
    {
      id: 'surprise_bills',
      icon: <ShieldAlert size={18} />,
      title: language === 'hi' ? 'अचानक आने वाले खर्चे' : language === 'hinglish' ? 'Surprise Emergency Bills' : 'Surprise Emergency Bills',
      desc: 'Repairs or medical bills wiping out balance'
    },
    {
      id: 'investing_fear',
      icon: <TrendingDown size={18} />,
      title: language === 'hi' ? 'निवेश में असमंजस' : language === 'hinglish' ? 'Investment Confusion' : 'Investment & Compounding Delay',
      desc: 'Not knowing how or where to compound safely'
    }
  ];

  // Primary Goals
  const goalOptions = [
    {
      id: 'simple_tracking',
      icon: <Receipt size={20} color="#34d399" />,
      title:
        language === 'hi'
          ? 'दैनिक खर्च और आय ट्रैकिंग'
          : language === 'hinglish'
          ? 'Simple Daily Expense Tracking'
          : 'Simple Expense & Income Tracking',
      desc:
        language === 'hi'
          ? 'रोजाना के खर्चों का आसान हिसाब, जीरो उलझन।'
          : 'Effortlessly track daily income & expenses with zero complicated jargon.'
    },
    {
      id: 'compound_wealth',
      icon: <TrendingUp size={20} color="#38bdf8" />,
      title:
        language === 'hi'
          ? 'खर्च ट्रैकिंग + वेल्थ कंपाउंडिंग'
          : language === 'hinglish'
          ? 'Track Spends + Compounding Engine'
          : 'Track Spends + Wealth Compounding',
      desc:
        language === 'hi'
          ? 'खर्चों पर लगाम लगाएं और बची रकम को व्यवस्थित रूप से बढ़ाएं।'
          : 'Track where every rupee goes and automate compounding for long-term growth.'
    },
    {
      id: 'emergency_cushion',
      icon: <ShieldAlert size={20} color="#10b981" />,
      title:
        language === 'hi'
          ? 'इमरजेंसी फंड (3-6 महीने)'
          : language === 'hinglish'
          ? 'Emergency Safety Shield (3-6 Mo)'
          : 'Emergency Safety Shield',
      desc: 'Build a bulletproof 3 to 6-month living expense cushion.'
    },
    {
      id: 'crush_debt',
      icon: <CreditCard size={20} color="#ef4444" />,
      title:
        language === 'hi'
          ? 'कर्ज और क्रेडिट कार्ड मुक्ति'
          : language === 'hinglish'
          ? 'Crush High-Interest Debt'
          : 'Crush Debt & Credit Cards',
      desc: 'Avalanche or snowball high APR loans to 0.'
    },
    {
      id: 'fire_freedom',
      icon: <Flame size={20} color="#f59e0b" />,
      title:
        language === 'hi'
          ? 'FIRE (आर्थिक स्वतंत्रता)'
          : language === 'hinglish'
          ? 'FIRE (Financial Freedom Early)'
          : 'FIRE (Financial Independence)',
      desc: 'Accelerate savings rate to retire early or work by choice.'
    }
  ];

  // Dynamic Mascot Pose per Step
  const getMascotPose = (): MascotPose => {
    switch (step) {
      case 0:
        return 'greeting';
      case 1:
        return 'thinking';
      case 2:
        return 'notetaking';
      case 3:
        return 'notetaking';
      case 4:
        return 'calculating';
      case 5:
        return 'greeting';
      case 6:
      default:
        return 'celebrating';
    }
  };

  // Dynamic Mascot Emotion per Step
  // Step 1: 1 -> enjoying, 2 -> smile, 3 -> neutral, 4 -> sad, 5 -> very_sad
  const getMascotEmotion = (): MascotEmotion | undefined => {
    if (step === 1) {
      switch (stressLevel) {
        case 1:
          return 'enjoying';
        case 2:
          return 'smile';
        case 3:
          return 'neutral';
        case 4:
          return 'sad';
        case 5:
          return 'very_sad';
        default:
          return 'neutral';
      }
    }
    if (step === 5 || step === 6) return 'enjoying';
    return undefined;
  };

  // Projected Annual Savings calculation based on triggers & income
  // Accurately scales from ₹300 (students/pocket allowance) to ₹5,00,000+ without random or out-of-scale numbers
  const safeIncome = Math.max(monthlyIncome, 50);
  const leakRate = Math.min(
    0.32,
    Math.max(0.12, selectedTriggers.length * 0.035 + stressLevel * 0.025)
  );
  const estimatedMonthlyLeak = Math.max(
    10,
    Math.round(safeIncome * leakRate)
  );
  const targetMonthlyLeak = Math.max(
    3,
    Math.round(estimatedMonthlyLeak * 0.25)
  );
  const monthlyReclaimed = estimatedMonthlyLeak - targetMonthlyLeak;
  const annualSavings = monthlyReclaimed * 12;
  const freedomMonthsGained = Math.max(
    0.5,
    Math.round((annualSavings / safeIncome) * 10) / 10
  );

  const isLowAllowance = safeIncome <= (currency === 'INR' ? 1500 : 100);
  const leakPercent = Math.round((estimatedMonthlyLeak / safeIncome) * 100);
  const targetPercent = Math.round((targetMonthlyLeak / safeIncome) * 100);
  const leakBarWidth = Math.min(92, Math.max(30, Math.round((leakPercent / 35) * 85)));
  const targetBarWidth = Math.max(10, Math.round(leakBarWidth * 0.28));

  // Checklist items for Step 4
  const checklistItems = [
    { text: 'Reading your financial triggers & stress patterns...', done: activeChecklistIdx >= 0 },
    { text: 'Auditing discretionary leakage points...', done: activeChecklistIdx >= 1 },
    { text: 'Calculating optimal emergency runway margin...', done: activeChecklistIdx >= 2 },
    { text: 'Calibrating 50-30-20 automated envelope limits...', done: activeChecklistIdx >= 3 },
    { text: 'Formulating wealth compounding timeline...', done: activeChecklistIdx >= 4 }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at 50% 15%, #151d30 0%, #070a0f 85%)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 14px 28px 14px',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= TOP NAVIGATION BAR ================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          padding: '4px 0'
        }}
      >
        {/* Left: Back button (visible after step 0) */}
        <div style={{ width: '40px' }}>
          {step > 0 && step !== 4 && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
        </div>

        {/* Center: Segmented Progress Bar */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '4px 6px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6].map(idx => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '999px',
                background:
                  idx <= step
                    ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    : 'rgba(255, 255, 255, 0.12)',
                boxShadow: idx <= step ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Right: Language switch + Return to App / Skip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Language selector chips */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.06)',
              borderRadius: '999px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {(['en', 'hi', 'hinglish'] as LanguageCode[]).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  soundFx.playPop();
                  setLanguage(l);
                }}
                style={{
                  padding: '3px 7px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  background: language === l ? '#10b981' : 'transparent',
                  color: language === l ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'Hi'}
              </button>
            ))}
          </div>

          {onReturnToApp ? (
            <button
              type="button"
              onClick={onReturnToApp}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-emerald-light)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          ) : (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {step + 1} / 7
            </span>
          )}
        </div>
      </div>

      {/* ================= MAIN CONTENT CONTAINER ================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '8px 0'
        }}
      >
        {/* Animated Mascot Finny */}
        <div style={{ marginBottom: step === 4 ? '12px' : '18px' }}>
          <FinnyMascot
            pose={getMascotPose()}
            emotion={getMascotEmotion()}
            size={step === 4 ? 100 : step === 6 ? 130 : 120}
            speechText={
              step === 0
                ? (language === 'hi' ? "नमस्ते! मैं हूँ फ़िनी 👋" : "Hello! I'm Finny 👋")
                : step === 1
                ? stressLevel === 1
                  ? (language === 'hi' ? 'वाह! कोई तनाव नहीं 🌟' : 'Living stress-free! 🌟')
                  : stressLevel === 2
                  ? (language === 'hi' ? 'सब ठीक-ठाक है! 😊' : 'Pretty balanced! 😊')
                  : stressLevel === 3
                  ? (language === 'hi' ? 'शांत चेहरा, सब ठीक करेंगे! 😐' : 'Steady & calm, let’s optimize! 😐')
                  : stressLevel === 4
                  ? (language === 'hi' ? 'चिंता मत करो, मैं हूँ! 😟' : 'I feel that tension... 😟')
                  : (language === 'hi' ? 'परेशान न हों, हम इसे ठीक करेंगे! 🥺' : "Don't worry, I'm here for you! 🥺")
                : step === 2
                ? (language === 'hi' ? 'पैसा कहाँ फिसल जाता है?' : 'Where does it slip away?')
                : step === 3
                ? (language === 'hi' ? 'आपका मुख्य लक्ष्य क्या है?' : "What's the main mission?")
                : step === 4
                ? (language === 'hi' ? 'प्लान तैयार हो रहा है...' : 'Crunching your numbers...')
                : step === 5
                ? (language === 'hi' ? 'देखिये हमने क्या निकाला! 🎉' : 'Look what we found! 🎉')
                : (language === 'hi' ? 'वॉल्ट में स्वागत है! 👑' : 'Ready for takeoff! 👑')
            }
          />
        </div>

        {/* ---------------- SLIDE 0: GREETING & INTRO ---------------- */}
        {step === 0 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h1
              style={{
                fontSize: 'clamp(24px, 4vw, 32px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '10px',
                background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {language === 'hi'
                ? 'नमस्ते! मैं हूँ फ़िनी (Finny)'
                : language === 'hinglish'
                ? 'Hello! Main Hoon Finny'
                : "Hello! I'm Finny"}
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: '440px',
                margin: '0 auto 24px auto'
              }}
            >
              {language === 'hi'
                ? 'आपका निजी वेल्थ साथी। मैं आपके पैसों के छिपे हुए लीक्स को खोजकर बंद करूँगा और आपको वित्तीय आज़ादी तक पहुँचाऊंगा।'
                : language === 'hinglish'
                ? 'Aapka personal wealth dost. Paise kahan nikal jate hain aur unhe bacha kar aage kaise badhein — sab hum milkar fix karenge.'
                : 'Your private financial wingman. Together, we will audit hidden money leaks, kill stress, and build compounding wealth on your terms.'}
            </p>

            <div
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginBottom: '28px',
                background: 'rgba(15, 23, 42, 0.65)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✓
                </div>
                <span>{language === 'hi' ? '100% ऑफलाइन और सुरक्षित (जीरो डेटा शेयरिंग)' : '100% Offline-First (No Bank Passwords Required)'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✓
                </div>
                <span>{language === 'hi' ? '1-टैप वॉयस व क्विक खर्च ट्रैकर' : '1-Tap & Voice Daily Expense Logging'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✓
                </div>
                <span>{language === 'hi' ? 'ऑटोमैटिक 50-30-20 बजट और FIRE कैलकुलेटर' : 'Smart 50-30-20 Envelopes & FIRE Runway'}</span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 1: FINANCIAL STRESS (1–5 COLOR SLIDER) ---------------- */}
        {step === 1 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 26px)',
                fontWeight: 800,
                marginBottom: '10px'
              }}
            >
              {language === 'hi'
                ? 'पैसों से जुड़ा तनाव कितना महसूस होता है?'
                : language === 'hinglish'
                ? 'Money Stress Kitna Feel Hota Hai?'
                : 'How much money stress do you feel?'}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '20px'
              }}
            >
              {language === 'hi'
                ? 'स्लाइडर को एडजस्ट करें — देखें कैसे फ़िनी आपके तनाव स्तर पर तुरंत प्रतिक्रिया देता है!'
                : 'Adjust the slider — watch Finny react to your exact stress level in real-time!'}
            </p>

            {/* Stress Rating Display Card */}
            <div
              style={{
                background: stressInfo.bg,
                border: `1.5px solid ${stressInfo.color}`,
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '20px',
                boxShadow: `0 8px 24px ${stressInfo.bg}`,
                transition: 'all 0.25s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: stressInfo.color }}>
                  {stressLevel} / 5
                </span>
                <span style={{ fontSize: '22px' }}>
                  {stressLevel === 1 ? '🌟' : stressLevel === 2 ? '🙂' : stressLevel === 3 ? '😐' : stressLevel === 4 ? '😟' : '🥺'}
                </span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {stressInfo.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {stressInfo.desc}
              </div>
            </div>

            {/* Enhanced Tactile Range Slider */}
            <div style={{ width: '100%', padding: '0 4px', marginBottom: '18px' }}>
              <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={stressLevel}
                  onChange={e => {
                    soundFx.playPop();
                    setStressLevel(Number(e.target.value));
                  }}
                  style={{
                    width: '100%',
                    height: '14px',
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #10b981 0%, #84cc16 25%, #eab308 50%, #f97316 75%, #ef4444 100%)',
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 12px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.15)'
                  }}
                />
              </div>

              {/* 5 Distinct Emotion Level Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {[
                  { n: 1, emoji: '🌟', label: 'Enjoying' },
                  { n: 2, emoji: '🙂', label: 'Smile' },
                  { n: 3, emoji: '😐', label: 'Steady' },
                  { n: 4, emoji: '😟', label: 'Sad' },
                  { n: 5, emoji: '🥺', label: 'Very Sad' }
                ].map(item => {
                  const isCur = stressLevel === item.n;
                  const details = getStressDetails(item.n);
                  return (
                    <button
                      key={item.n}
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setStressLevel(item.n);
                      }}
                      style={{
                        padding: '10px 2px',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '3px',
                        border: isCur ? `2px solid ${details.color}` : '1px solid rgba(255,255,255,0.08)',
                        background: isCur ? details.bg : 'rgba(15,23,42,0.6)',
                        color: isCur ? '#ffffff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transform: isCur ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: isCur ? `0 4px 14px ${details.bg}` : 'none'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{item.emoji}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isCur ? details.color : 'inherit' }}>
                        {item.n}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 700, opacity: isCur ? 1 : 0.7 }}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 2: MONEY LEAK TRIGGERS (MULTI-SELECT) ---------------- */}
        {step === 2 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: 800,
                marginBottom: '8px'
              }}
            >
              {language === 'hi'
                ? 'पैसा सबसे ज्यादा कहाँ फिसल जाता है?'
                : language === 'hinglish'
                ? 'Paisa Kahan Slip Ho Jata Hai?'
                : 'When does your money slip away the most?'}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '16px'
              }}
            >
              {language === 'hi'
                ? 'वे सभी आदतें चुनें जिनसे आपका बजट बिगड़ता है:'
                : language === 'hinglish'
                ? 'Select all the habits that derail your savings:'
                : 'Select the triggers where your balance tends to vanish:'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '8px',
                maxHeight: '320px',
                overflowY: 'auto',
                padding: '4px',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              {triggerOptions.map(t => {
                const isSelected = selectedTriggers.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTrigger(t.id)}
                    className="pressable"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.14)' : 'rgba(15, 23, 42, 0.65)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#0f172a' : '#94a3b8',
                        marginTop: '2px'
                      }}
                    >
                      {t.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.3 }}>
                        {t.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '4px' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 3: PRIMARY MISSION & GOAL ---------------- */}
        {step === 3 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: 800,
                marginBottom: '8px'
              }}
            >
              {language === 'hi'
                ? 'आपका नंबर 1 लक्ष्य क्या है?'
                : language === 'hinglish'
                ? 'Aapka #1 Financial Goal Kya Hai?'
                : 'What is your #1 financial mission right now?'}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '16px'
              }}
            >
              {language === 'hi'
                ? 'फ़िनी आपके प्लान को इसी लक्ष्य के अनुसार तैयार करेगा:'
                : 'Finny will tailor your envelopes and dashboard to crush this target:'}
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '18px',
                textAlign: 'left'
              }}
            >
              {goalOptions.map(g => {
                const isSelected = primaryGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setPrimaryGoal(g.id);
                    }}
                    className="pressable"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.65)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)' }}>
                      {g.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{g.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="#10b981" />}
                  </button>
                );
              })}
            </div>

            {/* Direct Editable Monthly Income / Pocket Money Input */}
            <div
              className="glass-panel"
              style={{
                padding: '14px 16px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'left',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {language === 'hi' ? 'मासिक आय / पॉकेट मनी' : 'Your Monthly Income or Pocket Allowance:'}
                </label>
                <span style={{ fontSize: '13px', color: 'var(--accent-emerald-light)', fontWeight: 800 }}>
                  {symbol}{monthlyIncome.toLocaleString()} / mo
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                {language === 'hi'
                  ? 'अपनी सटीक रकम लिखें (जैसे छात्र के लिए ₹300 या नौकरीपेशा के लिए ₹50,000) ताकि फ़िनी बिल्कुल सही सीमाएं तय करे।'
                  : 'Write your exact amount (e.g. ₹300 student pocket money, or ₹50,000 salary) so Finny calibrates realistic limits for you.'}
              </p>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: 'var(--accent-emerald-light)'
                  }}
                >
                  {symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={monthlyIncome === 0 ? '' : monthlyIncome}
                  onChange={e => {
                    const parsed = e.target.value === '' ? 0 : Number(e.target.value);
                    setMonthlyIncome(Math.max(0, parsed));
                  }}
                  placeholder={currency === 'INR' ? "e.g. 300 or 50000" : "e.g. 50 or 3500"}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 36px',
                    fontSize: '18px',
                    fontWeight: 800,
                    borderRadius: '12px',
                    background: '#090d16',
                    border: '1.5px solid rgba(16, 185, 129, 0.35)',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Quick preset chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickIncomePresets.map(preset => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      soundFx.playPop();
                      setMonthlyIncome(preset.val);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: monthlyIncome === preset.val ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      background: monthlyIncome === preset.val ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                      color: monthlyIncome === preset.val ? '#34d399' : 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 4: "BUILDING YOUR PERSONALIZED PLAN" (0% → 100% CIRCULAR PROGRESS) ---------------- */}
        {step === 4 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: 800,
                marginBottom: '6px'
              }}
            >
              {language === 'hi'
                ? 'आपका निजी वेल्थ प्लान तैयार हो रहा है...'
                : language === 'hinglish'
                ? 'Building Your Personalized Plan...'
                : 'Building Your Personalized Plan...'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Synthesizing habits, leak detection, and compounding formulas...
            </p>

            {/* Circular Progress Bar (0% to 100%) */}
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px auto' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Animated Progress Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={314.159}
                  strokeDashoffset={314.159 - (314.159 * calcProgress) / 100}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.08s ease',
                    filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))'
                  }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#34d399' }}>
                  {calcProgress}%
                </span>
              </div>
            </div>

            {/* Sequenced Checklist items */}
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              {checklistItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: item.done ? '#ffffff' : 'var(--text-muted)',
                    opacity: item.done ? 1 : 0.4,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: item.done ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)',
                      color: item.done ? '#34d399' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    ✓
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 5: PERSONALIZED WEALTH BLUEPRINT (REVELATION IMPACT) ---------------- */}
        {step === 5 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald-light)',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '10px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <Sparkles size={12} />
              <span>Diagnostic Complete</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 24px)',
                fontWeight: 800,
                marginBottom: '14px'
              }}
            >
              {language === 'hi'
                ? 'आपका वेल्थ ब्लूप्रिंट तैयार है!'
                : language === 'hinglish'
                ? 'Aapka Wealth Blueprint Ready Hai!'
                : 'Your Wealth Blueprint is Ready!'}
            </h2>

            {/* Impact Hero Card */}
            <div
              className="glass-panel"
              style={{
                padding: '18px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 42, 0.7) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                marginBottom: '16px',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {isLowAllowance ? 'Projected Pocket Allowance Reclaimed' : 'Projected Annual Savings Reclaimed'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#34d399', margin: '4px 0' }}>
                {symbol}
                {annualSavings.toLocaleString()}
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}> / year</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {isLowAllowance ? (
                  <>
                    By tracking small daily micro-spends with Finny, you keep{' '}
                    <strong style={{ color: '#ffffff' }}>~{symbol}{monthlyReclaimed.toLocaleString()}/mo</strong> in your pocket — equivalent to{' '}
                    <strong style={{ color: '#34d399' }}>+{freedomMonthsGained} months of extra allowance</strong>!
                  </>
                ) : (
                  <>
                    By plugging {selectedTriggers.length} money leak triggers with Finny's automated limits, you gain back{' '}
                    <strong style={{ color: '#ffffff' }}>+{freedomMonthsGained} months of living runway</strong>!
                  </>
                )}
              </div>

              {/* Goal-Specific Contextual Pill */}
              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '11.5px',
                  lineHeight: 1.4,
                  color: 'var(--text-secondary)'
                }}
              >
                {primaryGoal === 'simple_tracking' && (
                  <span>
                    🎯 <strong>Simple Expense Tracking Active:</strong> Zero complicated formulas — just 1-tap logging to see where every rupee goes and eliminate stress.
                  </span>
                )}
                {primaryGoal === 'compound_wealth' && (
                  <span>
                    📈 <strong>Compounding Engine Active:</strong> Reclaims ~{symbol}{monthlyReclaimed.toLocaleString()}/mo and sets up automatic growth buffers.
                  </span>
                )}
                {primaryGoal === 'emergency_cushion' && (
                  <span>
                    🛡️ <strong>Safety Shield:</strong> Channels your saved cash flow to build a 3–6 month emergency cushion.
                  </span>
                )}
                {primaryGoal === 'crush_debt' && (
                  <span>
                    ⚡ <strong>Debt Crusher:</strong> Accelerates loan and credit card repayment using your ~{symbol}{monthlyReclaimed.toLocaleString()}/mo surplus.
                  </span>
                )}
                {primaryGoal === 'fire_freedom' && (
                  <span>
                    🔥 <strong>FIRE Horizon:</strong> Maximizes your savings rate to shorten your timeline to financial independence.
                  </span>
                )}
              </div>

              {/* Comparison Bars */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#ef4444' }}>Current Untracked Leaks</span>
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>
                      ~{symbol}{estimatedMonthlyLeak.toLocaleString()}/mo ({leakPercent}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ width: `${leakBarWidth}%`, height: '100%', borderRadius: '999px', background: '#ef4444', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#34d399' }}>With Finny Envelopes</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>
                      ~{symbol}{targetMonthlyLeak.toLocaleString()}/mo ({targetPercent}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ width: `${targetBarWidth}%`, height: '100%', borderRadius: '999px', background: '#10b981', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SLIDE 6: ALL SET & ENTER VAULT ---------------- */}
        {step === 6 && (
          <div style={{ width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2
              style={{
                fontSize: 'clamp(20px, 3.5vw, 26px)',
                fontWeight: 800,
                marginBottom: '8px'
              }}
            >
              {language === 'hi'
                ? 'आप पूरी तरह तैयार हैं! 🚀'
                : language === 'hinglish'
                ? 'Aap Pura Set Ho! 🚀'
                : "You're All Set! 🚀"}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '20px'
              }}
            >
              {language === 'hi'
                ? 'अपने वेल्थ वॉल्ट का नाम और शुरुआती बैलेंस सेट करें:'
                : 'Name your personal vault and configure your initial balance:'}
            </p>

            <div
              className="glass-panel"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '20px',
                textAlign: 'left'
              }}
            >
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Your Name / Vault Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="e.g. Kavit's Vault"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Primary Account
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. HDFC Bank"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#090d16',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Starting Balance ({symbol})
                  </label>
                  <input
                    type="number"
                    value={startingBalance}
                    onChange={e => setStartingBalance(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: '#090d16',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM ACTION BAR ================= */}
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginTop: '12px'
        }}
      >
        {step !== 4 && (
          <button
            type="button"
            onClick={handleNext}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: 700,
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
              cursor: 'pointer'
            }}
          >
            <span>
              {step === 0
                ? (language === 'hi' ? 'शुरू करें (Continue)' : 'Continue')
                : step === 1
                ? (language === 'hi' ? 'अगला (Next)' : 'Continue')
                : step === 2
                ? (language === 'hi' ? `आगे बढ़ें (${selectedTriggers.length} चुने गए)` : `Continue (${selectedTriggers.length} selected)`)
                : step === 3
                ? (language === 'hi' ? 'मेरा प्लान तैयार करें' : 'Build My Personalized Plan')
                : step === 5
                ? (language === 'hi' ? 'ब्लूप्रिंट स्वीकारें और वॉल्ट सेट करें' : 'Claim Blueprint & Set Up Vault')
                : (language === 'hi' ? 'वॉल्ट में प्रवेश करें' : 'Start Tracking in My Vault')}
            </span>
            <ArrowRight size={18} />
          </button>
        )}

        {/* Bottom privacy badge */}

        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
          100% Offline-First • Local Storage Encryption • Zero Telemetry
        </div>
      </div>
    </div>
  );
};
