import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import USMap from '../components/USMap';
import { StateData } from '../types';
import { getMapFromServer } from '../utils/apiUtils';
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

// This page handles embed links with direct IDs
const ServerEmbedPage: React.FC = () => {
  const [mapData, setMapData] = useState<StateData[]>([]);
  const [mapTitle, setMapTitle] = useState<string>('');
  const [scaleTitle, setScaleTitle] = useState<string>('');
  const [minLabel, setMinLabel] = useState<string>('Low');
  const [maxLabel, setMaxLabel] = useState<string>('High');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get ID from URL params
  const { id } = useParams<{ id: string }>();
  
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
    
    const loadMapData = async () => {
      try {
        if (id) {
          // Try to get the map data from the server (localStorage)
          console.log('Loading map with ID:', id);
          const mapData = await getMapFromServer(id);
          
          if (mapData && mapData.data) {
            setMapData(mapData.data);
            setMapTitle(mapData.title || '');
            setScaleTitle(mapData.scale || '');
            setMinLabel(mapData.min || 'Low');
            setMaxLabel(mapData.max || 'High');
            setLoading(false);
            return;
          }
        }
        
        // Fallback to sample data if no map data found
        console.log('No map data found, using sample data');
        setMapData(sideHustleData);
        setMapTitle('US States Data Visualization');
        setLoading(false);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map data');
        setLoading(false);
      }
    };
    
    loadMapData();
  }, [id]);

  // If no ID is provided, redirect to the main embed page
  if (!id) {
    return <Navigate to="/embed" replace />;
  }

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
          tooltipDescription={`Data for`}
          embedded={true}
        />
      )}
    </EmbedContainer>
  );
};

export default ServerEmbedPage; 