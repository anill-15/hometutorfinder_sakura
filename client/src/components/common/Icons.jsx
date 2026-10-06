/**
 * Icons.jsx
 * ---------------------------------------------------------------------------
 * A small set of inline SVG icons. They are stroke-based so they stay crisp and
 * inherit the surrounding text colour without extra styling.
 */

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 16,
  height: 16,
  'aria-hidden': 'true',
  focusable: 'false',
};

const Svg = ({ children, size = 16, ...rest }) => (
  <svg {...base} width={size} height={size} {...rest}>
    {children}
  </svg>
);

export const IconSearch = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}><path d="m4 12 5 5L20 6" /></Svg>
);

export const IconCheckCircle = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Svg>
);

export const IconClose = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);

export const IconStar = ({ filled = false, size = 16, ...p }) => (
  <Svg {...p} size={size} fill={filled ? 'currentColor' : 'none'}>
    <path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.8l5.9-.9z" />
  </Svg>
);

export const IconHeart = ({ filled = false, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
  </Svg>
);

export const IconVerified = (p) => (
  <Svg {...p}>
    <path d="m12 2.8 2.2 1.7 2.7-.2.9 2.6 2.4 1.4-.8 2.6.8 2.6-2.4 1.4-.9 2.6-2.7-.2L12 21.2l-2.2-1.7-2.7.2-.9-2.6L3.8 15.7l.8-2.6-.8-2.6 2.4-1.4.9-2.6 2.7.2z" />
    <path d="m9.2 12.2 1.9 1.9 3.7-3.9" />
  </Svg>
);

export const IconBell = (p) => (
  <Svg {...p}><path d="M18 8.6a6 6 0 1 0-12 0c0 5-2 6.4-2 6.4h16s-2-1.4-2-6.4" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></Svg>
);

export const IconUser = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></Svg>
);

export const IconUsers = (p) => (
  <Svg {...p}><circle cx="9" cy="8" r="3.2" /><path d="M2.8 19a6.2 6.2 0 0 1 12.4 0" /><path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.9M18 14.4a6.2 6.2 0 0 1 3.2 5.3" /></Svg>
);

export const IconDashboard = (p) => (
  <Svg {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" /><rect x="13.5" y="3.5" width="7" height="4.5" rx="1.6" /><rect x="13.5" y="10.5" width="7" height="10" rx="1.6" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" /></Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="16" rx="2.4" /><path d="M3.5 10h17M8 3.5v3M16 3.5v3" /></Svg>
);

export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.6" /><path d="M12 7.2V12l3 1.8" /></Svg>
);

export const IconLocation = (p) => (
  <Svg {...p}><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></Svg>
);

export const IconMoney = (p) => (
  <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.4" /><circle cx="12" cy="12" r="2.8" /><path d="M6 12h.01M18 12h.01" /></Svg>
);

export const IconVideo = (p) => (
  <Svg {...p}><rect x="2.5" y="6" width="13" height="12" rx="2.4" /><path d="m15.5 10.5 6-3v9l-6-3z" /></Svg>
);

export const IconBook = (p) => (
  <Svg {...p}><path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H19v15.5H6.2A2.2 2.2 0 0 0 4 20.7z" /><path d="M4 20.7A2.2 2.2 0 0 1 6.2 18.5H19V21H6.2A2.2 2.2 0 0 1 4 18.8z" /></Svg>
);

export const IconEdit = (p) => (
  <Svg {...p}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /><path d="M14.5 6.5l3 3" /></Svg>
);

export const IconTrash = (p) => (
  <Svg {...p}><path d="M4 6.5h16M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7M6.5 6.5 7.4 20a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-13.5" /></Svg>
);

export const IconPlus = (p) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);

export const IconFilter = (p) => (
  <Svg {...p}><path d="M3.5 5.5h17l-6.5 8v5.5l-4 2v-7.5z" /></Svg>
);

export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6z" /><path d="m9.2 12 2 2 3.6-4" /></Svg>
);

export const IconFlag = (p) => (
  <Svg {...p}><path d="M5 21V4.5M5 5h11l-1.6 3.5L16 12H5" /></Svg>
);

export const IconChat = (p) => (
  <Svg {...p}><path d="M20.5 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.4-5.1A7.5 7.5 0 1 1 20.5 12z" /></Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}><path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4" /><path d="M10 8l-4 4 4 4M6 12h9" /></Svg>
);

export const IconMenu = (p) => (
  <Svg {...p}><path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" /></Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p}><path d="M6 9.5l6 6 6-6" /></Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}><path d="M14.5 6l-6 6 6 6" /></Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}><path d="M9.5 6l6 6-6 6" /></Svg>
);

export const IconArrowLeft = (p) => (
  <Svg {...p}><path d="M20 12H4.5M10.5 6 4.5 12l6 6" /></Svg>
);

export const IconInbox = (p) => (
  <Svg {...p}><path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" /><path d="M5.4 5.5h13.2l2.4 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" /></Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.8" /><path d="M12 7.6v5M12 16.2h.01" /></Svg>
);

export const IconInfo = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.8" /><path d="M12 11v5.4M12 7.8h.01" /></Svg>
);

export const IconSparkle = (p) => (
  <Svg {...p}><path d="m12 3 1.8 4.9L18.5 9.7l-4.7 1.8L12 16.4l-1.8-4.9L5.5 9.7l4.7-1.8z" /><path d="M18.5 16.2l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" /></Svg>
);

export const IconTarget = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.6" /><circle cx="12" cy="12" r="4.6" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Svg>
);

export const IconBriefcase = (p) => (
  <Svg {...p}><rect x="2.8" y="7.5" width="18.4" height="12.5" rx="2.2" /><path d="M8.5 7.5V5.8A1.8 1.8 0 0 1 10.3 4h3.4a1.8 1.8 0 0 1 1.8 1.8v1.7M2.8 12.5h18.4" /></Svg>
);

export const IconMail = (p) => (
  <Svg {...p}><rect x="2.8" y="5" width="18.4" height="14" rx="2.4" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></Svg>
);

export const IconPhone = (p) => (
  <Svg {...p}><path d="M7.2 3.8H4.6a1.8 1.8 0 0 0-1.8 1.9c0 8 6.3 14.3 14.3 14.3a1.8 1.8 0 0 0 1.9-1.8v-2.6l-4-1.6-1.6 1.6a15 15 0 0 1-6.2-6.2L9.6 7.8z" /></Svg>
);

export default IconSearch;