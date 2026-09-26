import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  isPrivacyMasked: boolean;
  togglePrivacy: () => void;
  setPrivacyMasked: (val: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMasked, setIsPrivacyMasked] = useState<boolean>(() => {
    const saved = localStorage.getItem('pockettrack_privacy_mode');
    return saved === 'true';
  });

  const togglePrivacy = () => {
    setIsPrivacyMasked(prev => {
      const next = !prev;
      localStorage.setItem('pockettrack_privacy_mode', String(next));
      return next;
    });
  };

  const setPrivacyMasked = (val: boolean) => {
    setIsPrivacyMasked(val);
    localStorage.setItem('pockettrack_privacy_mode', String(val));
  };

  // Keyboard shortcut Ctrl+Shift+P or Cmd+Shift+P to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        togglePrivacy();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PrivacyContext.Provider value={{ isPrivacyMasked, togglePrivacy, setPrivacyMasked }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = (): PrivacyContextType => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
