import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0E1116',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,92,231,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Badge background */}
        <div
          style={{
            background: 'linear-gradient(145deg, #4834D4 0%, #2D1B8E 50%, #1A0F5C 100%)',
            width: 360,
            height: 360,
            borderRadius: '36%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 60px rgba(108,92,231,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          {/* SVG sword icon */}
          <svg
            width="200"
            height="220"
            viewBox="0 0 200 220"
            fill="none"
          >
            {/* Blade */}
            <polygon
              points="100,8 88,160 100,178 112,160"
              fill="url(#bladeGrad)"
            />
            {/* Blade edge highlight */}
            <polygon
              points="100,8 88,160 100,178 112,160"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            {/* Blade center line */}
            <line x1="100" y1="16" x2="100" y2="158" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            {/* Crossguard */}
            <rect x="58" y="162" width="84" height="14" rx="7" fill="url(#guardGrad)" />
            {/* Crossguard ornaments */}
            <circle cx="58" cy="169" r="7" fill="#C4A9FF" />
            <circle cx="142" cy="169" r="7" fill="#C4A9FF" />
            {/* Handle */}
            <rect x="90" y="176" width="20" height="38" rx="10" fill="#6C5CE7" />
            {/* Handle wrapping lines */}
            <line x1="88" y1="188" x2="112" y2="188" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <line x1="88" y1="198" x2="112" y2="198" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {/* Pommel */}
            <circle cx="100" cy="220" r="12" fill="url(#pommelGrad)" />
            <circle cx="100" cy="220" r="6" fill="rgba(255,255,255,0.3)" />
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="bladeGrad" x1="88" y1="8" x2="112" y2="8" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E8E0FF" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#C4B4FF" />
              </linearGradient>
              <linearGradient id="guardGrad" x1="58" y1="169" x2="142" y2="169" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8675E8" />
                <stop offset="50%" stopColor="#C4A9FF" />
                <stop offset="100%" stopColor="#8675E8" />
              </linearGradient>
              <radialGradient id="pommelGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#C4A9FF" />
                <stop offset="100%" stopColor="#6C5CE7" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
