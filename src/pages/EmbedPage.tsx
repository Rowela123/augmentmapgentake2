import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import USMap from '../components/USMap';
import { StateData } from '../types';
import { getSavedMaps, getMapById } from '../utils/storageUtils';
import { sideHustleData } from '../data/sampleData';

// Add CORS and embedding headers
const setupEmbedHeaders = () => {
  // Add CSP headers for embedding
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = "Content-Security-Policy";
  cspMeta.content = "frame-ancestors *;";
  document.head.appendChild(cspMeta);
  
  // Add Access-Control headers
  const corsHeader = document.createElement('meta');
  corsHeader.httpEquiv = "Access-Control-Allow-Origin";
  corsHeader.content = "*";
  document.head.appendChild(corsHeader);
};

// Styled for a full-viewport container with absolute positioning
const EmbedContainer = styled.div`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background: white;
`;

// Simple loading indicator
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

// Clean error message
const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #d32f2f;
`;

// This is the embedded view component - it ONLY shows the map
const EmbedPage: React.FC = () => {
  const [mapData, setMapData] = useState<StateData[]>([]);
  const [mapTitle, setMapTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  
  // Get parameters from URL
  const minLabel = searchParams.get('minLabel') || 'Low';
  const maxLabel = searchParams.get('maxLabel') || 'High';
  const scaleTitle = searchParams.get('scaleTitle') || '';
  const tooltipDescription = searchParams.get('tooltipDescription') || 'Popular side hustles and their average monthly earnings in';
  const mapId = searchParams.get('id');

  useEffect(() => {
    // Setup headers for embedding
    setupEmbedHeaders();
    
    // Remove app styles that might interfere
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.title = 'US Map'; // Set a simple title
    
    // Hide any app headers or navigation that might be present
    const appHeader = document.querySelector('header');
    if (appHeader) (appHeader as HTMLElement).style.display = 'none';
    
    const tabs = document.querySelector('[class*="Tabs"]');
    if (tabs) (tabs as HTMLElement).style.display = 'none';
    
    console.log('EmbedPage: Received URL parameters:', {
      mapId,
      dataParam: searchParams.get('data') ? `[${searchParams.get('data')?.substring(0, 20)}...]` : 'None',
      titleParam: searchParams.get('title'),
      hashFragment: window.location.hash ? window.location.hash.substring(0, 20) + '...' : 'None',
      scaleTitle,
      minLabel,
      maxLabel
    });
    
    try {
      // Check for hash fragment first (short URL format)
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        const shortId = hash.substring(1); // Remove the # character
        console.log('Found short ID in hash:', shortId);
        
        try {
          // Try to get the data from sessionStorage
          const storedData = sessionStorage.getItem(`map_${shortId}`);
          if (storedData) {
            console.log('Found stored data for ID:', shortId);
            const decodedData = decodeURIComponent(escape(atob(storedData)));
            const parsedData = JSON.parse(decodedData);
            
            if (parsedData && parsedData.data && Array.isArray(parsedData.data)) {
              console.log('Successfully loaded data from sessionStorage');
              setMapData(parsedData.data);
              setMapTitle(parsedData.title || '');
              setLoading(false);
              return;
            }
          } else {
            console.log('No stored data found for ID:', shortId);
          }
        } catch (error) {
          console.error('Error retrieving data from sessionStorage:', error);
        }
      }
      
      // Then try to get data from URL parameters
      const dataParam = searchParams.get('data');
      const titleParam = searchParams.get('title');
      
      if (dataParam) {
        try {
          // Decode the base64-encoded data with Unicode support
          const base64Data = dataParam;
          const decodedData = decodeURIComponent(escape(atob(base64Data)));
          console.log('Decoded data from URL (first 100 chars):', decodedData.substring(0, 100));
          
          try {
            const parsedData = JSON.parse(decodedData);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`Successfully parsed data from URL: ${parsedData.length} states`);
              setMapData(parsedData);
              setMapTitle(titleParam || '');
              setLoading(false);
              return;
            } else {
              console.error("Parsed data is not an array or is empty");
            }
          } catch (parseError) {
            console.error("JSON parse error:", parseError);
          }
        } catch (error) {
          console.error("Error decoding data from URL:", error);
        }
      } 
      // If no data parameter but we have a mapId, try to get it from localStorage
      else if (mapId) {
        console.log('No data parameter, trying to load map with ID:', mapId);
        const mapData = getMapById(mapId);
        
        if (mapData && mapData.data && Array.isArray(mapData.data) && mapData.data.length > 0) {
          console.log(`Successfully loaded map from storage: ${mapData.data.length} states`);
          setMapData(mapData.data);
          setMapTitle(mapData.title || '');
          setLoading(false);
          return;
        } else {
          console.error("Could not load valid map data from storage for ID:", mapId);
        }
      }
      
      // Fallback to sample data if URL doesn't contain map data
      console.log('Falling back to sample data');
      setMapData(sideHustleData);
      setMapTitle('US States Data Visualization');
      setLoading(false);
    } catch (err) {
      console.error('Error loading map data:', err);
      setError('Failed to load map data');
      setLoading(false);
    }
  }, [searchParams]);

  // Render ONLY the map component with fullscreen styles
  return (
    <EmbedContainer>
      {loading ? (
        <LoadingContainer>Loading map...</LoadingContainer>
      ) : error ? (
        <ErrorContainer>{error}</ErrorContainer>
      ) : (
        <USMap 
          data={mapData}
          title="" // No title in the map itself
          scaleTitle={scaleTitle}
          minLabel={minLabel}
          maxLabel={maxLabel}
          tooltipDescription={tooltipDescription}
          embedded={true}
        />
      )}
    </EmbedContainer>
  );
};

export default EmbedPage; 