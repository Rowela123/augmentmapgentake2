import React from 'react';

interface ColorLegendProps {
  colorScale: (value: number) => string;
  width: number;
  minValue: number;
  maxValue: number;
}

/**
 * A simple color scale bar that shows the gradient from min to max values
 */
const ColorLegend: React.FC<ColorLegendProps> = ({ 
  colorScale, 
  width, 
  minValue, 
  maxValue 
}) => {
  // Normalize values if they're invalid
  const validMin = isFinite(minValue) ? minValue : 0;
  const validMax = isFinite(maxValue) ? maxValue : 1000;
  
  // Create a safe color scale function
  const safeColorScale = (value: number) => {
    try {
      return colorScale(value) || '#cccccc';
    } catch (e) {
      console.error('Error with color scale:', e);
      return '#cccccc';
    }
  };
  
  // Generate gradient stops for the color scale
  const generateStops = () => {
    const stops = [];
    for (let i = 0; i <= 10; i++) {
      const value = validMin + (i / 10) * (validMax - validMin);
      const color = safeColorScale(value);
      stops.push(
        <stop 
          key={i} 
          offset={`${i * 10}%`} 
          stopColor={color} 
        />
      );
    }
    return stops;
  };

  // Calculate legend dimensions
  const legendHeight = 50;
  const barHeight = 15;
  const legendWidth = Math.min(width, 400);
  
  return (
    <div style={{
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <svg width={legendWidth} height={legendHeight}>
        <defs>
          <linearGradient id="simple-legend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {generateStops()}
          </linearGradient>
        </defs>
        
        {/* Gradient bar */}
        <rect 
          x={0} 
          y={0} 
          width={legendWidth} 
          height={barHeight} 
          fill={`url(#simple-legend-gradient)`}
          stroke="#666"
          strokeWidth={1}
        />
        
        {/* Min value label */}
        <text 
          x={0} 
          y={barHeight + 15} 
          fontSize={12} 
          textAnchor="start"
          fill="#333"
        >
          ${validMin.toLocaleString()}
        </text>
        
        {/* Max value label */}
        <text 
          x={legendWidth} 
          y={barHeight + 15} 
          fontSize={12} 
          textAnchor="end"
          fill="#333"
        >
          ${validMax.toLocaleString()}
        </text>
      </svg>
    </div>
  );
};

export default ColorLegend; 