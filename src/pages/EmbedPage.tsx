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
    
    try {
      // Try to get data from URL parameters first
      const dataParam = searchParams.get('data');
      const titleParam = searchParams.get('title');
      
      if (dataParam) {
        try {
          // Decode the base64-encoded data
          const jsonData = atob(dataParam);
          const parsedData = JSON.parse(jsonData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setMapData(parsedData);
            setMapTitle(titleParam || '');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing data from URL:", error);
        }
      }
      
      // Fallback to sample data if URL doesn't contain map data
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