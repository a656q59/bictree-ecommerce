type IconProps = {
  className?: string;
};

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M9 7h11M9 12h11M9 17h11" />
      <path d="M5 7h.01M5 12h.01M5 17h.01" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 7h15l-1.4 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5 7Z" />
      <path d="M8 7 9.2 4.8A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .9.8L16 7" />
      <path d="M9 20.2h.01M17 20.2h.01" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="11" r="1.6" />
    </svg>
  );
}

export function TruckIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7" />
      <circle cx="7" cy="17.5" r="1.4" />
      <circle cx="17" cy="17.5" r="1.4" />
    </svg>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 12.5 12.2 4H20v7.8l-8.5 8.2L4 12.5Z" />
      <circle cx="16.2" cy="7.8" r="1" />
    </svg>
  );
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M14 6 8 12l6 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M10 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M7 10l5 5 5-5" />
    </svg>
  );
}
