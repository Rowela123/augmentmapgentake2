import { SavedMap, StateData } from '../types';

const STORAGE_KEY = 'us_map_generator_saved_maps';

// Generate a unique ID for new maps
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Get all saved maps from localStorage
export const getSavedMaps = (): SavedMap[] => {
  try {
    const savedMapsJSON = localStorage.getItem(STORAGE_KEY);
    if (!savedMapsJSON) return [];
    
    const savedMaps = JSON.parse(savedMapsJSON);
    return Array.isArray(savedMaps) ? savedMaps : [];
  } catch (error) {
    console.error('Error loading saved maps:', error);
    return [];
  }
};

// Save maps to localStorage
export const saveMapsToStorage = (maps: SavedMap[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  } catch (error) {
    console.error('Error saving maps:', error);
  }
};

// Get a specific map by ID
export const getMapById = (mapId: string): SavedMap | null => {
  const maps = getSavedMaps();
  return maps.find(map => map.id === mapId) || null;
};

// Save a new map or update an existing one
export const saveMap = (
  mapData: {
    id?: string;
    name: string;
    title: string;
    data: StateData[];
    description?: string;
  }
): SavedMap => {
  const maps = getSavedMaps();
  const now = new Date().toISOString();
  
  // Check if we're updating an existing map
  if (mapData.id) {
    const existingMapIndex = maps.findIndex(map => map.id === mapData.id);
    
    if (existingMapIndex >= 0) {
      // Update existing map
      const updatedMap: SavedMap = {
        ...maps[existingMapIndex],
        name: mapData.name,
        title: mapData.title,
        data: mapData.data,
        lastModified: now,
        description: mapData.description || maps[existingMapIndex].description
      };
      
      maps[existingMapIndex] = updatedMap;
      saveMapsToStorage(maps);
      return updatedMap;
    }
  }
  
  // Create a new map
  const newMap: SavedMap = {
    id: mapData.id || generateId(),
    name: mapData.name,
    title: mapData.title,
    data: mapData.data,
    createdAt: now,
    lastModified: now,
    description: mapData.description || ''
  };
  
  maps.push(newMap);
  saveMapsToStorage(maps);
  return newMap;
};

// Delete a map by ID
export const deleteMap = (mapId: string): boolean => {
  const maps = getSavedMaps();
  const filteredMaps = maps.filter(map => map.id !== mapId);
  
  if (filteredMaps.length < maps.length) {
    saveMapsToStorage(filteredMaps);
    return true;
  }
  
  return false;
};

// Create a default blank map
export const createBlankMap = (): SavedMap => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'New Map',
    title: 'Untitled Map',
    data: [],
    createdAt: now,
    lastModified: now,
    description: ''
  };
}; 