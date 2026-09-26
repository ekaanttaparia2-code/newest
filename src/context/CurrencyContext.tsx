import React, { createContext, useContext, useState } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  setCurrency: (code: CurrencyCode) => void;
  formatAmount: (amount: number, isPrivacyMasked?: boolean) => string;
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('pockettrack_currency');
    return (saved as CurrencyCode) || 'INR';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem('pockettrack_currency', code);
  };

  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  const formatAmount = (amount: number, isPrivacyMasked: boolean = false): string => {
    if (isPrivacyMasked) return '••••••';

    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (currency === 'INR') {
      // Indian numbering system formatting: ₹1,50,000.00
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
      }).format(abs);
      return sign ? `-${formatted}` : formatted;
    }

    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(abs);

    return sign ? `-${formatted}` : formatted;
  };

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
