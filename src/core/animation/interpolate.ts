export function progressAt(time: number, start: number, duration: number): number {
  if (!Number.isFinite(time) || !Number.isFinite(start) || !Number.isFinite(duration)) {
    throw new Error('animation timing values must be finite');
  }
  if (duration <= 0) {
    return time >= start ? 1 : 0;
  }
  return Math.max(0, Math.min(1, (time - start) / duration));
}
