export const PINK = '#F0509A';
export const YELLOW = '#FFD94A';
export const INK = '#141414';
export const CREAM = '#FFF8EC';
export const WHITE = '#FFFFFF';
export const LEAF = '#3DAA4A';

export type ChannelId = 'edu' | 'ai';
export type Format = '9:16' | '16:9';

export type Theme = {
  id: ChannelId;
  channel: string;
  handle: string;
  credit: string;
  bg: string; // main background
  sun: string; // big circle behind title
  paper: string;
  ink: string;
  accent: string; // tag / highlight colour
  accent2: string;
  textOnBg: string;
  cta: string;
  wipe: string;
};

export const THEMES: Record<ChannelId, Theme> = {
  edu: {
    id: 'edu',
    channel: 'Edu Made Fun',
    handle: '@edumadefun',
    credit: 'Dr. Swapnil Agrawal',
    bg: PINK,
    sun: YELLOW,
    paper: CREAM,
    ink: INK,
    accent: YELLOW,
    accent2: WHITE,
    textOnBg: WHITE,
    cta: 'Follow for more fun dental bites!',
    wipe: YELLOW,
  },
  ai: {
    id: 'ai',
    channel: "Swap's AI World",
    handle: '@swap_agrawal',
    credit: 'Swapnil Agrawal',
    bg: INK,
    sun: PINK,
    paper: CREAM,
    ink: INK,
    accent: PINK,
    accent2: YELLOW,
    textOnBg: CREAM,
    cta: 'Follow for no-fluff AI tips!',
    wipe: PINK,
  },
};

export const getTheme = (id?: string, overrides?: Partial<Theme>): Theme => ({
  ...THEMES[(id as ChannelId) in THEMES ? (id as ChannelId) : 'edu'],
  ...(overrides || {}),
});

export const FONT = {
  title: "'Caveat', cursive",
  marker: "'Permanent Marker', cursive",
  hand: "'Patrick Hand', cursive",
};

export const dims = (f?: string) =>
  f === '16:9' ? {width: 1920, height: 1080} : {width: 1080, height: 1920};
