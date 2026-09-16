import { useEffect, useRef, useState } from "react";

type Props = {
  bars?: number;
  className?: string;
  active?: boolean;
};

/** Lightweight frequency visualizer built from deterministic-seeded bars so SSR
 *  and hydration agree, then animated with CSS only. */
export function Waveform({ bars = 48, className, active = true }: Props) {
  const heights = useRef<number[]>(
    Array.from({ length: bars }, (_, i) => {
      const t = i / bars;
      const envelope = Math.sin(Math.PI * t);
      const detail = 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6));
      return Math.max(0.08, envelope * detail);
    }),
  );

  return (
    <div className={className} aria-hidden="true">
      <div className="flex h-full w-full items-center justify-between gap-[2px]">
        {heights.current.map((h, i) => (
          <span
            key={i}
            className="waveform-bar flex-1 rounded-full"
            style={{
              height: `${Math.round(h * 100)}%`,
              animation: active ? `resonate ${2.4 + (i % 7) * 0.22}s ease-in-out ${(i % 11) * 0.09}s infinite` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/** Small animated listening indicator used next to Eleven's avatar. */
export function ListeningDots() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % 3), 420);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-1" aria-label="Eleven is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-accent transition-opacity duration-300"
          style={{ opacity: n === i ? 1 : 0.3 }}
        />
      ))}
    </span>
  );
}
