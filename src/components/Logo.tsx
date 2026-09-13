interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoMochiWarmGradient" x1="20" y1="4" x2="44" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fda4af" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <path
        d="M10,44 C10,32 19,24 32,24 C45,24 54,32 54,44 C54,55 45,60 32,60 C19,60 10,55 10,44 Z"
        fill="url(#logoMochiWarmGradient)"
      />
      <ellipse cx="32" cy="27" rx="15" ry="3.2" fill="#9a3412" opacity="0.18" />
      <path
        d="M18,20 C18,12 24,6 32,6 C40,6 46,12 46,20 C46,27 40,31 32,31 C24,31 18,27 18,20 Z"
        fill="url(#logoMochiWarmGradient)"
      />
      <ellipse cx="26" cy="12" rx="6" ry="3.2" fill="#ffffff" opacity="0.4" transform="rotate(-20 26 12)" />
      <ellipse cx="22" cy="34" rx="7" ry="4" fill="#ffffff" opacity="0.3" transform="rotate(-20 22 34)" />
      <ellipse cx="22" cy="46" rx="4" ry="2.4" fill="#fb7185" opacity="0.6" />
      <ellipse cx="42" cy="46" rx="4" ry="2.4" fill="#fb7185" opacity="0.6" />
      <circle cx="25" cy="40" r="2.4" fill="#7c2d12" />
      <circle cx="39" cy="40" r="2.4" fill="#7c2d12" />
      <path d="M27,48 Q32,52 37,48" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
