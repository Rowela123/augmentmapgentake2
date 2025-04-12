import React from 'react';
import styled from 'styled-components';

interface ColorLegendProps {
  colorScale: (value: number) => string;
  width: number;
  minValue: number;
  maxValue: number;
  title?: string;
  minLabel?: string;
  maxLabel?: string;
}

const LegendContainer = styled.div`
  margin-top: 10px;
  font-family: Arial, sans-serif;
`;

const LegendTitle = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  text-align: center;
`;

const GradientBar = styled.div<{ width: number }>`
  height: 10px;
  width: ${props => props.width}px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
`;

const LabelsContainer = styled.div<{ width: number }>`
  display: flex;
  justify-content: space-between;
  width: ${props => props.width}px;
  margin-top: 5px;
  font-size: 12px;
  color: #666;
`;

/**
 * A simple color scale bar that shows the gradient from min to max values
 */
const ColorLegend: React.FC<ColorLegendProps> = ({
  colorScale,
  width,
  minValue,
  maxValue,
  title,
  minLabel = 'Low',
  maxLabel = 'High'
}) => {
  // Create color segments for the gradient
  const segments = 20;
  const step = (maxValue - minValue) / segments;
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <LegendContainer>
      {title && <LegendTitle>{title}</LegendTitle>}
      
      <GradientBar width={width}>
        {Array.from({ length: segments }).map((_, i) => {
          const value = minValue + (step * i);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(i / segments) * 100}%`,
                width: `${100 / segments}%`,
                height: '100%',
                backgroundColor: colorScale(value)
              }}
            />
          );
        })}
      </GradientBar>
      
      <LabelsContainer width={width}>
        <span>{minLabel}{minValue ? ` ($${formatNumber(minValue)})` : ''}</span>
        <span>{maxLabel}{maxValue ? ` ($${formatNumber(maxValue)})` : ''}</span>
      </LabelsContainer>
    </LegendContainer>
  );
};

export default ColorLegend; 