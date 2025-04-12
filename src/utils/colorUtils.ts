import * as d3 from 'd3';

/**
 * Generate a color scale function using D3
 * @param colors Array of colors to interpolate between
 * @param min Minimum data value
 * @param max Maximum data value
 * @returns A function that takes a value and returns a color
 */
export const generateColorScale = (colors: string[], min: number, max: number) => {
  const scale = d3.scaleLinear<string>()
    .domain([min, max])
    .range(colors as any)
    .clamp(true);
  
  return (value: number) => scale(value);
};

/**
 * Get a predefined color scheme by name
 * @param scheme Name of the color scheme
 * @returns Array of colors
 */
export const getColorScheme = (scheme: string): string[] => {
  const schemes: Record<string, string[]> = {
    'default': ['#e5f5e0', '#31a354'],
    'blues': ['#f7fbff', '#08519c'],
    'reds': ['#fee5d9', '#a50f15'],
    'purples': ['#efedf5', '#54278f'],
    'oranges': ['#fef0d9', '#d94701']
  };
  
  return schemes[scheme] || schemes.default;
};

/**
 * Calculate a suitable range for a color scale based on data
 * @param data Array of numeric values
 * @returns Object with min and max values
 */
export const calculateDataRange = (data: number[]): { min: number; max: number } => {
  if (!data || data.length === 0) {
    return { min: 0, max: 100 };
  }
  
  // Filter out undefined/null values and get valid numbers
  const validData = data.filter(d => d !== undefined && d !== null && !isNaN(d));
  
  if (validData.length === 0) {
    return { min: 0, max: 100 };
  }
  
  const min = Math.min(...validData);
  const max = Math.max(...validData);
  
  // If min and max are the same, create a small range
  if (min === max) {
    return { 
      min: min === 0 ? 0 : min * 0.9, 
      max: max === 0 ? 100 : max * 1.1 
    };
  }
  
  return { min, max };
};

/**
 * Format a number for display with dollar sign and commas
 * @param value Number to format
 * @returns Formatted string
 */
export const formatCurrency = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }
  
  // Format with commas
  return `$${value.toLocaleString()}`;
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