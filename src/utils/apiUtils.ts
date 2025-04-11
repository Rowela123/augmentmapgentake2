import { StateData } from '../types';

const API_BASE_URL = '/api/maps';

interface SaveMapResponse {
  id: string;
  success: boolean;
}

export interface SavedMapData {
  title: string;
  data: StateData[];
  scaleTitle?: string;
  minLabel?: string;
  maxLabel?: string;
}

/**
 * Save map data to the server and get a unique ID
 */
export const saveMapToServer = async (mapData: SavedMapData): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapData),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data: SaveMapResponse = await response.json();
    
    if (data.success && data.id) {
      return data.id;
    } else {
      throw new Error('Failed to save map data');
    }
  } catch (error) {
    console.error('Error saving map to server:', error);
    throw error;
  }
};

/**
 * Get map data from the server by ID
 */
export const getMapFromServer = async (id: string): Promise<SavedMapData | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data: SavedMapData = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting map from server:', error);
    return null;
  }
}; 