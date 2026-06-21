import { describe, it, expect } from 'vitest';
import { petStageForCareDays, petMood, isReunion } from '../pet/pet';

describe('evolución de la mascota', () => {
  it('avanza de etapa por días de cuidado', () => {
    expect(petStageForCareDays(0)).toBe('egg');
    expect(petStageForCareDays(2)).toBe('egg');
    expect(petStageForCareDays(3)).toBe('hatchling'); // nace al día 3
    expect(petStageForCareDays(10)).toBe('juvenile');
    expect(petStageForCareDays(25)).toBe('adult');
    expect(petStageForCareDays(60)).toBe('final');
    expect(petStageForCareDays(120)).toBe('final');
  });
});

describe('ánimo de la mascota', () => {
  it('refleja la constancia reciente', () => {
    expect(petMood(0)).toBe('happy'); // activo hoy
    expect(petMood(1)).toBe('ok');
    expect(petMood(2)).toBe('tired');
    expect(petMood(3)).toBe('sad');
    expect(petMood(10)).toBe('sad');
  });
});

describe('reencuentro tras un bajón', () => {
  it('detecta el regreso cuando estaba triste o cansada', () => {
    expect(isReunion('sad', true)).toBe(true);
    expect(isReunion('tired', true)).toBe(true);
    expect(isReunion('happy', true)).toBe(false);
    expect(isReunion('sad', false)).toBe(false);
  });
});
