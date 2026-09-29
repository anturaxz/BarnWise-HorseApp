/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#24392F',
    tint: '#285640',
    background: '#F5F3EA',
    foreground: '#24392F',
    card: '#FFFDF8',
    cardForeground: '#24392F',
    primary: '#285640',
    primaryForeground: '#FFFDF7',
    secondary: '#E8E9DE',
    secondaryForeground: '#34483B',
    muted: '#E9EBE3',
    mutedForeground: '#748077',
    accent: '#E7A57E',
    accentForeground: '#3B3028',
    destructive: '#B64F47',
    destructiveForeground: '#FFFFFF',
    border: '#E1E2D8',
    input: '#E1E2D8',
  },
  dark: {
    text: '#F4F1E8',
    tint: '#A7C9AE',
    background: '#15211A',
    foreground: '#F4F1E8',
    card: '#1D2C23',
    cardForeground: '#F4F1E8',
    primary: '#A7C9AE',
    primaryForeground: '#15211A',
    secondary: '#2A3B30',
    secondaryForeground: '#E7EFE5',
    muted: '#2A3B30',
    mutedForeground: '#ACB9AD',
    accent: '#E7A57E',
    accentForeground: '#38281E',
    destructive: '#E47C72',
    destructiveForeground: '#271715',
    border: '#34453A',
    input: '#34453A',
  },
  radius: 18,
};

export default colors;
