export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
        className="fill-brand-soft"
      />
      <path
        d="M16 2 L28 9 L16 16 Z M28 9 L28 23 L16 16 Z M28 23 L16 30 L16 16 Z"
        className="fill-brand-green"
      />
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z M16 2 L16 30 M4 9 L28 23 M28 9 L4 23"
        className="stroke-brand-deep"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
