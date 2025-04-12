import React from 'react';
import ColorLegend from '../components/ColorLegend';
import { generateColorScale, getColorScheme } from '../utils/colorUtils';

const TestPage: React.FC = () => {
  // Get color scheme and generate a scale
  const colors = getColorScheme('blues');
  const colorScale = generateColorScale(colors, 0, 5000);
  
  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1>Legend Test Page</h1>
      <p>This page tests the legend component in isolation.</p>
      
      <div style={{ marginTop: '30px' }}>
        <ColorLegend 
          colorScale={colorScale}
          width={600}
          minValue={630}
          maxValue={5245}
          title="Monthly Income ($)"
          minLabel="Min"
          maxLabel="Max"
        />
      </div>
      
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