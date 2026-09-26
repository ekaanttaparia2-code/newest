import React from 'react';

export type MascotPose = 'greeting' | 'notetaking' | 'thinking' | 'calculating' | 'celebrating';
export type MascotEmotion = 'enjoying' | 'smile' | 'neutral' | 'sad' | 'very_sad';

interface FinnyMascotProps {
  pose?: MascotPose;
  emotion?: MascotEmotion;
  size?: number;
  className?: string;
  speechText?: string;
}

export const FinnyMascot: React.FC<FinnyMascotProps> = ({
  pose = 'greeting',
  emotion,
  size = 140,
  className = '',
  speechText
}) => {
  return (
    <div
      className={`finny-mascot-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
    >
      {/* Optional floating speech bubble */}
      {speechText && (
        <div
          style={{
            position: 'absolute',
            top: '-28px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--accent-emerald-light, #34d399)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            animation: 'finnyFloat 3s ease-in-out infinite',
            zIndex: 5
          }}
        >
          {speechText}
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid rgba(16, 185, 129, 0.5)'
            }}
          />
        </div>
      )}

      {/* SVG Mascot Character */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 10px 24px rgba(16, 185, 129, 0.35))',
          animation: 'finnyBreathe 4s ease-in-out infinite',
          overflow: 'visible'
        }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="finnyBodyGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="finnyBellyGrad" x1="45" y1="70" x2="115" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="finnyEarGrad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="finnyCrownGrad" x1="0" y1="0" x2="50" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          <linearGradient id="finnyCoinGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <filter id="finnyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style>
          {`
            @keyframes finnyBreathe {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-4px) scale(1.02); }
            }
            @keyframes finnyFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-3px); }
            }
            @keyframes finnyWave {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(-18deg); }
              75% { transform: rotate(14deg); }
            }
            @keyframes finnyBlink {
              0%, 96%, 100% { transform: scaleY(1); }
              98% { transform: scaleY(0.1); }
            }
            @keyframes finnySparkle {
              0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
              50% { opacity: 1; transform: scale(1.2) rotate(45deg); }
            }
          `}
        </style>

        {/* Soft ground shadow */}
        <ellipse cx="80" cy="148" rx="42" ry="7" fill="rgba(0,0,0,0.35)" />

        {/* ================= THRONED CHAIR (Pose: Celebrating) ================= */}
        {pose === 'celebrating' && (
          <g id="finnyThrone">
            {/* Throne Backrest */}
            <rect x="36" y="44" width="88" height="96" rx="16" fill="#1e1b4b" stroke="#6366f1" strokeWidth="3" />
            <rect x="44" y="52" width="72" height="80" rx="10" fill="#312e81" opacity="0.6" />
            <circle cx="80" cy="44" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            {/* Throne Armrests */}
            <rect x="26" y="96" width="16" height="42" rx="6" fill="#4338ca" stroke="#6366f1" strokeWidth="2" />
            <rect x="118" y="96" width="16" height="42" rx="6" fill="#4338ca" stroke="#6366f1" strokeWidth="2" />
            <circle cx="34" cy="96" r="6" fill="#fbbf24" />
            <circle cx="126" cy="96" r="6" fill="#fbbf24" />
          </g>
        )}

        {/* ================= EARS / ANTENNAS ================= */}
        <g id="finnyEars">
          {/* Left Ear */}
          <ellipse cx="50" cy="40" rx="14" ry="20" fill="url(#finnyBodyGrad)" transform="rotate(-18 50 40)" />
          <ellipse cx="51" cy="41" rx="8" ry="12" fill="url(#finnyEarGrad)" transform="rotate(-18 51 41)" />
          {/* Right Ear */}
          <ellipse cx="110" cy="40" rx="14" ry="20" fill="url(#finnyBodyGrad)" transform="rotate(18 110 40)" />
          <ellipse cx="109" cy="41" rx="8" ry="12" fill="url(#finnyEarGrad)" transform="rotate(18 109 41)" />

          {/* Golden Antenna Tip Bulb */}
          <circle cx="80" cy="24" r="5" fill="#fde047" filter="url(#finnyGlow)" />
          <path d="M80 28 L80 38" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* ================= MAIN ROUND CHUBBY BODY ================= */}
        <g id="finnyBody">
          {/* Main Body */}
          <ellipse cx="80" cy="92" rx="52" ry="48" fill="url(#finnyBodyGrad)" />
          {/* Belly Patch */}
          <ellipse cx="80" cy="98" rx="34" ry="30" fill="url(#finnyBellyGrad)" opacity="0.9" />

          {/* Little Tech Circuit Line on Belly */}
          <path
            d="M68 96 L74 96 L78 102 L86 102 L90 96 L94 96"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="80" cy="112" r="3" fill="#ffffff" opacity="0.6" />
        </g>

        {/* ================= FEET ================= */}
        <g id="finnyFeet">
          <ellipse cx="62" cy="138" rx="14" ry="7" fill="#047857" />
          <ellipse cx="98" cy="138" rx="14" ry="7" fill="#047857" />
        </g>

        {/* ================= FACE & EXPRESSIVE EYES ================= */}
        {/* ================= FACE & EXPRESSIVE EYES ================= */}
        <g id="finnyFace">
          {/* Eyebrows (Dynamic based on emotion) */}
          {emotion === 'enjoying' && (
            <g stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M56 64 Q63 58 70 64" />
              <path d="M90 64 Q97 58 104 64" />
            </g>
          )}
          {emotion === 'smile' && (
            <g stroke="#061a14" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M58 66 Q64 63 70 66" />
              <path d="M90 66 Q96 63 102 66" />
            </g>
          )}
          {emotion === 'neutral' && (
            <g stroke="#061a14" strokeWidth="2" strokeLinecap="round">
              <line x1="58" y1="67" x2="69" y2="67" />
              <line x1="91" y1="67" x2="102" y2="67" />
            </g>
          )}
          {emotion === 'sad' && (
            <g stroke="#061a14" strokeWidth="2.5" strokeLinecap="round">
              <line x1="57" y1="70" x2="68" y2="64" />
              <line x1="92" y1="64" x2="103" y2="70" />
            </g>
          )}
          {emotion === 'very_sad' && (
            <g stroke="#061a14" strokeWidth="3" strokeLinecap="round">
              <line x1="55" y1="72" x2="69" y2="62" />
              <line x1="91" y1="62" x2="105" y2="72" />
            </g>
          )}

          {/* Cheeks */}
          <circle
            cx="55"
            cy="88"
            r={emotion === 'enjoying' ? 9.5 : 8}
            fill="#f43f5e"
            opacity={emotion === 'very_sad' ? 0.25 : emotion === 'enjoying' ? 0.7 : 0.45}
          />
          <circle
            cx="105"
            cy="88"
            r={emotion === 'enjoying' ? 9.5 : 8}
            fill="#f43f5e"
            opacity={emotion === 'very_sad' ? 0.25 : emotion === 'enjoying' ? 0.7 : 0.45}
          />

          {/* Eyes (Emotion specific or standard blinking) */}
          {emotion === 'enjoying' ? (
            <g stroke="#061a14" strokeWidth="3.2" strokeLinecap="round" fill="none">
              {/* Happy curved anime eyes ^ ^ */}
              <path d="M57 78 Q64 69 71 78" />
              <path d="M89 78 Q96 69 103 78" />
            </g>
          ) : emotion === 'very_sad' ? (
            <g style={{ transformOrigin: '80px 78px', animation: 'finnyBlink 4s infinite' }}>
              {/* Large watery, worried eyes with big specular reflections */}
              <ellipse cx="64" cy="77" rx="9" ry="10.5" fill="#061a14" />
              <circle cx="62" cy="74" r="4.5" fill="#ffffff" />
              <circle cx="67" cy="80" r="2" fill="#ffffff" />

              <ellipse cx="96" cy="77" rx="9" ry="10.5" fill="#061a14" />
              <circle cx="94" cy="74" r="4.5" fill="#ffffff" />
              <circle cx="99" cy="80" r="2" fill="#ffffff" />
            </g>
          ) : (
            <g style={{ transformOrigin: '80px 78px', animation: 'finnyBlink 4s infinite' }}>
              {/* Left Eye */}
              <ellipse cx="64" cy="76" rx="8.5" ry="10" fill="#061a14" />
              <circle cx="61.5" cy="73" r="3.5" fill="#ffffff" />
              <circle cx="66" cy="79" r="1.5" fill="#ffffff" />

              {/* Right Eye */}
              <ellipse cx="96" cy="76" rx="8.5" ry="10" fill="#061a14" />
              <circle cx="93.5" cy="73" r="3.5" fill="#ffffff" />
              <circle cx="98" cy="79" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Teardrop for very_sad */}
          {emotion === 'very_sad' && (
            <path
              d="M56 90 C56 90 53 96 53 99 C53 102 55.5 104 58 104 C60.5 104 63 102 63 99 C63 96 60 90 56 90 Z"
              fill="#38bdf8"
              filter="url(#finnyGlow)"
            />
          )}

          {/* Mouth expressions (Emotion overrides pose if emotion is set) */}
          {emotion === 'enjoying' ? (
            <path d="M70 84 Q80 99 90 84 Z" fill="#e11d48" stroke="#061a14" strokeWidth="2.5" strokeLinejoin="round" />
          ) : emotion === 'smile' ? (
            <path d="M73 87 Q80 94 87 87" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : emotion === 'neutral' ? (
            <line x1="74" y1="88" x2="86" y2="88" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" />
          ) : emotion === 'sad' ? (
            <path d="M73 91 Q80 85 87 91" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : emotion === 'very_sad' ? (
            <path d="M71 94 Q80 84 89 94" stroke="#061a14" strokeWidth="3" strokeLinecap="round" fill="none" />
          ) : (
            /* Fallback to pose-based mouth */
            <>
              {pose === 'greeting' && (
                <path d="M73 87 Q80 94 87 87" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="#e11d48" />
              )}
              {pose === 'notetaking' && (
                <path d="M74 88 Q80 91 86 88" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              )}
              {pose === 'thinking' && (
                <path d="M74 89 Q80 86 86 89" stroke="#061a14" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              )}
              {pose === 'calculating' && (
                <ellipse cx="80" cy="88" rx="4" ry="5" fill="#061a14" />
              )}
              {pose === 'celebrating' && (
                <path d="M71 85 Q80 97 89 85 Z" fill="#e11d48" stroke="#061a14" strokeWidth="2" strokeLinejoin="round" />
              )}
            </>
          )}
        </g>

        {/* ================= POSE-SPECIFIC ACCESSORIES & ARMS ================= */}

        {/* 1. GREETING POSE: Waving hand with sparkling star */}
        {pose === 'greeting' && (
          <g id="finnyPoseGreeting">
            {/* Left Hand Resting */}
            <ellipse cx="32" cy="94" rx="9" ry="11" fill="url(#finnyBodyGrad)" transform="rotate(20 32 94)" />

            {/* Right Hand Waving */}
            <g style={{ transformOrigin: '122px 85px', animation: 'finnyWave 1.8s ease-in-out infinite' }}>
              <ellipse cx="128" cy="74" rx="10" ry="13" fill="url(#finnyBodyGrad)" transform="rotate(-30 128 74)" />
              {/* Sparkle near waving hand */}
              <path
                d="M136 56 L139 63 L146 66 L139 69 L136 76 L133 69 L126 66 L133 63 Z"
                fill="#fde047"
                style={{ animation: 'finnySparkle 2s infinite' }}
              />
            </g>
          </g>
        )}

        {/* 2. NOTETAKING POSE: Holding a notebook & pen */}
        {pose === 'notetaking' && (
          <g id="finnyPoseNotetaking">
            {/* Notebook Base */}
            <rect x="94" y="80" width="30" height="38" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            <line x1="98" y1="88" x2="118" y2="88" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="98" y1="94" x2="114" y2="94" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            <line x1="98" y1="100" x2="116" y2="100" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
            <line x1="98" y1="106" x2="110" y2="106" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            {/* Left Arm holding Notebook */}
            <ellipse cx="90" cy="100" rx="9" ry="11" fill="url(#finnyBodyGrad)" />

            {/* Right Hand with Golden Pen */}
            <g transform="rotate(-15 110 85)">
              <rect x="110" y="72" width="4" height="20" rx="1.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <polygon points="110,92 114,92 112,96" fill="#0f172a" />
              <ellipse cx="108" cy="85" rx="7" ry="8" fill="url(#finnyBodyGrad)" />
            </g>
          </g>
        )}

        {/* 3. THINKING POSE: Hand on chin */}
        {pose === 'thinking' && (
          <g id="finnyPoseThinking">
            {/* Left Arm resting */}
            <ellipse cx="32" cy="96" rx="9" ry="11" fill="url(#finnyBodyGrad)" />

            {/* Right Hand on Chin */}
            <ellipse cx="94" cy="95" rx="9" ry="10" fill="url(#finnyBodyGrad)" transform="rotate(-25 94 95)" />

            {/* Subtle floating aura / indicator based on emotion */}
            {emotion === 'enjoying' ? (
              <path
                d="M122 45 L124 51 L130 53 L124 55 L122 61 L120 55 L114 53 L120 51 Z"
                fill="#fde047"
                style={{ animation: 'finnySparkle 1.8s infinite' }}
              />
            ) : emotion === 'very_sad' ? (
              <path
                d="M122 48 C122 48 119 53 119 56 C119 58 120.5 60 122.5 60 C124.5 60 126 58 126 56 C126 53 122 48 122 48 Z"
                fill="#38bdf8"
                opacity="0.85"
              />
            ) : (
              <g>
                <circle cx="122" cy="52" r="10" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="122" y="56" fontSize="13" fontWeight="bold" fill="#f59e0b" textAnchor="middle">?</text>
              </g>
            )}
          </g>
        )}

        {/* 4. CALCULATING POSE: Floating with coin & calculation aura */}
        {pose === 'calculating' && (
          <g id="finnyPoseCalculating">
            {/* Both arms outstretched holding floating energy */}
            <ellipse cx="30" cy="86" rx="9" ry="11" fill="url(#finnyBodyGrad)" transform="rotate(35 30 86)" />
            <ellipse cx="130" cy="86" rx="9" ry="11" fill="url(#finnyBodyGrad)" transform="rotate(-35 130 86)" />

            {/* Floating Golden Coin */}
            <g transform="translate(68, 16)">
              <circle cx="12" cy="12" r="11" fill="url(#finnyCoinGrad)" stroke="#ca8a04" strokeWidth="1.5" filter="url(#finnyGlow)" />
              <text x="12" y="16" fontSize="12" fontWeight="bold" fill="#78350f" textAnchor="middle">₹</text>
            </g>

            {/* Math/Pulse symbols */}
            <text x="32" y="55" fontSize="14" fontWeight="bold" fill="#34d399" opacity="0.8">+</text>
            <text x="124" y="55" fontSize="14" fontWeight="bold" fill="#38bdf8" opacity="0.8">%</text>
          </g>
        )}

        {/* 5. CELEBRATING POSE: Golden Crown on Head, Victory Arms */}
        {pose === 'celebrating' && (
          <g id="finnyPoseCelebrating">
            {/* Golden Regal Crown atop Head */}
            <g transform="translate(56, 12)">
              <polygon
                points="0,22 8,6 24,14 40,6 48,22"
                fill="url(#finnyCrownGrad)"
                stroke="#d97706"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <rect x="0" y="21" width="48" height="5" rx="1.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
              {/* Crown Jewels */}
              <circle cx="8" cy="6" r="3" fill="#ef4444" />
              <circle cx="24" cy="14" r="3" fill="#3b82f6" />
              <circle cx="40" cy="6" r="3" fill="#10b981" />
            </g>

            {/* Victory Raised Arms */}
            <ellipse cx="32" cy="74" rx="9" ry="12" fill="url(#finnyBodyGrad)" transform="rotate(-40 32 74)" />
            <ellipse cx="128" cy="74" rx="9" ry="12" fill="url(#finnyBodyGrad)" transform="rotate(40 128 74)" />

            {/* Confetti / Sparkles */}
            <circle cx="22" cy="46" r="2.5" fill="#fde047" />
            <circle cx="138" cy="46" r="2.5" fill="#38bdf8" />
            <circle cx="18" cy="66" r="2" fill="#f43f5e" />
            <circle cx="142" cy="66" r="2" fill="#10b981" />
          </g>
        )}
      </svg>
    </div>
  );
};
