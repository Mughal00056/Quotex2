import React from 'react';

interface FoxLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const FoxLogo: React.FC<FoxLogoProps> = ({
  className = '',
  size = 32,
  glow = false
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500/40 via-orange-500/30 to-emerald-400/30 blur-md pointer-events-none"
          style={{ transform: 'scale(1.25)' }}
        />
      )}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          <linearGradient id="foxEarsGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>
          <linearGradient id="foxInnerGrad" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="foxCheekGrad" x1="10" y1="28" x2="54" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
          <linearGradient id="foxEyeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00e599" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Outer Fox Silhouette / Head with sharp ears */}
        <path
          d="M32 46 L10 12 L24 22 L32 28 L40 22 L54 12 Z"
          fill="url(#foxEarsGrad)"
          stroke="#7c2d12"
          strokeWidth="1.2"
        />

        {/* Ear inner recesses (sleek contrast) */}
        <polygon points="14,16 23,23 18,27" fill="#431407" />
        <polygon points="50,16 41,23 46,27" fill="#431407" />

        {/* Fox Main Face Shape */}
        <polygon
          points="32,56 12,30 20,24 32,32 44,24 52,30"
          fill="url(#foxInnerGrad)"
        />

        {/* Fox White Cheeks (Distinctive cunning fox fur) */}
        <polygon points="32,56 12,30 22,38 32,46" fill="url(#foxCheekGrad)" />
        <polygon points="32,56 52,30 42,38 32,46" fill="url(#foxCheekGrad)" />

        {/* Fox Muzzle Center Bridge */}
        <polygon points="32,32 26,42 32,48 38,42" fill="#f97316" />

        {/* Fox Nose (Black point) */}
        <polygon points="32,57 28,52 36,52" fill="#0f172a" />

        {/* Sleek Intelligent Trading Eyes (Glowing Emerald Cyber Cyan) */}
        {/* Left eye */}
        <polygon points="21,32 27,34 23,36" fill="url(#foxEyeGrad)" />
        <circle cx="24.5" cy="34" r="0.9" fill="#ffffff" />
        {/* Right eye */}
        <polygon points="43,32 37,34 41,36" fill="url(#foxEyeGrad)" />
        <circle cx="39.5" cy="34" r="0.9" fill="#ffffff" />

        {/* Tech Cyber Forehead Crest (Trading Arrow Accent) */}
        <path
          d="M32 24 L35 29 L32 28 L29 29 Z"
          fill="#00e599"
        />
      </svg>
    </div>
  );
};
