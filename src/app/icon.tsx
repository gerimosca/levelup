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
        <div
          style={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
            width: '76%',
            height: '76%',
            borderRadius: '22%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 80px rgba(108,92,231,0.6)',
          }}
        >
          <div
            style={{
              color: '#FFD24A',
              fontSize: 220,
              lineHeight: 1,
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 900,
            }}
          >
            ⚡
          </div>
        </div>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
