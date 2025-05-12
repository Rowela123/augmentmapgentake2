import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { StateData, MapProps } from '../types';
import { generateColorScale, COLOR_SCHEMES } from '../utils/colorUtils';
import ColorLegend from './ColorLegend';
import styled from 'styled-components';

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

interface USMapProps {
  data: StateData[];
  title?: string;
  scaleTitle?: string;
  minLabel?: string;
  maxLabel?: string;
  tooltipDescription?: string;
  selectedColorScheme?: 'default' | 'blues';
  embedded?: boolean;
}

const MapContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
`;

const MapSvgContainer = styled.div`
  position: relative;
  width: 100%;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const USMap: React.FC<USMapProps> = ({
  data,
  title,
  scaleTitle = '',
  minLabel = 'Low',
  maxLabel = 'High',
  tooltipDescription = 'Value for',
  selectedColorScheme = 'default',
  embedded = false
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [mapWidth, setMapWidth] = useState(0);

  useEffect(() => {
    // Simple placeholder effect that would normally create the D3 map
    // In a real implementation, this would use D3 to render the US map

    console.log('USMap: Rendering map with', data.length, 'states');

    const container = d3.select(svgRef.current?.parentElement);
    const width = container.node() ? (container.node() as HTMLElement).getBoundingClientRect().width : 800;
    setMapWidth(width);

    const height = width * 0.6;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Clear previous map
    svg.selectAll('*').remove();

    // In a real implementation, this would:
    // 1. Load and render US states from TopoJSON
    // 2. Set up the color scale based on data values
    // 3. Add event handlers for tooltips
    // 4. Add legends and other UI elements

    // For now, just add a placeholder text
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .text('US Map would render here with real implementation');

    // Add a sample colorful rectangle for each state to demonstrate data binding
    const stateWidth = 40;
    const stateHeight = 25;
    const statesPerRow = Math.floor(width / stateWidth);

    // Create a color scale for the states
    const colorScale = d3.scaleLinear<string>()
      .domain([0, d3.max(data, d => d.value) || 100])
      .range(['#e5f5e0', '#31a354']);

    // Render a rectangle for each state
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => (i % statesPerRow) * stateWidth)
      .attr('y', (d, i) => Math.floor(i / statesPerRow) * stateHeight)
      .attr('width', stateWidth - 2)
      .attr('height', stateHeight - 2)
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', '#fff')
      .on('mouseover', function(event, d) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('opacity', 1)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`)
          .html(`
            <strong>${d.fullName || d.state}</strong><br>
            ${d.label ? d.label + ': ' : ''}${d.value}
          `);
      })
      .on('mouseout', function() {
        d3.select(tooltipRef.current).style('opacity', 0);
      });

    // Add state labels
    svg.selectAll('text.state-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'state-label')
      .attr('x', (d, i) => (i % statesPerRow) * stateWidth + stateWidth / 2)
      .attr('y', (d, i) => Math.floor(i / statesPerRow) * stateHeight + stateHeight / 2 + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8px')
      .text(d => d.state);

    // Simple legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - 40;

    // Legend container
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${legendX}, ${legendY})`);

    // Legend gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#e5f5e0');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#31a354');

    // Legend bar
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#legend-gradient)');

    // Legend labels
    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 15)
      .attr('text-anchor', 'start')
      .text(minLabel);

    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 15)
      .attr('text-anchor', 'end')
      .text(maxLabel);

    if (scaleTitle) {
      legend.append('text')
        .attr('x', legendWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .text(scaleTitle);
    }

  }, [data, minLabel, maxLabel, scaleTitle, tooltipDescription, selectedColorScheme]);

  // Extract custom colors from data
  const customColors: Record<string, string> = {};
  data.forEach(state => {
    if (state.color) {
      customColors[state.state] = state.color;
    }
  });

  return (
    <MapContainer>
      {title && !embedded && <Title>{title}</Title>}
      <MapSvgContainer>
        <svg ref={svgRef}></svg>
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'absolute',
            opacity: 0,
            background: 'white',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        ></div>
      </MapSvgContainer>

      {/* Add ColorLegend component */}
      <ColorLegend
        colorScale={selectedColorScheme === 'blues' ? COLOR_SCHEMES.blues : COLOR_SCHEMES.default}
        minValue={d3.min(data, d => d.value) || 0}
        maxValue={d3.max(data, d => d.value) || 100}
        title={scaleTitle}
        minLabel={minLabel}
        maxLabel={maxLabel}
        customColors={customColors}
        colorScheme={selectedColorScheme}
      />
    </MapContainer>
  );
};

export default USMap;