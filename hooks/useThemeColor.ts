/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { WINE_COLORS } from '@/components/wine/WineColors';
import { WineTheme, WineThemeCollection } from '@/types/theme';

type ColorName = keyof WineTheme;
type ThemeKey = 'light' | 'dark';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName | keyof Omit<WineThemeCollection, ThemeKey>
) {
  const colorScheme = useColorScheme() ?? 'light';
  const colorFromProps = props[colorScheme as ThemeKey];
  
  if (colorFromProps) {
    return colorFromProps;
  }
  
  // Si el color solicitado existe en el tema actual
  if (colorName in WINE_COLORS[colorScheme as ThemeKey]) {
    return WINE_COLORS[colorScheme as ThemeKey][colorName as ColorName];
  }
  
  // Si es un color base (fuera de los temas dark/light)
  if (colorName in WINE_COLORS && 
      colorName !== 'dark' && 
      colorName !== 'light') {
    return (WINE_COLORS as any)[colorName];
  }
  
  // Valor por defecto
  return WINE_COLORS.light.text;
}
