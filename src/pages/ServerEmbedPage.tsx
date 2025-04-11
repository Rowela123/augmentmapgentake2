import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  flex-direction: column;
  gap: 20px;
  color: #333;
  font-family: Arial, sans-serif;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Clean error message
const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #d32f2f;
`;

// This is the embedded view component using the server-stored data approach similar to Columns.ai
const ServerEmbedPage: React.FC = () => {
  const [mapData, setMapData] = useState<StateData[]>([]);
  const [mapTitle, setMapTitle] = useState<string>('');
  const [scaleTitle, setScaleTitle] = useState<string>('');
  const [minLabel, setMinLabel] = useState<string>('Low');
  const [maxLabel, setMaxLabel] = useState<string>('High');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the map ID from the URL
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
    
    const loadData = async () => {
      if (!id) {
        setError('No map ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch the map data from the server
        console.log('Fetching map data from server for ID:', id);
        const mapData = await getMapFromServer(id);
        
        if (mapData && mapData.data && mapData.data.length > 0) {
          console.log('Successfully loaded map data from server');
          setMapData(mapData.data);
          setMapTitle(mapData.title || '');
          setScaleTitle(mapData.scaleTitle || '');
          setMinLabel(mapData.minLabel || 'Low');
          setMaxLabel(mapData.maxLabel || 'High');
          setLoading(false);
        } else {
          console.error('No valid map data found for ID:', id);
          setError('Map not found or invalid data');
          
          // Fallback to sample data
          console.log('Falling back to sample data');
          setMapData(sideHustleData);
          setMapTitle('US States Data Visualization');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading map data from server:', err);
        setError('Failed to load map data');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  // Render ONLY the map component with fullscreen styles
  return (
    <EmbedContainer>
      {loading ? (
        <LoadingContainer>
          <Spinner />
          <div>Loading map...</div>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>{error}</ErrorContainer>
      ) : (
        <USMap 
          data={mapData}
          title="" // No title in the map itself
          scaleTitle={scaleTitle}
          minLabel={minLabel}
          maxLabel={maxLabel}
          tooltipDescription="Value" // Generic description
          embedded={true}
        />
      )}
    </EmbedContainer>
  );
};

export default ServerEmbedPage; 