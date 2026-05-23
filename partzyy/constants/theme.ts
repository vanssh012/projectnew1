export const COLORS = {
  bg: {
    primary: '#0E0E10',
    surface: '#141416',
    elevated: '#1A1A1E',
    border: '#2A2A2E',
  },
  text: {
    primary: '#F0EEE8',
    secondary: '#888888',
    muted: '#555555',
  },
  category: {
    farewell: {
      primary: '#C9A050',
      bg: '#1E1A0E',
      border: '#3A3010',
      badgeBg: 'rgba(201,160,80,0.15)',
    },
    freshers: {
      primary: '#5ABFCF',
      bg: '#0E1A1E',
      border: '#2A3A40',
      badgeBg: 'rgba(90,191,207,0.10)',
    },
    house_party: {
      primary: '#B07AE0',
      bg: '#1A0E1E',
      border: '#2A1A3A',
      badgeBg: 'rgba(176,122,224,0.15)',
    },
  },
  success: '#8ECF7A',
  danger: '#CF7A7A',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  full: 999,
} as const;

export type Category = 'farewell' | 'freshers' | 'house_party';

export const CATEGORY_LABELS: Record<Category, string> = {
  farewell: 'Farewell',
  freshers: 'Freshers',
  house_party: 'House Party',
};

export const CATEGORY_SYMBOLS: Record<Category, string> = {
  farewell: '✦',
  freshers: '◈',
  house_party: '◉',
};

export const THEME_TAGS = [
  'DJ Night',
  'Neon Theme',
  'Games',
  'Photo Booth',
  'Dinner Included',
  'Bollywood',
  'Acoustic',
  'Introductions',
  'Karaoke',
  'BYOB',
  'Retro',
  'Rooftop',
  'Dress Code',
  'Surprise Act',
  'Open Mic',
  'Board Games',
];
