export interface StateData {
  stateCode: string;
  stateName: string;
  value?: number | string;
  label?: string;
  info?: string;
  color?: string;
  formatting?: {
    label?: { bold?: boolean } | null;
    info?: { bold?: boolean } | null;
    value?: { bold?: boolean } | null;
    [key: string]: any;
  };
}

// Define a new SavedMap interface to store multiple maps
export interface SavedMap {
  id: string;
  name: string;
  title: string;
  data: StateData[];
  createdAt: string;
  lastModified: string;
  description?: string;
}

// Define a more specific formatting interface for clarity
export interface TextFormatting {
  bold?: boolean;
}

// Update StateData with the more specific formatting type
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
  selectedColorScheme?: 'default' | 'blues';
  scaleTitle?: string;
  minLabel?: string;
  maxLabel?: string;
  tooltipDescription?: string;
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