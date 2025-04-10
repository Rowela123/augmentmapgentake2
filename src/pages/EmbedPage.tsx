import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import USMap from '../components/USMap';
import { StateData } from '../types';
import { getSavedMaps, getMapById } from '../utils/storageUtils';
import { sideHustleData } from '../data/sampleData';

// Add debug headers
const addDebugHeaders = () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = "frame-ancestors *;";
  document.head.appendChild(meta);
};

const EmbedContainer = styled.div`
  padding: 0;
  margin: 0;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: white;
  min-height: 500px;
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
    // Add CSP headers
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "frame-ancestors *;";
    document.head.appendChild(meta);
    
    console.log('EmbedPage mounted');
    console.log('Window location:', window.location.href);
    console.log('Sample data available:', !!sideHustleData);
    
    try {
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
  }, []);

  // Add a debug div that will be visible in the iframe
  const debugInfo = {
    loading,
    error,
    dataLength: mapData.length,
    windowLocation: window.location.href,
    hasData: !!sideHustleData,
    parentWindow: window.parent !== window,
    referrer: document.referrer
  };

  return (
    <EmbedContainer>
      {/* Debug information */}
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        background: 'white', 
        padding: '10px', 
        border: '1px solid black',
        zIndex: 9999,
        fontSize: '12px'
      }}>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

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
        />
      ) : (
        <EmptyMessage>
          No map data available. Debug info above.
        </EmptyMessage>
      )}
    </EmbedContainer>
  );
};

export default EmbedPage; 