import type { PetStage as Stage, PetMood } from '@/game-core';

interface StageLook {
  rx: number;
  ry: number;
  body: string;
  belly: string;
  wing: string | null;
  wingScale: number;
  horns: 'none' | 'small' | 'big';
  tail: boolean;
  eyeDx: number;
}

const LOOK: Record<Stage, StageLook> = {
  egg: { rx: 0, ry: 0, body: '', belly: '', wing: null, wingScale: 0, horns: 'none', tail: false, eyeDx: 0 },
  hatchling: { rx: 18, ry: 16, body: '#5BD1B0', belly: '#C6F2E6', wing: null, wingScale: 0, horns: 'none', tail: false, eyeDx: 6 },
  juvenile: { rx: 22, ry: 20, body: '#4FC9C0', belly: '#C6F2E6', wing: '#7AE0C8', wingScale: 0.7, horns: 'small', tail: true, eyeDx: 7 },
  adult: { rx: 26, ry: 23, body: '#46B6D6', belly: '#CDEBF5', wing: '#7FD6EA', wingScale: 1, horns: 'small', tail: true, eyeDx: 8 },
  final: { rx: 28, ry: 25, body: '#8B7BFF', belly: '#D9D2FF', wing: '#A99BFF', wingScale: 1.25, horns: 'big', tail: true, eyeDx: 9 },
};

function Face({ cx, cy, dx, mood }: { cx: number; cy: number; dx: number; mood: PetMood }) {
  const eye = (x: number) => {
    if (mood === 'tired') {
      return <line x1={x - 3} y1={cy} x2={x + 3} y2={cy} stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />;
    }
    return (
      <g>
        <circle cx={x} cy={cy} r="3.2" fill="#1a1a1a" />
        <circle cx={x - 1} cy={cy - 1} r="1" fill="#fff" />
      </g>
    );
  };
  const mouth =
    mood === 'happy' ? `M${cx - 6} ${cy + 8} Q${cx} ${cy + 14} ${cx + 6} ${cy + 8}`
    : mood === 'sad' ? `M${cx - 6} ${cy + 12} Q${cx} ${cy + 7} ${cx + 6} ${cy + 12}`
    : `M${cx - 4} ${cy + 9} Q${cx} ${cy + 11} ${cx + 4} ${cy + 9}`;
  return (
    <g>
      {eye(cx - dx)}
      {eye(cx + dx)}
      <path d={mouth} stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {mood === 'sad' && (
        <>
          <line x1={cx - dx - 4} y1={cy - 6} x2={cx - dx + 2} y2={cy - 4} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
          <line x1={cx + dx - 2} y1={cy - 4} x2={cx + dx + 4} y2={cy - 6} stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

export function PetAvatar({ stage, mood }: { stage: Stage; mood: PetMood }) {
  if (stage === 'egg') {
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
        <ellipse cx="50" cy="56" rx="26" ry="32" fill="#EAD9C2" />
        <ellipse cx="50" cy="56" rx="26" ry="32" fill="none" stroke="#D8C3A5" strokeWidth="2" />
        <circle cx="42" cy="48" r="3" fill="#D8C3A5" />
        <circle cx="58" cy="62" r="4" fill="#D8C3A5" />
        <circle cx="52" cy="40" r="2.5" fill="#D8C3A5" />
        <path d="M38 54 L46 58 L41 64 L49 68" stroke="#B59E7C" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const c = LOOK[stage];
  const cx = 50;
  const cy = 54;
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      {/* alas */}
      {c.wing && (
        <g fill={c.wing} opacity="0.95">
          <ellipse cx={cx - c.rx} cy={cy - 4} rx={14 * c.wingScale} ry={10 * c.wingScale} transform={`rotate(-25 ${cx - c.rx} ${cy - 4})`} />
          <ellipse cx={cx + c.rx} cy={cy - 4} rx={14 * c.wingScale} ry={10 * c.wingScale} transform={`rotate(25 ${cx + c.rx} ${cy - 4})`} />
        </g>
      )}

      {/* cola */}
      {c.tail && (
        <path d={`M${cx} ${cy + c.ry - 2} Q${cx + c.rx + 6} ${cy + c.ry + 6} ${cx + c.rx + 14} ${cy + c.ry - 6}`} stroke={c.body} strokeWidth="6" fill="none" strokeLinecap="round" />
      )}

      {/* cuerpo */}
      <ellipse cx={cx} cy={cy} rx={c.rx} ry={c.ry} fill={c.body} />
      <ellipse cx={cx} cy={cy + 4} rx={c.rx * 0.62} ry={c.ry * 0.62} fill={c.belly} />

      {/* cuernos */}
      {c.horns !== 'none' && (
        <g fill={c.horns === 'big' ? '#FFF1B0' : c.belly}>
          <path d={`M${cx - 8} ${cy - c.ry + 2} l-3 ${c.horns === 'big' ? -10 : -6} l6 2 z`} />
          <path d={`M${cx + 8} ${cy - c.ry + 2} l3 ${c.horns === 'big' ? -10 : -6} l-6 2 z`} />
        </g>
      )}

      {/* patitas */}
      <ellipse cx={cx - 8} cy={cy + c.ry - 1} rx="5" ry="4" fill={c.body} />
      <ellipse cx={cx + 8} cy={cy + c.ry - 1} rx="5" ry="4" fill={c.body} />

      <Face cx={cx} cy={cy - 2} dx={c.eyeDx} mood={mood} />
    </svg>
  );
}
