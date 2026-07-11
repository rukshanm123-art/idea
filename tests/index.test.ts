import { describe, expect, it } from 'vitest';
import { healthcheck } from '../src/index.js';

describe('healthcheck', () => {
  it('reports ok with a valid timestamp', () => {
    const result = healthcheck();
    expect(result.status).toBe('ok');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
