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
    console.log('EmbedPage mounted');
    document.title = 'US Map Embed';
    
    try {
      // Always use sample data for embedded view
      console.log('Setting sample data');
      setMapData(sideHustleData);
      setMapTitle('Most Popular Side Hustle in Every US State');
      setLoading(false);
      
      // Log the data being used
      console.log('Map data:', sideHustleData);
    } catch (err) {
      console.error('Error in EmbedPage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
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
      const timer = setTimeout(sendHeightToParent, 1000);
      window.addEventListener('resize', sendHeightToParent);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', sendHeightToParent);
      };
    }
  }, []);
  
  console.log('Rendering EmbedPage', { loading, error, mapData: mapData.length });
  
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