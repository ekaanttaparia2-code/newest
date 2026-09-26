import { useState, useEffect, useRef } from 'react';

/**
 * Animates a numeric value smoothly using requestAnimationFrame and cubic ease-out.
 * @param targetValue The number to animate to
 * @param durationMs Duration of the animation in milliseconds (default: 750ms)
 */
export function useAnimatedNumber(targetValue: number, durationMs: number = 750): number {
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const currentValueRef = useRef<number>(targetValue);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (targetValue === currentValueRef.current) return;

    const startVal = currentValueRef.current;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);

      // Cubic ease-out: f(t) = 1 - (1 - t)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startVal + (targetValue - startVal) * easeProgress);

      currentValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        currentValueRef.current = targetValue;
        setDisplayValue(targetValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, durationMs]);

  return displayValue;
}
