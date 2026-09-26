export const formatCurrency = (
  amount: number,
  currency: string = 'INR',
  isPrivacyMasked: boolean = false
): string => {
  if (isPrivacyMasked) {
    return '••••••';
  }

  const sign = amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount);

  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(absAmount);

  return sign ? `-${formatted}` : formatted;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const formatShortDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  
  return formatShortDate(dateStr);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
