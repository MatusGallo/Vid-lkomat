import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const makeIcon = (inner: string) =>
  function Icon({ size = 18, ...rest }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...rest}
        dangerouslySetInnerHTML={{ __html: inner }}
      />
    );
  };

export const Truck = makeIcon('<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>');
export const LayoutDashboard = makeIcon('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>');
export const CalendarDays = makeIcon('<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>');
export const ArrowUpRight = makeIcon('<path d="M7 7h10v10"/><path d="M7 17 17 7"/>');
export const ArrowDownRight = makeIcon('<path d="m7 7 10 10"/><path d="M17 7v10H7"/>');
export const Plus = makeIcon('<path d="M5 12h14"/><path d="M12 5v14"/>');
export const X = makeIcon('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
export const Menu = makeIcon('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>');
export const BadgeCheck = makeIcon('<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>');
export const Pencil = makeIcon('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>');
export const Check = makeIcon('<path d="M20 6 9 17l-5-5"/>');
export const AlertTriangle = makeIcon('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>');
export const LogOut = makeIcon('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>');
export const ChevronDown = makeIcon('<path d="m6 9 6 6 6-6"/>');
export const ChevronLeft = makeIcon('<path d="m15 18-6-6 6-6"/>');
export const ChevronRight = makeIcon('<path d="m9 18 6-6-6-6"/>');

// Brand logo: oranžový badge s vozem (odtahová služba) + drobnou mincí pro „výdělek".
export function Logo({ size = 24, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden {...rest}>
      <defs>
        <linearGradient id="vk-logo-grad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB257" />
          <stop offset="1" stopColor="#F26A1B" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="26" height="26" rx="8.5" fill="url(#vk-logo-grad)" />
      <g
        transform="translate(4.5 4.8) scale(0.95)"
        stroke="#fff"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </g>
    </svg>
  );
}
