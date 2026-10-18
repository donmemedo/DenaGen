export default function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--a1)" />
          <stop offset=".5" stopColor="var(--a2)" />
          <stop offset="1" stopColor="var(--a3)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#lg)" />
      <path d="M11 6c0 7 10 7 10 13s-10 6-10 7M21 6c0 7-10 7-10 13s10 6 10 7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M12.5 10h7M13 22h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
