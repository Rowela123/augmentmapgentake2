// API utility functions for interacting with storage
// This file uses local storage as a fallback when no server is available

import { StateData } from '../types';

/**
 * Saves map data and returns a short ID
 * @param data Map data to save
 * @returns Short ID for retrieving the map
 */
export const saveMapToServer = async (
  title: string,
  data: StateData[],
  options?: { scaleTitle?: string; minLabel?: string; maxLabel?: string }
): Promise<string> => {
  // Generate a simple random ID like Columns.ai
  const generateShortId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 11; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };
  
  const shortId = generateShortId();
  
  // Create a compact representation of the data
  const compactData = {
    id: shortId,
    title: title || 'US Map',
    scale: options?.scaleTitle || '',
    min: options?.minLabel || 'Low',
    max: options?.maxLabel || 'High',
    data: data
  };
  
  // Encode the data to base64 for storage
  const encodedData = btoa(unescape(encodeURIComponent(JSON.stringify(compactData))));
  
  // Store in localStorage since we don't have a server
  try {
    localStorage.setItem(`map_${shortId}`, encodedData);
    console.log('Saved map with ID:', shortId);
    return shortId;
  } catch (error) {
    console.error('Error saving map:', error);
    throw new Error('Failed to save map data');
  }
};

/**
 * Retrieves map data from the server by ID
 * @param id Map ID to retrieve
 * @returns Map data
 */
export const getMapFromServer = async (id: string) => {
  try {
    // Check localStorage for the data
    const encodedData = localStorage.getItem(`map_${id}`);
    
    if (encodedData) {
      // Decode the data
      const decodedData = decodeURIComponent(escape(atob(encodedData)));
      return JSON.parse(decodedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving map:', error);
    return null;
  }
}; 