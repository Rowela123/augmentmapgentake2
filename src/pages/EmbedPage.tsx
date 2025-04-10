import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import USMap from '../components/USMap';
import { StateData } from '../types';
import { getSavedMaps, getMapById } from '../utils/storageUtils';
import { sideHustleData } from '../data/sampleData';

// Add CORS and frame-ancestors headers for embedding
const setupEmbedHeaders = () => {
  // Add CSP headers to allow embedding from any domain
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = "Content-Security-Policy";
  cspMeta.content = "frame-ancestors *; default-src 'self' https://* 'unsafe-inline' 'unsafe-eval' data:; connect-src *;";
  document.head.appendChild(cspMeta);
  
  // Add Access-Control headers
  const corsHeader = document.createElement('meta');
  corsHeader.httpEquiv = "Access-Control-Allow-Origin";
  corsHeader.content = "*";
  document.head.appendChild(corsHeader);
  
  // Add X-Frame-Options header to allow embedding in iframes
  const frameHeader = document.createElement('meta');
  frameHeader.httpEquiv = "X-Frame-Options";
  frameHeader.content = "ALLOWALL";
  document.head.appendChild(frameHeader);

  // Add Shopify specific headers
  const shopifyHeader = document.createElement('meta');
  shopifyHeader.name = "shopify-feature";
  shopifyHeader.content = "iframe-resizer";
  document.head.appendChild(shopifyHeader);
  
  console.log('Embed headers added for Shopify compatibility');
};

const EmbedContainer = styled.div`
  padding: 0;
  margin: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: white;
  min-height: 500px;
  border: none;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
  background-color: #f9f9f9;
`;

const ErrorContainer = styled.div`
  padding: 20px;
  background-color: #fff3f3;
  border: 1px solid #ffcbcb;
  border-radius: 4px;
  color: #d32f2f;
  margin: 10px 0;
  text-align: center;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 4px;
  color: #666;
`;

const EmbedPage: React.FC = () => {
  const [mapData, setMapData] = useState<StateData[]>([]);
  const [mapTitle, setMapTitle] = useState<string>('Embedded Map');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  
  // Scale customization options - can be passed as URL parameters
  const minLabel = searchParams.get('minLabel') || 'Low';
  const maxLabel = searchParams.get('maxLabel') || 'High';
  const scaleTitle = searchParams.get('scaleTitle') || '';
  const tooltipDescription = searchParams.get('tooltipDescription') || 'Popular side hustles and their average monthly earnings in';
  
  // Get map ID from URL parameters
  const mapId = searchParams.get('id');

  useEffect(() => {
    // Setup headers for embedding
    setupEmbedHeaders();
    
    console.log('EmbedPage mounted, params:', {
      mapId,
      minLabel,
      maxLabel,
      scaleTitle,
      tooltipDescription
    });
    
    try {
      // If a specific map ID is provided, try to load that map
      if (mapId) {
        console.log('Attempting to load map with ID:', mapId);
        const savedMap = getMapById(mapId);
        
        if (savedMap && savedMap.data) {
          console.log('Found saved map:', savedMap.title);
          setMapData(savedMap.data);
          setMapTitle(savedMap.title);
          setLoading(false);
          return;
        } else {
          console.warn('Map ID provided but map not found, falling back to sample data');
        }
      }
      
      // Fallback to sample data if no map ID or map not found
      console.log('Using sample data');
      if (!sideHustleData || !Array.isArray(sideHustleData)) {
        throw new Error('Sample data is not available or invalid');
      }

      // Log the structure of sample data
      console.log('Sample data structure:', {
        length: sideHustleData.length,
        firstItem: sideHustleData[0],
        keys: Object.keys(sideHustleData[0] || {})
      });

      setMapData(sideHustleData);
      setMapTitle('Most Popular Side Hustle in Every US State');
      setLoading(false);
    } catch (err) {
      console.error('Error in EmbedPage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [mapId, minLabel, maxLabel, scaleTitle, tooltipDescription]);

  return (
    <EmbedContainer>
      {/* Remove debug information panel */}
      {loading ? (
        <LoadingContainer>
          <div>Loading map...</div>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <div>Error: {error}</div>
          <div>Please try refreshing the page or contact support if the problem persists.</div>
        </ErrorContainer>
      ) : mapData.length > 0 ? (
        <USMap 
          data={mapData} 
          title={mapTitle} 
          scaleTitle={scaleTitle}
          minLabel={minLabel}
          maxLabel={maxLabel}
          tooltipDescription={tooltipDescription}
          embedded={true}
        />
      ) : (
        <EmptyMessage>
          No map data available.
        </EmptyMessage>
      )}
    </EmbedContainer>
  );
};

export default EmbedPage; 