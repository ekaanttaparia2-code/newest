import React from 'react';
import { InteractiveOnboardingFlow, type OnboardingProfileData } from '../onboarding/InteractiveOnboardingFlow';

interface WelcomeExplainerProps {
  onContinueToAuth: () => void;
  onQuickStartGuest: () => void;
  onReturnToApp?: () => void;
  onCompleteOnboarding?: (data: OnboardingProfileData) => void;
}

export const WelcomeExplainer: React.FC<WelcomeExplainerProps> = ({
  onContinueToAuth,
  onQuickStartGuest,
  onReturnToApp,
  onCompleteOnboarding
}) => {
  return (
    <InteractiveOnboardingFlow
      onComplete={(data) => {
        if (onCompleteOnboarding) {
          onCompleteOnboarding(data);
        } else {
          onContinueToAuth();
        }
      }}
      onQuickStartGuest={onQuickStartGuest}
      onReturnToApp={onReturnToApp}
    />
  );
};

