import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileFrameWrapperProps {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const MobileFrameWrapper: React.FC<MobileFrameWrapperProps> = ({ isMobileFrame, children }) => {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1024;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If mobile frame is off OR if user is already on a small mobile device (<= 640px),
  // render children natively full-screen without the mock phone bezel!
  if (!isMobileFrame || windowWidth <= 640) {
    return <>{children}</>;
  }

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(circle at 50% 30%, #171f33 0%, #080b11 100%)',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Smartphone Device Frame */}
      <div
        style={{
          width: '395px',
          height: 'min(844px, 94vh)',
          background: '#080b11',
          borderRadius: '46px',
          border: '10px solid #1e293b',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 2px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Smartphone Notch / Dynamic Island */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '105px',
            height: '22px',
            background: '#000000',
            borderRadius: '20px',
            zIndex: 105,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1e293b' }} />
        </div>

        {/* Mobile Status Bar */}
        <div
          style={{
            height: '38px',
            padding: '8px 20px 0 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 700,
            color: '#f8fafc',
            zIndex: 100,
            flexShrink: 0
          }}
        >
          <span>{timeStr}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800 }}>5G</span>
            <Wifi size={12} />
            <Battery size={14} />
          </div>
        </div>

        {/* Inner App Container */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            maxHeight: '100%'
          }}
        >
          {children}
        </div>

        {/* Mobile Home Bar Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '999px',
            zIndex: 110,
            pointerEvents: 'none'
          }}
        />

      </div>
    </div>
  );
};
