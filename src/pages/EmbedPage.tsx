import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import USMap from '../components/USMap';
import { StateData } from '../types';
import { getSavedMaps, getMapById } from '../utils/storageUtils';
import { sideHustleData } from '../data/sampleData';

const EmbedContainer = styled.div`
  padding: 0;
  margin: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
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

  useEffect(() => {
    // Set CORS headers for embedding compatibility
    document.title = 'US Map Embed';
    
    try {
      // Get map ID and other parameters from URL
      const mapId = searchParams.get('id');
      const title = searchParams.get('title');
      
      // Set title if provided
      if (title) {
        const decodedTitle = decodeURIComponent(title);
        setMapTitle(decodedTitle);
        document.title = `US Map: ${decodedTitle}`;
      }
      
      // If map ID is provided, load that specific map
      if (mapId) {
        const map = getMapById(mapId);
        if (map) {
          setMapData(map.data);
          if (!title) {
            setMapTitle(map.title);
            document.title = `US Map: ${map.title}`;
          }
          setLoading(false);
        } else {
          console.error(`Map with ID ${mapId} not found`);
          // Fall back to sample data instead of showing an error
          setMapData(sideHustleData);
          if (!title) {
            setMapTitle('US Map Sample Data');
          }
          setLoading(false);
        }
      } else {
        // If no map ID, try to load the most recent map
        const savedMaps = getSavedMaps();
        if (savedMaps.length > 0) {
          // Sort by last modified date
          const sortedMaps = [...savedMaps].sort((a, b) => 
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
          );
          
          const mostRecentMap = sortedMaps[0];
          setMapData(mostRecentMap.data);
          
          // Only set title if not already set from URL
          if (!title) {
            setMapTitle(mostRecentMap.title);
            document.title = `US Map: ${mostRecentMap.title}`;
          }
          
          setLoading(false);
        } else {
          // Fall back to sample data if no saved maps
          console.log('No saved maps found, using sample data');
          setMapData(sideHustleData);
          if (!title) {
            setMapTitle('Most Popular Side Hustle in Every US State');
          }
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading map data:', err);
      // Always show a map, even if there's an error
      setMapData(sideHustleData);
      if (!mapTitle) {
        setMapTitle('US Map Data');
      }
      setLoading(false);
    }
    
    // Send height information to parent window (for iframe resizing)
    const sendHeightToParent = () => {
      try {
        if (window.parent !== window) {
          const height = document.body.scrollHeight;
          window.parent.postMessage({ type: 'resize', height }, '*');
          console.log('Sent height to parent:', height);
        }
      } catch (e) {
        console.error('Error sending height to parent:', e);
      }
    };
    
    // Create a ResizeObserver to detect content size changes
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        sendHeightToParent();
      });
      
      // Observe the body element
      resizeObserver.observe(document.body);
      
      return () => {
        resizeObserver.disconnect();
      };
    } else {
      // Fallback for browsers without ResizeObserver
      // Send height after the map is rendered
      const timer = setTimeout(sendHeightToParent, 1000);
      
      // Also adjust on window resize
      window.addEventListener('resize', sendHeightToParent);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', sendHeightToParent);
      };
    }
  }, [searchParams, mapTitle]);
  
  if (loading) {
    return (
      <LoadingContainer>
        <div>Loading map...</div>
      </LoadingContainer>
    );
  }
  
  if (error && !mapData.length) {
    return (
      <ErrorContainer>
        <div>Error: {error}</div>
        <div>Please try refreshing the page or contact support if the problem persists.</div>
      </ErrorContainer>
    );
  }
  
  return (
    <EmbedContainer>
      {mapData.length > 0 ? (
        <USMap 
          data={mapData} 
          title={mapTitle} 
          scaleTitle={scaleTitle}
          minLabel={minLabel}
          maxLabel={maxLabel}
          tooltipDescription={tooltipDescription}
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