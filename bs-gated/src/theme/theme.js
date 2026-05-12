/**
 * theme.js — GLOBAL THEME SYSTEM
 *
 * Three themes:
 *   light  — teal/white (Image 2 reference)
 *   dark   — black/orange (Image 1 reference)
 *   custom — dark purple/indigo
 *
 * Usage:
 *   import { useTheme } from '../hooks/useTheme';
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.background }} />
 */

export const themes = {
  // ─── LIGHT (Teal / MyGate Inspired — Image 2) ────────────────────────────
  light: {
    mode: 'light',

    // Backgrounds
    background:      '#E8F5F5',   // light teal-white
    backgroundAlt:   '#FFFFFF',
    surface:         '#FFFFFF',
    surfaceAlt:      '#F0FAFA',
    header:          '#1A7A7A',   // deep teal header
    headerGradient:  ['#0D6E6E', '#1A9E9E'],

    // Cards
    card:            '#FFFFFF',
    cardBorder:      '#D0EEEE',
    cardShadow:      'rgba(0,0,0,0.08)',

    // Text
    text:            '#1A2E2E',
    textSecondary:   '#3D6E6E',
    textMuted:       '#7A9E9E',
    textInverse:     '#FFFFFF',

    // Accents / Primary
    primary:         '#1A7A7A',
    primaryLight:    '#1A9E9E',
    accent:          '#E8A020',   // amber accent
    accentLight:     '#F0C060',

    // Status
    success:         '#2E7D32',
    warning:         '#E65100',
    danger:          '#C62828',
    info:            '#0277BD',

    // UI Elements
    badge:           '#1A7A7A',
    badgeText:       '#FFFFFF',
    notifBadge:      '#E53935',
    inputBg:         '#F0FAFA',
    inputBorder:     '#B0DEDE',
    inputText:       '#1A2E2E',
    placeholder:     '#7A9E9E',
    divider:         '#D0EEEE',
    icon:            '#1A7A7A',
    iconMuted:       '#7A9E9E',

    // SOS Button
    sosBg:           '#1A7A7A',
    sosText:         '#FFFFFF',
    sosBorder:       '#1A9E9E',

    // Quick Tile
    tileBg:          '#FFFFFF',
    tileBorder:      '#D0EEEE',
    tileText:        '#1A7A7A',
    tileSub:         '#5A8E8E',

    // Warning Banner
    warningBg:       '#FFF8E1',
    warningBorder:   '#FFD54F',
    warningText:     '#6D4C41',

    // Bottom Tab
    tabBarBg:        '#FFFFFF',
    tabBarBorder:    '#D0EEEE',
    tabActive:       '#1A7A7A',
    tabInactive:     '#7A9E9E',

    // Status colors (maintenance workflow)
    submitted:          '#7B1FA2',
    quote_requested:    '#0891B2',
    assigned:           '#0277BD',
    quoted:             '#E65100',
    quote_accepted:     '#2E7D32',
    quote_rejected:     '#C62828',
    approved_to_start:  '#7C3AED',
    work_in_progress:   '#1565C0',
    work_completed:     '#2E7D32',
    payment_requested:  '#E65100',
    payment_received:   '#0277BD',
    paid_to_vendor:     '#1B5E20',
  },

  // ─── DARK (Black / Orange — Image 1) ─────────────────────────────────────
  dark: {
    mode: 'dark',

    // Backgrounds
    background:      '#0D0D0D',
    backgroundAlt:   '#111111',
    surface:         '#181818',
    surfaceAlt:      '#1E1E1E',
    header:          '#0D0D0D',
    headerGradient:  ['#0D0D0D', '#1A1A1A'],

    // Cards
    card:            '#1C1C1C',
    cardBorder:      '#2A2A2A',
    cardShadow:      'rgba(0,0,0,0.5)',

    // Text
    text:            '#F0F0F0',
    textSecondary:   '#CCCCCC',
    textMuted:       '#777777',
    textInverse:     '#111111',

    // Accents / Primary
    primary:         '#FF6B00',   // orange primary
    primaryLight:    '#FF8C3A',
    accent:          '#FF6B00',
    accentLight:     '#FFB067',

    // Status
    success:         '#4CAF50',
    warning:         '#FF9800',
    danger:          '#F44336',
    info:            '#29B6F6',

    // UI Elements
    badge:           '#FF6B00',
    badgeText:       '#FFFFFF',
    notifBadge:      '#FF6B00',
    inputBg:         '#242424',
    inputBorder:     '#333333',
    inputText:       '#F0F0F0',
    placeholder:     '#666666',
    divider:         '#2A2A2A',
    icon:            '#FF6B00',
    iconMuted:       '#666666',

    // SOS Button
    sosBg:           '#E65000',
    sosText:         '#FFFFFF',
    sosBorder:       '#FF8C3A',

    // Quick Tile
    tileBg:          '#1C1C1C',
    tileBorder:      '#2A2A2A',
    tileText:        '#FF6B00',
    tileSub:         '#999999',

    // Warning Banner
    warningBg:       '#2A1A00',
    warningBorder:   '#FF6B00',
    warningText:     '#FFCC80',

    // Bottom Tab
    tabBarBg:        '#111111',
    tabBarBorder:    '#2A2A2A',
    tabActive:       '#FF6B00',
    tabInactive:     '#555555',

    // Status colors
    submitted:          '#CE93D8',
    quote_requested:    '#4FC3F7',
    assigned:           '#64B5F6',
    quoted:             '#FFCC80',
    quote_accepted:     '#A5D6A7',
    quote_rejected:     '#EF9A9A',
    approved_to_start:  '#CE93D8',
    work_in_progress:   '#90CAF9',
    work_completed:     '#A5D6A7',
    payment_requested:  '#FFCC80',
    payment_received:   '#81D4FA',
    paid_to_vendor:     '#C8E6C9',
  },

  // ─── CUSTOM (Dark Purple / Indigo) ────────────────────────────────────────
  custom: {
    mode: 'custom',

    // Backgrounds
    background:      '#1A1028',
    backgroundAlt:   '#1E1530',
    surface:         '#231840',
    surfaceAlt:      '#2A1F4E',
    header:          '#120D20',
    headerGradient:  ['#120D20', '#231840'],

    // Cards
    card:            '#231840',
    cardBorder:      '#3D2E6E',
    cardShadow:      'rgba(100,0,255,0.15)',

    // Text
    text:            '#EDE8FF',
    textSecondary:   '#C5BBE8',
    textMuted:       '#8A7DB0',
    textInverse:     '#120D20',

    // Accents / Primary
    primary:         '#8B5CF6',   // violet
    primaryLight:    '#A78BFA',
    accent:          '#EC4899',   // pink accent
    accentLight:     '#F472B6',

    // Status
    success:         '#34D399',
    warning:         '#FBBF24',
    danger:          '#F87171',
    info:            '#60A5FA',

    // UI Elements
    badge:           '#8B5CF6',
    badgeText:       '#FFFFFF',
    notifBadge:      '#EC4899',
    inputBg:         '#2A1F4E',
    inputBorder:     '#4C3A8A',
    inputText:       '#EDE8FF',
    placeholder:     '#6D5A9E',
    divider:         '#3D2E6E',
    icon:            '#A78BFA',
    iconMuted:       '#6D5A9E',

    // SOS Button
    sosBg:           '#7C3AED',
    sosText:         '#FFFFFF',
    sosBorder:       '#A78BFA',

    // Quick Tile
    tileBg:          '#231840',
    tileBorder:      '#3D2E6E',
    tileText:        '#A78BFA',
    tileSub:         '#8A7DB0',

    // Warning Banner
    warningBg:       '#2A1F4E',
    warningBorder:   '#8B5CF6',
    warningText:     '#C5BBE8',

    // Bottom Tab
    tabBarBg:        '#1A1028',
    tabBarBorder:    '#3D2E6E',
    tabActive:       '#A78BFA',
    tabInactive:     '#5A4A80',

    // Status colors
    submitted:          '#C084FC',
    quote_requested:    '#67E8F9',
    assigned:           '#93C5FD',
    quoted:             '#FCD34D',
    quote_accepted:     '#6EE7B7',
    quote_rejected:     '#FCA5A5',
    approved_to_start:  '#C084FC',
    work_in_progress:   '#93C5FD',
    work_completed:     '#6EE7B7',
    payment_requested:  '#FCD34D',
    payment_received:   '#7DD3FC',
    paid_to_vendor:     '#A7F3D0',
  },
};

export default themes;
