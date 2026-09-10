/**
 * Original brand mark: a chain link resolving into a download arrow — "paste a link,
 * get your media". Placeholder brand ("Fetchpoint"); swap freely later.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
      <path
        d="M16 8.5v9.6"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M11 14.5 16 19.5 21 14.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 23h11"
        stroke="white"
        strokeOpacity="0.55"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C8CF5" />
          <stop offset="1" stopColor="#3D63E8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const BRAND_NAME = "Fetchpoint";
