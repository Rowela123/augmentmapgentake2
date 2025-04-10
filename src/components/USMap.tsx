import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { StateData, MapProps } from '../types';
import { generateColorScale, COLOR_SCHEMES } from '../utils/colorUtils';
import ColorLegend from './ColorLegend';

// Temporarily define a fallback function in case the import fails
interface StateMappings {
  STATE_NAMES_TO_CODES: Record<string, string>;
  STATE_CODES_TO_NAMES: Record<string, string>;
  stateNameToCode: (stateName: string) => string;
  stateCodeToName: (stateCode: string) => string;
  getAllStateNames: () => string[];
  getAllStateCodes: () => string[];
}

// Try to import stateUtils, but define a fallback if it fails
let stateUtilsModule: StateMappings;
try {
  stateUtilsModule = require('../utils/stateUtils');
} catch (e) {
  console.error("Could not import stateUtils, using fallback");
  stateUtilsModule = {
    STATE_NAMES_TO_CODES: {},
    STATE_CODES_TO_NAMES: {},
    stateNameToCode: (stateName: string) => {
      // Simple fallback for common states
      const mapping: Record<string, string> = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
        'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
        'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
        'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
        'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
        'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
        'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
        'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
        'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
        'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
        'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
      };
      return mapping[stateName] || '';
    },
    stateCodeToName: () => '',
    getAllStateNames: () => [],
    getAllStateCodes: () => []
  };
}

const { stateNameToCode } = stateUtilsModule;

interface GeoFeature {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: any;
}

// Small states that need callout labels
const SMALL_STATES = ['RI', 'DE', 'CT', 'NJ', 'MD', 'MA', 'NH', 'VT', 'DC'];

// Organized callout positioning for small states sidebar
const CALLOUT_SIDEBAR = {
  x: 80, // Offset from the right edge of the map (slightly wider)
  startY: 150, // Starting Y position for the first label (slightly higher)
  spacing: 25, // Vertical spacing between labels
  labelOffsetX: 15, // Space between the label and the callout line (increased spacing)
};

// Add this near the top of the file, with other constants
const tooltipDescription = "Popular side hustles in";

/**
 * Get a state-specific icon SVG path based on state code
 * Each state has a different icon representing common activities/themes
 */
const getStateIcon = (stateCode: string): { path: string, viewBox: string, color?: string } => {
  // Map of state codes to their respective SVG icons
  const stateIcons: Record<string, { path: string, viewBox: string, color?: string }> = {
    // Default home icon for fallback
    default: { 
      path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', 
      viewBox: '0 0 24 24' 
    },
    // California - sun icon
    CA: { 
      path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z',
      viewBox: '0 0 24 24',
      color: '#FFB300' // Golden sun
    },
    // Florida - palm tree
    FL: { 
      path: 'M18 24h-6v-6h-3c-1.1 0-2-.9-2-2V5.2C7 4.54 7.54 4 8.2 4h7.6c.66 0 1.2.54 1.2 1.2V16c0 1.1-.9 2-2 2h-3v6h6v-9l-2.08 2.08L14.6 13.5 21 7.1V5l-9 9-9-9v2.1L9.4 13.5 8.08 15.08 6 13v11z',
      viewBox: '0 0 24 24',
      color: '#00ff00' // Bright green
    },
    // Texas - cowboy hat 
    TX: {
      path: 'M2 19l2 2h16l2-2-1-1H3l-1 1zm10-7V5l5-3-1-1-4 2-4-2-1 1 5 3v7H7l-4 4h18l-4-4h-5z', 
      viewBox: '0 0 24 24',
      color: '#00ff00' // Bright green
    },
    // New York - skyscraper
    NY: {
      path: 'M12 2c-.5 0-1 .19-1.41.59l-8 8c-.79.78-.79 2.04 0 2.82l8 8c.78.78 2.04.78 2.82 0l8-8c.78-.78.78-2.03 0-2.82l-8-8C13 2.19 12.5 2 12 2zm0 14l-6-6 6-6 6 6-6 6z',
      viewBox: '0 0 24 24',
      color: '#1976D2' // Blue
    },
    // Minnesota - pine tree
    MN: {
      path: 'M17 18v-9.9l-6-4.5-6 4.5v9.9h2.5v-5h7v5H17zm-1.5-9h-2v-1.75L12 6l-1.5 1.25V9h-2l3.5-3.5 3.5 3.5z',
      viewBox: '0 0 24 24',
      color: '#2E7D32' // Forest green
    },
    // Hawaii - wave 
    HI: {
      path: 'M20 4c-3.65 0-7.09 1.48-9.6 4.13l-.1.1-.1-.1A13.39 13.39 0 0 0 .7 4L0 4.9c7.34 5.03 7.85 11.28 7.96 13.1H6l-4 2h20l-4-2h-1.96c.11-1.83.62-8.08 7.96-13.1l-.7-.9c-1.04.39-2.13.9-3.3 1.4z',
      viewBox: '0 0 24 24',
      color: '#0097A7' // Cyan/turquoise
    },
    // Colorado - mountains
    CO: {
      path: 'M21 21h-9v-7.5L9 15 6 12V9l3 3 3-1.5V7.5l3-3 6 6V21z M3 15l3-3 3 3H3z',
      viewBox: '0 0 24 24',
      color: '#5D4037' // Brown
    },
    // Arizona - cactus
    AZ: {
      path: 'M12 22h2v-5h4v-5h-2V9h2V4h-4V2h-4v2H6v5h2v3H6v5h4v5h2v-5zm1-13h-2V7h2v2z',
      viewBox: '0 0 24 24',
      color: '#8BC34A' // Light green
    },
    // Washington - coffee cup
    WA: {
      path: 'M20 3H4v7c0 3.31 2.69 6 6 6h4c3.31 0 6-2.69 6-6V3zm-2 7c0 2.21-1.79 4-4 4h-4c-2.21 0-4-1.79-4-4V5h12v5zm2 7h-4v3c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2v-3H4v2h4v1h8v-1h4v-2z',
      viewBox: '0 0 24 24',
      color: '#6D4C41' // Coffee brown
    }, 
    // Michigan - car
    MI: {
      path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
      viewBox: '0 0 24 24',
      color: '#3F51B5' // Indigo
    },
    // Alaska - snowflake
    AK: {
      path: 'M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z',
      viewBox: '0 0 24 24',
      color: '#90CAF9' // Light blue
    },
    // Georgia - peach
    GA: {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      viewBox: '0 0 24 24',
      color: '#FF7043' // Peach color
    },
    // Pennsylvania - keystone
    PA: {
      path: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25 6 2.25v4.7z',
      viewBox: '0 0 24 24',
      color: '#546E7A' // Blue-grey
    },
    // Illinois - Chicago skyline
    IL: {
      path: 'M15 9h-2V7h2v2zm-4 0H9V7h2v2zm-4 0H5V7h2v2zm12 2V7h-2v4h2zm0 2h-2v6h2v-6zm-4 6h-2v-6h2v6zm-4 0H9v-6h2v6zm-4 0H5v-6h2v6zM7 5H5v2h2V5zm12 0h-2v2h2V5zm0-2V1h-2v2h2zm-4-2h-2v2h2V1zm-4 0H9v2h2V1zM7 1H5v2h2V1z',
      viewBox: '0 0 24 24',
      color: '#455A64' // Dark blue-grey
    },
    // Tennessee - music note
    TN: {
      path: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
      viewBox: '0 0 24 24',
      color: '#FF5722' // Deep orange
    },
    // Louisiana - fleur-de-lis
    LA: {
      path: 'M12 2C9.8 2 8 3.8 8 6s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm3 9h-1.3c.9 1.4 1.3 3.2 1.3 5v2h-6v-2c0-1.8.4-3.6 1.3-5H9c-3.9 0-7 3.1-7 7v5h2v-3c0-1.1.9-2 2-2s2 .9 2 2v3h8v-3c0-1.1.9-2 2-2s2 .9 2 2v3h2v-5c0-3.9-3.1-7-7-7z',
      viewBox: '0 0 24 24',
      color: '#673AB7' // Deep purple
    },
    // Oregon - forest/trees
    OR: {
      path: 'M6.99 20V10h-5L12 3l10 7h-5v10h-1.5v-5h-7v5H6.99z',
      viewBox: '0 0 24 24',
      color: '#33691E' // Dark green
    },
    // Oklahoma - windmill/wind energy
    OK: {
      path: 'M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12zm0 0c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11zm0 0c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11zm0 0c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z',
      viewBox: '0 0 24 24',
      color: '#FB8C00' // Orange
    },
    // New Jersey - lighthouse
    NJ: {
      path: 'M11 21h2v-2h-2v2zm0-4h2v-2h-2v2zm0-12h2V3h-2v2zm0 4h2V7h-2v2zm0 4h2v-2h-2v2zm5 2h2v-2h-2v2zM5 13h2v-2H5v2zm8 8c.55 0 1-.45 1-1h-2c0 .55.45 1 1 1zm4.54-1.59-1.49-1.49c-.31-.31-.85-.09-.85.36V18h-10V7c0-.55-.45-1-1-1s-1 .45-1 1v11c0 1.1.9 2 2 2h14c.55 0 1-.45 1-1v-1.17c0-.43-.52-.65-.84-.36l-.85.85-1.48-1.48.01.01z',
      viewBox: '0 0 24 24',
      color: '#E57373' // Light red
    },
    // North Carolina - airplane
    NC: {
      path: 'M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z',
      viewBox: '0 0 24 24',
      color: '#42A5F5' // Light blue
    },
    // Massachusetts - book/education
    MA: {
      path: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',
      viewBox: '0 0 24 24',
      color: '#9C27B0' // Purple
    },
    // Indiana - race car/track
    IN: {
      path: 'M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z M14 8a2 2 0 11-4 0 2 2 0 014 0z',
      viewBox: '0 0 24 24',
      color: '#000000' // Black for tire/racing
    },
    // Wisconsin - cheese
    WI: {
      path: 'M4 10h16v10H4V10zm13.5-4l-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1-1 1-1-1V3l1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1 1 1 1-1v3z',
      viewBox: '0 0 24 24',
      color: '#FFC107' // Amber/yellow
    },
    // Ohio - flag
    OH: {
      path: 'M14 6l-4.22 5.63 1.25 1.67L14 9.33 19 16h-8.46l-4.01-5.37L1 18h22L14 6zM5 16l1.52-2.03L8.04 16H5z',
      viewBox: '0 0 24 24',
      color: '#F44336' // Red
    },
    // Alabama - football
    AL: {
      path: 'M20.96 4.96c-1.29-1.29-3.12-2-4.99-2-1.87 0-3.7.71-4.99 2-1.28 1.29-2 3.12-1.99 4.99 0 1.87.71 3.7 1.99 4.99l1.41-1.41c-1.99-1.99-1.99-5.16.01-7.15 2-2 5.15-2 7.15 0s2 5.15 0 7.15l1.41 1.41c1.29-1.29 2-3.11 2-4.99s-.71-3.7-2-4.99zM8.59 16.59l2.83 2.83c-.77.33-1.57.55-2.4.62v-3.45zm-1 .36v3.45c-.83-.07-1.63-.29-2.4-.62l2.4-2.83zm12.83-12.83l-2.83-2.83c.77-.33 1.57-.55 2.4-.62v3.45zm-1 .36V1.03c.83.07 1.63.29 2.4.62l-2.4 2.83zM2.38 8.25h5.16l-9.13 9.72zM7.6 8.25l2.62-5.25h-5.8L1.55 8.25z',
      viewBox: '0 0 24 24',
      color: '#D84315' // Crimson
    },
    // New Mexico - sun symbol
    NM: {
      path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0-6c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z',
      viewBox: '0 0 24 24',
      color: '#FFC107' // Amber
    },
    // Virginia - history/colonial
    VA: {
      path: 'M9 6.5c0-.28.22-.5.5-.5h2.52L15 3H9c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-13h-3.98L9 11.02V6.5zM11 17.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-7c0-.28.22-.5.5-.5s.5.22.5.5v7z',
      viewBox: '0 0 24 24',
      color: '#78909C' // Blue grey
    },
    // Maine - lighthouse
    ME: {
      path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
      viewBox: '0 0 24 24',
      color: '#0277BD' // Deep blue
    },
    // Utah - mountains
    UT: {
      path: 'M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z',
      viewBox: '0 0 24 24',
      color: '#D81B60' // Pink
    },
    // South Carolina - palmetto tree
    SC: {
      path: 'M17 9v4.88c.04.3-.06.62-.29.83-.5.45-1.26.32-1.57-.21L14 13.17l-1.15 1.34c-.31.52-1.07.65-1.56.2-.23-.21-.33-.53-.29-.83V9H9v4.88c.04.3-.06.62-.29.83-.5.45-1.26.32-1.57-.21L6 13.17 4.85 14.5c-.31.52-1.07.65-1.56.2-.23-.21-.33-.53-.29-.83V9H2v9h20V9h-5z',
      viewBox: '0 0 24 24',
      color: '#558B2F' // Olive green
    },
    // Kentucky - horse
    KY: {
      path: 'M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm0-14v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9 4.97 0 9-4.03 9-9s-4.03-9-9-9h-1z',
      viewBox: '0 0 24 24',
      color: '#1B5E20' // Kentucky bluegrass green
    },
    // Arkansas - diamond
    AR: {
      path: 'M12.16 3h-.32L9.21 8.25h5.58zm4.3 5.25h5.16l-9.13 9.72zM13.32 18.68L22.45 8.97h-5.16zm-2.63 0L1.55 8.97h5.16zM2.38 8.25h5.16l-9.13 9.72zM7.6 8.25l2.62-5.25h-5.8L1.55 8.25z',
      viewBox: '0 0 24 24',
      color: '#7B1FA2' // Purple
    },
    // Nevada - cards/casino
    NV: {
      path: 'M21.47 4.35l.13 1.169-6.445 6.44 2.121 2.122-1.414 1.414-2.121-2.121-6.44 6.44-1.17-.13h-.01l-1.045-1.046.13-1.17 6.44-6.439-2.12-2.121 1.414-1.414 2.121 2.121 6.439-6.44 1.169.13 1.045 1.046z',
      viewBox: '0 0 24 24',
      color: '#EF5350' // Red
    },
    // Iowa - farm/tractor
    IA: {
      path: 'M7 7v2H3v4h2l-3 5h1.5l3-5H9c0 1.66 1.34 3 3 3s3-1.34 3-3h7v-4h-2V7H7z',
      viewBox: '0 0 24 24',
      color: '#558B2F' // Green
    },
    // Connecticut - oak leaf
    CT: {
      path: 'M6 2l.01 6c-.36.35-.6.82-.64 1.35-.03.53.16 1.04.5 1.41 0 .01.01.01.01.02l.31.29c-.23.3-.38.65-.38 1.04 0 .95.78 1.73 1.73 1.73.29 0 .57-.07.81-.2.19.13.38.24.59.34.01.37.19.71.47.95.32.33.83.48 1.3.43.42-.05.76-.35.93-.74.21-.05.4-.11.6-.19.19.08.39.14.6.19.16.39.51.69.93.74.47.05.98-.1 1.3-.43.28-.24.46-.58.47-.95.21-.1.4-.21.59-.34.24.13.52.2.81.2.95 0 1.73-.78 1.73-1.73 0-.39-.15-.74-.38-1.04l.31-.29c0-.01.01-.01.01-.02.34-.37.53-.88.5-1.41-.04-.53-.28-1-.64-1.35L18 2l-6 7-6-7z',
      viewBox: '0 0 24 24',
      color: '#795548' // Brown
    }
  };

  // Return the icon for this state, or default if not found
  return stateIcons[stateCode] || stateIcons.default;
};

const USMap: React.FC<MapProps> = ({ 
  data, 
  title, 
  width = 960, 
  height = 600, 
  colorScheme = COLOR_SCHEMES.default,
  selectedColorScheme = 'default',
  scaleTitle = '',
  minLabel = '',
  maxLabel = '',
  tooltipDescription = 'Popular side hustles and their average monthly earnings in',
  embedded = false
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [usaData, setUsaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [minValue, setMinValue] = useState<number>(Infinity);
  const [maxValue, setMaxValue] = useState<number>(-Infinity);
  const [colorScaleFunc, setColorScaleFunc] = useState<any>(null);

  // Log received data for debugging
  useEffect(() => {
    console.log('Data received in USMap component:', data);
  }, [data]);

  // Create a data map for quick access
  const stateDataMap = data.reduce((acc: Record<string, StateData>, state) => {
    if (!state.stateCode) {
      console.warn('State data missing stateCode:', state);
      return acc;
    }
    acc[state.stateCode] = state;
    return acc;
  }, {});

  useEffect(() => {
    // Fetch US TopoJSON data
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load US map data');
        }
        return response.json();
      })
      .then(usData => {
        console.log('TopoJSON data loaded successfully');
        setUsaData(usData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading TopoJSON data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !usaData || !tooltipRef.current) return;

    console.log('Rendering map with data for states:', Object.keys(stateDataMap));

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Setup SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Setup tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('opacity', 0);

    try {
      // Create projection and path generator
      const geoData = topojson.feature(usaData, usaData.objects.states);
      const projection = d3.geoAlbersUsa()
        .fitSize([width - CALLOUT_SIDEBAR.x - 20, height], geoData as any); // Adjust map width to make room for sidebar

      const path = d3.geoPath().projection(projection);

      // Determine data range for color scale
      let min = Infinity;
      let max = -Infinity;

      data.forEach(d => {
        if (typeof d.value === 'number') {
          min = Math.min(min, d.value);
          max = Math.max(max, d.value);
        }
      });

      // Update the state with min and max values
      setMinValue(min);
      setMaxValue(max);

      // Create color scale using the selected scheme
      const selectedColors = COLOR_SCHEMES[selectedColorScheme];
      const colorScale = generateColorScale(selectedColors, min, max);
      setColorScaleFunc(colorScale);

      // Store centroids for later label placement
      const stateCentroids: {[key: string]: [number, number]} = {};

      // Draw states
      svg.append('g')
        .selectAll('path')
        .data((geoData as any).features)
        .join('path')
        .attr('class', 'state')
        .attr('d', function(d) { return path(d as any) as string; })
        .attr('fill', function(d) {
          const feature = d as any;
          const stateCode = stateNameToCode(feature.properties.name);
          const stateData = stateDataMap[stateCode];
          
          // Calculate and store centroid
          const centroid = path.centroid(d as any);
          if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
            stateCentroids[stateCode] = centroid;
          }
          
          // If we have data and a color for this state, use it
          if (stateData?.color && selectedColorScheme === 'default') return stateData.color;
          
          // If we have a numeric value, use the color scale
          if (stateData && typeof stateData.value === 'number') {
            return colorScale(stateData.value);
          }
          
          // Default color for states without data
          return '#e0e0e0';
        })
        .on('mouseover', function(event, d) {
          const feature = d as any;
          const stateCode = stateNameToCode(feature.properties.name);
          const stateData = stateDataMap[stateCode];
          
          d3.select(this)
            .attr('stroke', '#000')
            .attr('stroke-width', 1.5)
            .classed('active', true);
            
          tooltip
            .classed('visible', true)
            .transition()
            .duration(200)
            .style('opacity', 0.98);
            
          // Create tooltip content with state-specific icon and formatted content
          let tooltipContent = '';
          
          // Get state-specific icon
          const stateIcon = getStateIcon(stateCode);
          
          // Add header with state-specific icon and state name
          tooltipContent += `
            <div class="tooltip-header">
              <div class="tooltip-icon" style="background-color: ${stateIcon.color || '#4CAF50'}">
                <svg viewBox="${stateIcon.viewBox}" width="18" height="18" fill="currentColor">
                  <path d="${stateIcon.path}"></path>
                </svg>
              </div>
              <h3 class="tooltip-title" ${stateIcon.color ? `style="color: ${stateIcon.color}"` : ''}>${feature.properties.name.toUpperCase()}</h3>
            </div>
          `;
          
          // Add content based on available data
          if (stateData) {
            // Add description and list items if available
            if (stateData.label || stateData.info) {
              tooltipContent += `
                <p class="tooltip-description">
                  ${tooltipDescription} ${feature.properties.name}:
                </p>
                <div class="tooltip-content">
              `;
              
              // Create an array to store all items (label + info)
              const allItems = [];
              
              // Add the main item (from label) if it exists
              if (stateData.label) {
                allItems.push(formatTooltipItem(stateData.label));
              }
              
              // If we have additional info, split by commas or line breaks and add as list items
              if (stateData.info) {
                const additionalItems = stateData.info.split(/,|\n/).filter(Boolean);
                allItems.push(...additionalItems.map(formatTooltipItem));
              }
              
              // Add numbered list of items
              if (allItems.length > 0) {
                tooltipContent += '<ol class="tooltip-list">';
                allItems.forEach(item => {
                  tooltipContent += `<li>${item}</li>`;
                });
                tooltipContent += '</ol>';
              }
              
              tooltipContent += '</div>';
            } else {
              // Fallback for states with value but no description
              if (stateData.value !== undefined && stateData.value !== null) {
                tooltipContent += `
                  <div class="tooltip-row">
                    <span class="label">Value:</span>
                    <span class="value">${formatValue(stateData.value)}</span>
                  </div>
                `;
              }
            }
          } else {
            tooltipContent += `<p class="tooltip-description">No data available for this state.</p>`;
          }
          
          // Calculate position for tooltip
          const tooltipWidth = 320;
          const tooltipHeight = 200;
          
          // Get mouse coordinates and adjust for window boundaries
          let [mouseX, mouseY] = [event.pageX, event.pageY];
          
          // Check if we're too close to the right edge
          if (mouseX + tooltipWidth + 20 > window.innerWidth) {
            mouseX = mouseX - tooltipWidth - 20;
          } else {
            mouseX = mouseX + 15;
          }
          
          // Check if we're too close to the bottom edge
          if (mouseY + tooltipHeight + 20 > window.innerHeight) {
            mouseY = mouseY - tooltipHeight - 10;
          } else {
            mouseY = mouseY - 25;
          }
          
          tooltip.html(tooltipContent)
            .style('left', mouseX + 'px')
            .style('top', mouseY + 'px');
            
          // Add highlight marker for states with data
          if (stateData && (stateData.label || stateData.info)) {
            const centroid = path.centroid(d as any);
            if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
              const existingMarker = svg.select('.state-marker');
              
              if (existingMarker.empty()) {
                svg.append('circle')
                  .attr('class', 'state-marker')
                  .attr('r', 10)
                  .attr('cx', centroid[0])
                  .attr('cy', centroid[1])
                  .style('fill', stateIcon.color || '#4CAF50')
                  .style('opacity', 0.2);
              } else {
                existingMarker
                  .attr('cx', centroid[0])
                  .attr('cy', centroid[1])
                  .style('fill', stateIcon.color || '#4CAF50')
                  .style('opacity', 0.2);
              }
            }
          }
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', '#fff')
            .attr('stroke-width', 0.5)
            .classed('active', false);
            
          tooltip
            .classed('visible', false)
            .transition()
            .duration(300)
            .style('opacity', 0);
            
          // Hide the marker
          svg.select('.state-marker')
            .style('opacity', 0);
        });

      // Create a group for state labels
      const labelsGroup = svg.append('g')
        .attr('class', 'state-labels');
      
      // Create a group for callout lines
      const calloutsGroup = svg.append('g')
        .attr('class', 'callout-lines');
      
      // Create a sidebar group for small state labels
      const sidebarGroup = svg.append('g')
        .attr('class', 'state-sidebar')
        .attr('transform', `translate(${width - CALLOUT_SIDEBAR.x}, 0)`);
      
      // Regular state labels (for non-small states)
      const regularStateLabels = Object.entries(stateCentroids).filter(([stateCode]) => 
        !SMALL_STATES.includes(stateCode)
      );
      
      // Add regular state code labels
      regularStateLabels.forEach(([stateCode, centroid]) => {
        if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;
        
        // Add state code directly on the state
        labelsGroup.append('text')
          .attr('x', centroid[0])
          .attr('y', centroid[1])
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .style('font-size', '10px')
          .style('font-weight', 'bold')
          .style('pointer-events', 'none')
          .style('font-family', 'Arial, sans-serif')
          .style('fill', '#333')
          .style('text-shadow', '1px 1px 1px rgba(255,255,255,0.7), -1px -1px 1px rgba(255,255,255,0.7), 1px -1px 1px rgba(255,255,255,0.7), -1px 1px 1px rgba(255,255,255,0.7)')
          .text(stateCode);
      });
      
      // Sort small states for consistent ordering in the sidebar
      const sortedSmallStates = [...SMALL_STATES].sort();
      
      // Add small state labels in the sidebar
      sortedSmallStates.forEach((stateCode, index) => {
        const centroid = stateCentroids[stateCode];
        if (!centroid || isNaN(centroid[0]) || isNaN(centroid[1])) return;
        
        // Calculate label Y position
        const labelY = CALLOUT_SIDEBAR.startY + (index * CALLOUT_SIDEBAR.spacing);
        
        // Draw curved callout line
        const lineGenerator = d3.line().curve(d3.curveBasis);
        
        // Calculate control points for the curve
        const startPoint = centroid;
        const endPoint = [width - CALLOUT_SIDEBAR.x - CALLOUT_SIDEBAR.labelOffsetX, labelY];
        
        // Create a curved path with control points
        const controlPoint1 = [
          startPoint[0] + (endPoint[0] - startPoint[0]) * 0.4,
          startPoint[1] + (endPoint[1] - startPoint[1]) * 0.2
        ];
        
        const controlPoint2 = [
          startPoint[0] + (endPoint[0] - startPoint[0]) * 0.6,
          startPoint[1] + (endPoint[1] - startPoint[1]) * 0.8
        ];
        
        // Create curve path
        const pathData = lineGenerator([
          startPoint,
          controlPoint1 as [number, number],
          controlPoint2 as [number, number],
          endPoint as [number, number]
        ]);
        
        // Draw the curved callout line
        calloutsGroup.append('path')
          .attr('d', pathData)
          .attr('fill', 'none')
          .attr('stroke', '#666')
          .attr('stroke-width', 0.7)
          .attr('stroke-dasharray', '2,1')
          .attr('opacity', 0.7);
        
        // Add small circle at the state centroid
        calloutsGroup.append('circle')
          .attr('cx', centroid[0])
          .attr('cy', centroid[1])
          .attr('r', 3)
          .attr('fill', '#555')
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);
        
        // Add state code label in the sidebar - make it a bit larger and clearer
        sidebarGroup.append('text')
          .attr('x', 0)
          .attr('y', labelY)
          .attr('text-anchor', 'start')
          .attr('alignment-baseline', 'middle')
          .style('font-size', '13px') // Increased font size
          .style('font-weight', 'bold')
          .style('font-family', 'Arial, sans-serif')
          .style('fill', '#333')
          .text(stateCode);
        
        // Add small dot at the sidebar end of the callout line
        sidebarGroup.append('circle')
          .attr('cx', -CALLOUT_SIDEBAR.labelOffsetX)
          .attr('cy', labelY)
          .attr('r', 3) // Slightly larger dot
          .attr('fill', '#555') // Darker fill to match the centroid dot
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5);
      });

      // Add title
      svg.append('text')
        .attr('x', (width - CALLOUT_SIDEBAR.x) / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
        .text(title);

      // If embedded, send a message to the parent window when map is loaded
      if (embedded && window.parent !== window) {
        window.parent.postMessage({ type: 'MAP_LOADED', success: true }, '*');
      }
    } catch (error) {
      console.error("Error rendering map:", error);
    }
  }, [usaData, data, title, width, height, colorScheme, selectedColorScheme, stateDataMap, embedded, tooltipDescription]);

  if (loading) {
    return <div>Loading map data...</div>;
  }

  if (error) {
    return <div>Error loading map: {error}</div>;
  }

  return (
    <div className="map-container">
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef} className="tooltip"></div>
      
      {/* Dynamic scale that updates with the data */}
      {data.length > 0 && (
        <div style={{ 
          margin: '20px auto',
          width: '300px',
          textAlign: 'center',
          padding: '5px',
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '3px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '5px'
          }}>
            <span style={{ fontSize: '12px' }}>{minLabel || (minValue === Infinity ? '0' : minValue.toString())}</span>
            {scaleTitle && <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{scaleTitle}</span>}
            <span style={{ fontSize: '12px' }}>{maxLabel || (maxValue === -Infinity ? '1000' : maxValue.toString())}</span>
          </div>
          
          {/* Dynamic gradient based on custom colors if available */}
          {(() => {
            // Only use custom colors if we're in default scheme
            if (selectedColorScheme === 'default') {
              const customColors = data
                .filter(d => d.color)
                .map(d => ({ 
                  color: d.color as string, 
                  value: typeof d.value === 'number' ? d.value : 0 
                }))
                .sort((a, b) => a.value - b.value);
              
              if (customColors.length >= 2) {
                // If we have multiple custom colors, create a multi-stop gradient
                const stops = customColors.map((item, index) => {
                  const gradientPosition = Math.round(100 * (index) / (customColors.length - 1));
                  return `${item.color} ${gradientPosition}%`;
                }).join(', ');
                
                return (
                  <div style={{
                    height: '15px',
                    width: '100%',
                    background: `linear-gradient(to right, ${stops})`,
                    border: '1px solid #ccc'
                  }} />
                );
              }
            }
            
            // For blue scheme or when no custom colors available
            const selectedColors = COLOR_SCHEMES[selectedColorScheme];
            return (
              <div style={{
                height: '15px',
                width: '100%',
                background: `linear-gradient(to right, ${selectedColors[0]}, ${selectedColors[1]})`,
                border: '1px solid #ccc'
              }} />
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Add these helper functions near the top of the file
function formatTooltipItem(text: string): string {
  // Remove numbers in square brackets
  let cleanText = text.replace(/\[[0-9,]+\]/g, '').trim();
  
  // Remove leading/trailing colons, dashes, or em dashes
  cleanText = cleanText.replace(/^[:\-—]+|[:\-—]+$/g, '').trim();
  
  // Handle bold text (marked with **)
  const boldMatch = cleanText.match(/\*\*(.*?)\*\*/);
  if (boldMatch && boldMatch.index !== undefined) {
    const boldText = boldMatch[1];
    const beforeText = cleanText.substring(0, boldMatch.index);
    const afterText = cleanText.substring(boldMatch.index + boldMatch[0].length);
    return `${beforeText}<strong>${boldText}</strong>${afterText}`;
  }
  
  return cleanText;
}

function formatValue(value: string | number): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return value;
}

export default USMap; 