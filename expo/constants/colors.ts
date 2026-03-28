export const colors = {
  // iOS 18 System Colors - Enhanced
  primary: '#007AFF', // iOS Blue
  secondary: '#34C759', // iOS Green
  background: '#FFFFFF',
  surface: '#F2F2F7', // iOS grouped background
  surfaceSecondary: '#FFFFFF',
  text: '#000000', // True black for iOS
  textSecondary: '#8E8E93', // iOS secondary label
  textTertiary: '#C7C7CC', // iOS tertiary label
  border: '#C6C6C8', // iOS separator
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  
  // Enhanced iOS 18 specific system colors
  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemIndigo: '#5856D6',
  systemOrange: '#FF9500',
  systemPink: '#FF2D92',
  systemPurple: '#AF52DE',
  systemRed: '#FF3B30',
  systemTeal: '#5AC8FA',
  systemYellow: '#FFCC00',
  systemMint: '#00C7BE',
  systemCyan: '#32D2FF',
  
  // Role-specific colors for better UX
  athleteAccent: '#007AFF', // Blue for athletes
  coachAccent: '#34C759', // Green for coaches
  athleteBackground: 'rgba(0, 122, 255, 0.08)',
  coachBackground: 'rgba(52, 199, 89, 0.08)',
  
  // iOS grouped table colors
  groupedBackground: '#F2F2F7',
  secondaryGroupedBackground: '#FFFFFF',
  tertiaryGroupedBackground: '#F2F2F7',
  
  // Enhanced iOS fill colors with better contrast
  systemFill: 'rgba(120, 120, 128, 0.20)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',
  
  // Enhanced shadow colors for depth
  shadow: 'rgba(0, 0, 0, 0.12)',
  shadowLight: 'rgba(0, 0, 0, 0.06)',
  shadowMedium: 'rgba(0, 0, 0, 0.18)',
  shadowHeavy: 'rgba(0, 0, 0, 0.25)',
  
  // Card-specific colors
  cardBackground: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  // Interactive states
  pressedOverlay: 'rgba(0, 0, 0, 0.06)',
  hoverOverlay: 'rgba(0, 0, 0, 0.04)',
  
  // Gradient colors - Fixed with proper tuple typing
  primaryGradient: ['#007AFF', '#5856D6'] as const,
  secondaryGradient: ['#34C759', '#30D158'] as const,
  athleteGradient: ['#007AFF', '#0A84FF'] as const,
  coachGradient: ['#34C759', '#30D158'] as const,
};

export const darkColors = {
  // iOS 18 Dark Mode Colors - Enhanced
  primary: '#0A84FF', // iOS Blue Dark
  secondary: '#30D158', // iOS Green Dark
  background: '#000000', // True black
  surface: '#1C1C1E', // iOS grouped background dark
  surfaceSecondary: '#2C2C2E',
  text: '#FFFFFF', // True white for dark mode
  textSecondary: '#8E8E93', // iOS secondary label dark
  textTertiary: '#48484A', // iOS tertiary label dark
  border: '#38383A', // iOS separator dark
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
  
  // Enhanced iOS 18 specific system colors dark
  systemBlue: '#0A84FF',
  systemGreen: '#30D158',
  systemIndigo: '#5E5CE6',
  systemOrange: '#FF9F0A',
  systemPink: '#FF375F',
  systemPurple: '#BF5AF2',
  systemRed: '#FF453A',
  systemTeal: '#40C8E0',
  systemYellow: '#FFD60A',
  systemMint: '#63E6E2',
  systemCyan: '#64D2FF',
  
  // Role-specific colors for dark mode
  athleteAccent: '#0A84FF',
  coachAccent: '#30D158',
  athleteBackground: 'rgba(10, 132, 255, 0.15)',
  coachBackground: 'rgba(48, 209, 88, 0.15)',
  
  // iOS grouped table colors dark
  groupedBackground: '#000000',
  secondaryGroupedBackground: '#1C1C1E',
  tertiaryGroupedBackground: '#2C2C2E',
  
  // Enhanced iOS fill colors dark
  systemFill: 'rgba(120, 120, 128, 0.36)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.32)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.24)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.18)',
  
  // Enhanced shadow colors dark
  shadow: 'rgba(0, 0, 0, 0.4)',
  shadowLight: 'rgba(0, 0, 0, 0.25)',
  shadowMedium: 'rgba(0, 0, 0, 0.5)',
  shadowHeavy: 'rgba(0, 0, 0, 0.6)',
  
  // Card-specific colors for dark mode
  cardBackground: '#1C1C1E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  
  // Interactive states for dark mode
  pressedOverlay: 'rgba(255, 255, 255, 0.08)',
  hoverOverlay: 'rgba(255, 255, 255, 0.04)',
  
  // Gradient colors dark
  primaryGradient: ['#0A84FF', '#5E5CE6'] as const,
  secondaryGradient: ['#30D158', '#32D74B'] as const,
  athleteGradient: ['#0A84FF', '#007AFF'] as const,
  coachGradient: ['#30D158', '#34C759'] as const,
};

export default {
  light: {
    text: colors.text,
    background: colors.background,
    tint: colors.primary,
    tabIconDefault: colors.textSecondary,
    tabIconSelected: colors.primary,
  },
  dark: {
    text: darkColors.text,
    background: darkColors.background,
    tint: darkColors.primary,
    tabIconDefault: darkColors.textSecondary,
    tabIconSelected: darkColors.primary,
  },
};