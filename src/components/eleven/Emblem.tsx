type Props = { className?: string; title?: string };

/** Original abstract sound-wave emblem for Eleven: two vertical strokes (11)
 *  wrapped by an open resonance arc and a frequency ridge. */
export function Emblem({ className, title = "Eleven emblem" }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeOpacity="0.18" strokeWidth="1" />
      <path
        d="M7 14a20 20 0 0 0 0 20"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M41 14a20 20 0 0 1 0 20"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 27.5v-7M19 31v-14M29 31v-14M34 27.5v-7"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M24 8v32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24 8v32" stroke="currentColor" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
