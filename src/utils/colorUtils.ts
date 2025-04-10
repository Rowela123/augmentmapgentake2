import * as d3 from 'd3';

export const COLOR_SCHEMES = {
  default: ['#f7fbff', '#08519c'],
  blues: ['#f7fbff', '#034e7b'],  // Deep blue scheme
};

/**
 * Generates a color scale based on the provided color scheme and value range.
 * @param colorScheme Array of colors defining the color scheme
 * @param minValue Minimum value in the data range
 * @param maxValue Maximum value in the data range
 * @returns A function that maps values to colors
 */
export const generateColorScale = (
  colorScheme: string[] = COLOR_SCHEMES.default,
  minValue: number = 0, 
  maxValue: number = 100
): ((value: number) => string) => {
  // Create a linear scale with D3
  const scale = d3.scaleLinear<string>()
    .domain([minValue, maxValue])
    .range(colorScheme as any) // Cast needed due to TypeScript constraints
    .clamp(true);

  return (value: number) => scale(value);
};

/**
 * Generates a color palette with a specified number of colors
 * @param baseColor The base color to derive the palette from
 * @param count Number of colors to generate
 * @returns Array of hex color strings
 */
export const generateColorPalette = (
  baseColor: string = '#3182bd',
  count: number = 5
): string[] => {
  const baseHsl = d3.hsl(baseColor);
  const colors: string[] = [];

  // Generate variants by adjusting lightness
  for (let i = 0; i < count; i++) {
    const lightness = baseHsl.l * (0.5 + (i / count) * 0.8);
    colors.push(d3.hsl(baseHsl.h, baseHsl.s, lightness).toString());
  }

  return colors;
};

/**
 * Returns the text color (black or white) that provides the best contrast 
 * against the given background color
 * @param backgroundColor Hex color string
 * @returns '#000000' for dark text or '#ffffff' for light text
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);
  
  // Calculate luminance using the formula from W3C
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#ffffff';
}; 