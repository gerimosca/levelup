import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon192() {
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
        <div
          style={{
            background: 'linear-gradient(145deg, #4834D4 0%, #2D1B8E 50%, #1A0F5C 100%)',
            width: 148,
            height: 148,
            borderRadius: '36%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(108,92,231,0.5)',
          }}
        >
          <svg width="76" height="84" viewBox="0 0 200 220" fill="none">
            <polygon points="100,8 88,160 100,178 112,160" fill="white" />
            <line x1="100" y1="16" x2="100" y2="158" stroke="rgba(180,160,255,0.5)" strokeWidth="4" />
            <rect x="58" y="162" width="84" height="14" rx="7" fill="#C4A9FF" />
            <rect x="90" y="176" width="20" height="38" rx="10" fill="#8675E8" />
            <circle cx="100" cy="220" r="12" fill="#C4A9FF" />
          </svg>
        </div>
      </div>
    ),
    { width: 192, height: 192 },
  );
}
