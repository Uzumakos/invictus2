"use client";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={(size * 220) / 240}
      viewBox="0 0 300 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      id="erns-logo-svg"
    >
      {/* Column 1 (A) - Brand Primary Blue */}
      <path
        d="M110,30 L10,80 L10,180 L110,230 Z M45,110 L75,110 L75,75 L45,90 Z M45,197 L75,212 L75,140 L45,140 Z"
        fill="var(--color-brand-primary)"
        fillRule="evenodd"
        clipRule="evenodd"
        id="logo-letter-a"
      />
      {/* Column 2 (E) - Accent Orange */}
      <path
        d="M125,22.5 L150,10 L175,22.5 L175,237.5 L150,250 L125,237.5 Z M145,106 L175,106 L175,58 L145,58 Z M145,202 L175,202 L175,154 L145,154 Z"
        fill="var(--color-brand-accent)"
        fillRule="evenodd"
        clipRule="evenodd"
        id="logo-letter-e"
      />
      {/* Column 3 (B) - Brand Primary Blue */}
      <path
        d="M190,30 L290,80 L290,180 L190,230 Z M225,115 L255,115 L255,90 L225,75 Z M225,185 L255,170 L255,145 L225,145 Z"
        fill="var(--color-brand-primary)"
        fillRule="evenodd"
        clipRule="evenodd"
        id="logo-letter-b"
      />
    </svg>
  );
}
