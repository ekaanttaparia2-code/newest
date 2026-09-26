import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'en' | 'hi' | 'hinglish';

export interface Translations {
  greeting: string;
  appSubtitle: string;
  executiveDashboard: string;
  activityHistory: string;
  accountsVault: string;
  budgetsLimits: string;
  cashFlowInsights: string;
  savingsGoals: string;
  wealthSimulator: string;
  subscriptionsRadar: string;
  netWorth: string;
  liquidAssets: string;
  liabilitiesCards: string;
  incomeThisMonth: string;
  expenseThisMonth: string;
  savingsRate: string;
  voiceLog: string;
  newEntry: string;
  instant1Tap: string;
  quickTapHint: string;
  financialHealth: string;
  healthSubtitle: string;
  loggingStreak: string;
  recentActivity: string;
  recentSubtitle: string;
  viewAll: string;
  monthlyBudgets: string;
  budgetSubtitle: string;
  safeDailySpend: string;
  helpTour: string;
  resetDemo: string;
  privacyOn: string;
  privacyOff: string;
  confirmSave: string;
  cancel: string;
  amount: string;
  account: string;
  category: string;
  notes: string;
  transferFunds: string;
  chaiSnacks: string;
  autoMetro: string;
  swiggyMeal: string;
  kiranaGroceries: string;
  petrolRefill: string;
  movieTicket: string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    greeting: 'Welcome Back 👋',
    appSubtitle: 'Personal Wealth & Cash Flow OS',
    executiveDashboard: 'Executive Dashboard',
    activityHistory: 'Transaction Activity',
    accountsVault: 'Accounts & Vault',
    budgetsLimits: 'Budgets & Limits',
    cashFlowInsights: 'Cash Flow Insights',
    savingsGoals: 'Savings Goals',
    wealthSimulator: 'Wealth & SIP Simulator',
    subscriptionsRadar: 'Subscriptions Radar',
    netWorth: 'Total Net Worth',
    liquidAssets: 'Liquid Assets',
    liabilitiesCards: 'Liabilities & Cards',
    incomeThisMonth: 'Income This Month',
    expenseThisMonth: 'Expense This Month',
    savingsRate: 'Savings Rate',
    voiceLog: 'Voice Log',
    newEntry: 'New Entry',
    instant1Tap: 'Instant 1-Tap Log Bar',
    quickTapHint: '(Zero-friction quick tap)',
    financialHealth: 'Financial Health Index',
    healthSubtitle: 'Real-time Capital Performance',
    loggingStreak: 'Logging Streak',
    recentActivity: 'Recent Activity',
    recentSubtitle: 'Latest logged income, expenses & transfers',
    viewAll: 'View All →',
    monthlyBudgets: 'Monthly Budgets',
    budgetSubtitle: 'Spending limits & current progress',
    safeDailySpend: 'Safe Daily Spend',
    helpTour: 'How to Use / Tour',
    resetDemo: 'Reset Demo Data',
    privacyOn: 'Balances Hidden (Ctrl+Shift+P)',
    privacyOff: 'Hide Balances (Ctrl+Shift+P)',
    confirmSave: 'Confirm & Save',
    cancel: 'Cancel',
    amount: 'Amount',
    account: 'Account',
    category: 'Category',
    notes: 'Description / Note',
    transferFunds: 'Transfer Funds',
    chaiSnacks: 'Chai & Snacks',
    autoMetro: 'Auto / Metro',
    swiggyMeal: 'Swiggy / Meal',
    kiranaGroceries: 'Kirana / Blinkit',
    petrolRefill: 'Petrol Refill',
    movieTicket: 'Movie Ticket'
  },
  hi: {
    greeting: 'नमस्ते! स्वागत है 👋',
    appSubtitle: 'व्यक्तिगत धन और व्यय प्रबंधन',
    executiveDashboard: 'मुख्य डैशबोर्ड',
    activityHistory: 'लेन-देन इतिहास',
    accountsVault: 'बैंक खाते और तिजोरी',
    budgetsLimits: 'बजट और खर्च सीमा',
    cashFlowInsights: 'वित्तीय विश्लेषण',
    savingsGoals: 'बचत लक्ष्य (गोल)',
    wealthSimulator: 'धन वृद्धि और एसआईपी कैलकुलेटर',
    subscriptionsRadar: 'बिल और सब्सक्रिप्शन',
    netWorth: 'कुल संपत्ति (नेट वर्थ)',
    liquidAssets: 'नकद व बैंक जमा',
    liabilitiesCards: 'क्रेडिट कार्ड व ऋण',
    incomeThisMonth: 'इस महीने की आय',
    expenseThisMonth: 'इस महीने का खर्च',
    savingsRate: 'बचत दर',
    voiceLog: 'बोलकर लिखें',
    newEntry: 'नया खर्च जोड़ें',
    instant1Tap: 'त्वरित 1-टैप बार',
    quickTapHint: '(एक क्लिक में बिना टाइप किए जोड़ें)',
    financialHealth: 'वित्तीय स्वास्थ्य स्कोर',
    healthSubtitle: 'पूंजी प्रदर्शन और विश्लेषण',
    loggingStreak: 'लगातार ट्रैकिंग स्ट्रीक',
    recentActivity: 'हाल के लेन-देन',
    recentSubtitle: 'नवीनतम आय, खर्च और ट्रांसफर',
    viewAll: 'सभी देखें →',
    monthlyBudgets: 'मासिक बजट',
    budgetSubtitle: 'खर्च सीमा और वर्तमान स्थिति',
    safeDailySpend: 'सुरक्षित दैनिक खर्च',
    helpTour: 'ऐप गाइड / टूर',
    resetDemo: 'डेमो डेटा रीसेट करें',
    privacyOn: 'रकम छिपी हुई है (Ctrl+Shift+P)',
    privacyOff: 'रकम छिपाएं (Ctrl+Shift+P)',
    confirmSave: 'पुष्टि करें और सहेजें',
    cancel: 'रद्द करें',
    amount: 'राशि',
    account: 'खाता',
    category: 'श्रेणी',
    notes: 'विवरण / नोट',
    transferFunds: 'पैसे ट्रांसफर करें',
    chaiSnacks: 'चाय और नाश्ता',
    autoMetro: 'ऑटो / मेट्रो',
    swiggyMeal: 'स्विगी / भोजन',
    kiranaGroceries: 'किराना / राशन',
    petrolRefill: 'पेट्रोल',
    movieTicket: 'फिल्म टिकट'
  },
  hinglish: {
    greeting: 'Namaste! Welcome back 👋',
    appSubtitle: 'Personal Wealth & Cash Flow OS',
    executiveDashboard: 'Main Dashboard',
    activityHistory: 'Kharcha & Kamai History',
    accountsVault: 'Bank Accounts & Tijori',
    budgetsLimits: 'Monthly Budgets & Limits',
    cashFlowInsights: 'Paisa Kahan Gaya Insights',
    savingsGoals: 'Savings & Dream Goals',
    wealthSimulator: 'SIP & Wealth Calculator',
    subscriptionsRadar: 'OTT & Bills Radar',
    netWorth: 'Total Net Worth (Pura Paisa)',
    liquidAssets: 'Bank & Cash Balance',
    liabilitiesCards: 'Credit Card Udhaari',
    incomeThisMonth: 'Iss Mahine Ki Kamai',
    expenseThisMonth: 'Iss Mahine Ka Kharcha',
    savingsRate: 'Bachat Rate',
    voiceLog: 'Bolkar Likhein',
    newEntry: '+ Naya Kharcha',
    instant1Tap: '1-Tap Quick Kharcha Bar',
    quickTapHint: '(Bina type kiye 1-sec mein log karein)',
    financialHealth: 'Financial Health Score',
    healthSubtitle: 'Aapka Paisa Kaise Perform Kar Raha Hai',
    loggingStreak: 'Daily Tracking Streak',
    recentActivity: 'Haal Ke Transactions',
    recentSubtitle: 'Latest kharche, kamai aur transfers',
    viewAll: 'Sab Dekhein →',
    monthlyBudgets: 'Monthly Budgets',
    budgetSubtitle: 'Kharcha limits aur progress',
    safeDailySpend: 'Daily Safe Kharcha',
    helpTour: 'Kaise Use Karein (Tour)',
    resetDemo: 'Fresh Demo Data',
    privacyOn: 'Balances Hidden (Ctrl+Shift+P)',
    privacyOff: 'Paisa Chhupayein (Ctrl+Shift+P)',
    confirmSave: 'Save Karein',
    cancel: 'Cancel',
    amount: 'Amount (Rupaye)',
    account: 'Account Chunein',
    category: 'Category',
    notes: 'Kiske liye tha?',
    transferFunds: 'Paisa Transfer Karein',
    chaiSnacks: 'Chai & Samosa',
    autoMetro: 'Auto / Metro Fare',
    swiggyMeal: 'Swiggy / Zomato',
    kiranaGroceries: 'Blinkit / Kirana',
    petrolRefill: 'Petrol Refill',
    movieTicket: 'Movie / Cinema'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('pockettrack_lang');
    return (saved as LanguageCode) || 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('pockettrack_lang', lang);
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
