import React from 'react';
// Единый набор иконок в стиле Lucide (https://lucide.dev) —
// open-source, MIT, 1.5px stroke, round join/cap, 24×24 viewBox.
// Путь и метаданные скопированы из Lucide 0.468 (commit 42f56).
// Все иконки принимают size, color, strokeWidth и прокидывают остальные props.

const LucideBase = ({ size = 22, color = 'currentColor', strokeWidth = 1.75, children, ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size} height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...rest}
  >
    {children}
  </svg>
);

// ─── Navigation / tabs ───────────────────────────────────
// check-square
const IconCheckSquare = (p) => (
  <LucideBase {...p}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </LucideBase>
);
// repeat
const IconRepeat = (p) => (
  <LucideBase {...p}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </LucideBase>
);
// book-open (база знаний)
const IconBook = (p) => (
  <LucideBase {...p}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </LucideBase>
);
// user
const IconUser = (p) => (
  <LucideBase {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </LucideBase>
);

// ─── UI primitives ───────────────────────────────────────
const IconPlus = (p) => (
  <LucideBase {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </LucideBase>
);
const IconMore = (p) => (
  <LucideBase {...p}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </LucideBase>
);
const IconSearch = (p) => (
  <LucideBase {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </LucideBase>
);
const IconChevronLeft = (p) => (
  <LucideBase {...p}>
    <path d="m15 18-6-6 6-6" />
  </LucideBase>
);
const IconChevronRight = (p) => (
  <LucideBase {...p}>
    <path d="m9 18 6-6-6-6" />
  </LucideBase>
);
const IconChevronDown = (p) => (
  <LucideBase {...p}>
    <path d="m6 9 6 6 6-6" />
  </LucideBase>
);
const IconCheck = (p) => (
  <LucideBase {...p}>
    <path d="M20 6 9 17l-5-5" />
  </LucideBase>
);
const IconMail = (p) => (
  <LucideBase {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </LucideBase>
);
const IconMessageCircle = (p) => (
  <LucideBase {...p}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </LucideBase>
);
// file-text (страница в базе)
const IconFile = (p) => (
  <LucideBase {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </LucideBase>
);
const IconFolder = (p) => (
  <LucideBase {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </LucideBase>
);
const IconPin = (p) => (
  <LucideBase {...p}>
    <path d="M12 17v5" />
    <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z" />
  </LucideBase>
);
// flame — для streak
const IconFlame = (p) => (
  <LucideBase {...p}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
  </LucideBase>
);
// sparkles — онбординг шаг 1
const IconSparkles = (p) => (
  <LucideBase {...p}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </LucideBase>
);
// target — онбординг шаг 2 (фокус на главном)
const IconTarget = (p) => (
  <LucideBase {...p}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </LucideBase>
);
// refresh-cw / loader — миграция
const IconRefresh = (p) => (
  <LucideBase {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </LucideBase>
);
// shield-check — онбординг шаг 3
const IconShield = (p) => (
  <LucideBase {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </LucideBase>
);

// briefcase — пространство "Работа"
const IconBriefcase = (p) => (
  <LucideBase {...p}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </LucideBase>
);
// heart — пространство "Жизнь"
const IconHeart = (p) => (
  <LucideBase {...p}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </LucideBase>
);
// compass — пространство "Справочник"
const IconCompass = (p) => (
  <LucideBase {...p}>
    <path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" />
    <circle cx="12" cy="12" r="10" />
  </LucideBase>
);

// calendar
const IconCalendar = (p) => (
  <LucideBase {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </LucideBase>
);
// clock
const IconClock = (p) => (
  <LucideBase {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </LucideBase>
);
// flag
const IconFlag = (p) => (
  <LucideBase {...p}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </LucideBase>
);
// hash
const IconHash = (p) => (
  <LucideBase {...p}>
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </LucideBase>
);
// list
const IconList = (p) => (
  <LucideBase {...p}>
    <line x1="8" x2="21" y1="6" y2="6" />
    <line x1="8" x2="21" y1="12" y2="12" />
    <line x1="8" x2="21" y1="18" y2="18" />
    <line x1="3" x2="3.01" y1="6" y2="6" />
    <line x1="3" x2="3.01" y1="12" y2="12" />
    <line x1="3" x2="3.01" y1="18" y2="18" />
  </LucideBase>
);
// lock
const IconLock = (p) => (
  <LucideBase {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </LucideBase>
);
// bell
const IconBell = (p) => (
  <LucideBase {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </LucideBase>
);
// palette
const IconPalette = (p) => (
  <LucideBase {...p}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </LucideBase>
);
// cloud
const IconCloud = (p) => (
  <LucideBase {...p}>
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
  </LucideBase>
);
// info
const IconInfo = (p) => (
  <LucideBase {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </LucideBase>
);
// log-out
const IconLogOut = (p) => (
  <LucideBase {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </LucideBase>
);
// star
const IconStar = (p) => (
  <LucideBase {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </LucideBase>
);
// camera
const IconCamera = (p) => (
  <LucideBase {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </LucideBase>
);
// settings (gear)
const IconSettings = (p) => (
  <LucideBase {...p}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </LucideBase>
);

// bold
const IconBold = (p) => (
  <LucideBase {...p}>
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </LucideBase>
);
// italic
const IconItalic = (p) => (
  <LucideBase {...p}>
    <line x1="19" x2="10" y1="4" y2="4" />
    <line x1="14" x2="5" y1="20" y2="20" />
    <line x1="15" x2="9" y1="4" y2="20" />
  </LucideBase>
);
// link
const IconLink = (p) => (
  <LucideBase {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </LucideBase>
);
// type / text
const IconType = (p) => (
  <LucideBase {...p}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" x2="15" y1="20" y2="20" />
    <line x1="12" x2="12" y1="4" y2="20" />
  </LucideBase>
);
// list-ordered
const IconListOrdered = (p) => (
  <LucideBase {...p}>
    <line x1="10" x2="21" y1="6" y2="6" />
    <line x1="10" x2="21" y1="12" y2="12" />
    <line x1="10" x2="21" y1="18" y2="18" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </LucideBase>
);
// grip-vertical (drag handle)
const IconGrip = (p) => (
  <LucideBase {...p}>
    <circle cx="9" cy="6" r="1.2" />
    <circle cx="9" cy="12" r="1.2" />
    <circle cx="9" cy="18" r="1.2" />
    <circle cx="15" cy="6" r="1.2" />
    <circle cx="15" cy="12" r="1.2" />
    <circle cx="15" cy="18" r="1.2" />
  </LucideBase>
);
// quote
const IconQuote = (p) => (
  <LucideBase {...p}>
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
  </LucideBase>
);
// plus-small (used inline in editor)
const IconPlusSmall = (p) => (
  <LucideBase {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </LucideBase>
);
// slash
const IconSlash = (p) => (
  <LucideBase {...p}>
    <line x1="5" x2="19" y1="19" y2="5" />
  </LucideBase>
);

// X
const IconX = (p) => (
  <LucideBase {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </LucideBase>
);
const IconMonitor = (p) => (
  <LucideBase {...p}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </LucideBase>
);
const IconSmartphone = (p) => (
  <LucideBase {...p}>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </LucideBase>
);
const IconTablet = (p) => (
  <LucideBase {...p}>
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
    <line x1="12" x2="12" y1="18" y2="18" />
  </LucideBase>
);
const IconLaptop = (p) => (
  <LucideBase {...p}>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </LucideBase>
);
const IconTrash = (p) => (
  <LucideBase {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </LucideBase>
);
const IconEye = (p) => (
  <LucideBase {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </LucideBase>
);
const IconEyeOff = (p) => (
  <LucideBase {...p}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </LucideBase>
);
// download
const IconDownload = (p) => (
  <LucideBase {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </LucideBase>
);
// sun
const IconSun = (p) => (
  <LucideBase {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" /><path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" /><path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </LucideBase>
);
// moon
const IconMoon = (p) => (
  <LucideBase {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </LucideBase>
);
// volume
const IconVolume = (p) => (
  <LucideBase {...p}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </LucideBase>
);
// fingerprint
const IconFingerprint = (p) => (
  <LucideBase {...p}>
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </LucideBase>
);
// activity
const IconActivity = (p) => (
  <LucideBase {...p}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </LucideBase>
);
// file-text
const IconFileText = (p) => (
  <LucideBase {...p}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </LucideBase>
);
// alert-triangle
const IconAlertTriangle = (p) => (
  <LucideBase {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </LucideBase>
);
// wifi-off
const IconWifiOff = (p) => (
  <LucideBase {...p}>
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
    <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
    <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
    <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
    <path d="M5 13a10 10 0 0 1 5.24-2.76" />
    <line x1="12" x2="12.01" y1="20" y2="20" />
  </LucideBase>
);
// check-circle
const IconCheckCircle = (p) => (
  <LucideBase {...p}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </LucideBase>
);
// code
const IconCode = (p) => (
  <LucideBase {...p}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </LucideBase>
);
// external-link
const IconExternalLink = (p) => (
  <LucideBase {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </LucideBase>
);

// Все иконки экспортятся одним блоком (для ESM-импорта по имени) и параллельно
// вешаются на window (для ещё не сконвертированных потребителей).
const ALL_ICONS = {
  IconCheckSquare, IconRepeat, IconBook, IconUser,
  IconPlus, IconMore, IconSearch,
  IconChevronLeft, IconChevronRight, IconChevronDown, IconCheck,
  IconMail, IconMessageCircle, IconFile, IconFolder, IconPin, IconFlame,
  IconSparkles, IconTarget, IconRefresh, IconShield,
  IconBriefcase, IconHeart, IconCompass,
  IconCalendar, IconClock, IconFlag, IconHash, IconList, IconLock,
  IconBell, IconPalette, IconCloud, IconInfo, IconLogOut,
  IconStar, IconSettings, IconCamera,
  IconBold, IconItalic, IconLink, IconType, IconListOrdered,
  IconGrip, IconQuote, IconPlusSmall, IconSlash,
  IconX, IconMonitor, IconSmartphone, IconTablet, IconLaptop,
  IconTrash, IconEye, IconEyeOff,
  IconDownload, IconSun, IconMoon, IconVolume, IconFingerprint,
  IconActivity, IconFileText, IconAlertTriangle, IconWifiOff,
  IconCheckCircle, IconCode, IconExternalLink,
};
Object.assign(window, ALL_ICONS);
export {
  IconCheckSquare, IconRepeat, IconBook, IconUser,
  IconPlus, IconMore, IconSearch,
  IconChevronLeft, IconChevronRight, IconChevronDown, IconCheck,
  IconMail, IconMessageCircle, IconFile, IconFolder, IconPin, IconFlame,
  IconSparkles, IconTarget, IconRefresh, IconShield,
  IconBriefcase, IconHeart, IconCompass,
  IconCalendar, IconClock, IconFlag, IconHash, IconList, IconLock,
  IconBell, IconPalette, IconCloud, IconInfo, IconLogOut,
  IconStar, IconSettings, IconCamera,
  IconBold, IconItalic, IconLink, IconType, IconListOrdered,
  IconGrip, IconQuote, IconPlusSmall, IconSlash,
  IconX, IconMonitor, IconSmartphone, IconTablet, IconLaptop,
  IconTrash, IconEye, IconEyeOff,
  IconDownload, IconSun, IconMoon, IconVolume, IconFingerprint,
  IconActivity, IconFileText, IconAlertTriangle, IconWifiOff,
  IconCheckCircle, IconCode, IconExternalLink,
};

