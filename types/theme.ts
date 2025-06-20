import { WINE_COLORS } from '@/components/wine/WineColors';
export interface WineTheme {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  textLight: string;
  input: string;
  burgundy: string;
  burgundyLight: string;
  burgundyDark: string;
  gold: string;
  surface: string;
  border: string;
}
// Extendemos los tipos para permitir acceso mediante índice
export interface WineThemeCollection {
  dark: WineTheme;
  light: WineTheme;
  burgundy: string;
  burgundyLight: string;
  burgundyDark: string;
  gold: string;
  goldLight: string;
  black: string;
  darkGray: string;
  lightGray: string;
  white: string;
  error: string;
  [key: string]: WineTheme | string;
}
// Verificamos que WINE_COLORS cumple con la interfaz
export const themeColors: WineThemeCollection = WINE_COLORS; 