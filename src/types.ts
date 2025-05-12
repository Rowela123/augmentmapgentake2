// Basic types for the application

// Type for state data with properties
export interface StateData {
  state: string;      // Two-letter state code (e.g., NY, CA)
  value: number;      // Numeric value for the state
  fullName?: string;  // Optional full name of the state
  label?: string;     // Optional custom label for the state
  color?: string;     // Optional custom color for the state
  [key: string]: any; // Allow additional properties
}

// Type for saved map metadata
export interface SavedMap {
  id: string;
  name: string;
  title: string;
  description: string;
  lastModified: string;
  data: StateData[];
}

// Type for map saving parameters
export interface SaveMapParams {
  id?: string;
  name: string;
  title: string;
  data: StateData[];
  description: string;
}

// Type for color scheme options
export type ColorScheme = 'default' | 'blues' | 'greens' | 'purples' | 'reds' | 'multi';

// Mapping of state codes to full names
export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia'
};

export interface StateDataWithFormatting extends Omit<StateData, 'formatting'> {
  formatting?: {
    label?: TextFormatting | null;
    info?: TextFormatting | null;
    value?: TextFormatting | null;
    [key: string]: TextFormatting | null | undefined;
  };
}

export interface TopoJsonData {
  type: "Topology";
  objects: {
    states: {
      type: "GeometryCollection";
      geometries: Array<{
        type: string;
        id: string | number;
        properties: {
          name: string;
          [key: string]: any;
        };
        arcs: Array<number[]>;
      }>;
    };
    [key: string]: any;
  };
  arcs: Array<Array<[number, number]>>;
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

export interface MapProps {
  data: StateData[];
  title: string;
  width?: number;
  height?: number;
  colorScheme?: string[];
  selectedColorScheme?: 'default' | 'blues' | 'multi';
  scaleTitle?: string;
  minLabel?: string;
  maxLabel?: string;
  tooltipDescription?: string;
  embedded?: boolean;
  customColors?: Record<string, string>;
}

export interface MapStyleOptions {
  backgroundColor?: string;
  borderColor?: string;
  highlightColor?: string;
  textColor?: string;
  tooltipBackgroundColor?: string;
  tooltipTextColor?: string;
}

export interface EmbedOptions {
  mapTitle: string;
  width?: number;
  height?: number;
  responsive?: boolean;
}

export interface UploadResult {
  data: StateData[];
  success: boolean;
  error?: string;
}

// Define a more specific formatting interface for clarity
export interface TextFormatting {
  bold?: boolean;
}