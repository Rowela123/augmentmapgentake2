import React from 'react';
import ColorLegend from '../components/ColorLegend';
import { generateColorScale } from '../utils/colorUtils';

const TestPage: React.FC = () => {
  // Simple mock color scale for testing
  const colorScale = generateColorScale(['#f7fbff', '#08519c'], 0, 5000);
  
  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>Legend Test Page</h1>
      <p>This page tests the legend component in isolation.</p>
      
      <ColorLegend 
        colorScale={colorScale}
        width={960}
        minValue={630}
        maxValue={5245}
      />
      
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <h2>Legend Details:</h2>
        <ul>
          <li>Min Value: $630</li>
          <li>Max Value: $5,245</li>
          <li>Color Scheme: Blues</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage; 