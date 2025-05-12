import React from 'react';
import styled from 'styled-components';

interface ColorLegendProps {
  colorScale: string[];
  minValue: number;
  maxValue: number;
  title?: string;
  minLabel?: string;
  maxLabel?: string;
  width?: number;
  height?: number;
  customColors?: Record<string, string>; // Add support for custom colors
  colorScheme?: string; // Add support for color scheme
}

const LegendContainer = styled.div`
  margin-top: 20px;
  padding: 10px;
`;

const LegendTitle = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
  text-align: center;
  color: #333;
`;

const GradientBar = styled.div<{ width: number, height: number }>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  margin: 0 auto;
  position: relative;
  background: linear-gradient(to right, ${props => props.color});
  border-radius: 4px;
`;

const LabelsContainer = styled.div<{ width: number }>`
  display: flex;
  justify-content: space-between;
  width: ${props => props.width}px;
  margin: 5px auto 0;
`;

const Label = styled.div`
  font-size: 12px;
  color: #666;
`;

const ColorLegend: React.FC<ColorLegendProps> = ({
  colorScale,
  minValue,
  maxValue,
  title,
  minLabel = 'Low',
  maxLabel = 'High',
  width = 200,
  height = 15,
  customColors = {},
  colorScheme = 'default'
}) => {
  // Check if we're using multi-color scheme AND have custom colors
  const useCustomColors = colorScheme === 'multi' && Object.keys(customColors).length > 0;

  // Convert colorScale array to a CSS gradient string
  let gradientColors;

  if (useCustomColors) {
    // Extract all unique colors from the customColors object
    const uniqueColors = [...new Set(Object.values(customColors))];

    // Create gradient stops using these unique custom colors
    gradientColors = uniqueColors.map((color, index) => {
      const percentage = (index / (uniqueColors.length - 1 || 1)) * 100;
      return `${color} ${percentage}%`;
    }).join(', ');
  } else {
    // Use the standard color scale for the gradient
    gradientColors = colorScale.map((color, index) => {
      const percentage = (index / (colorScale.length - 1)) * 100;
      return `${color} ${percentage}%`;
    }).join(', ');
  }

  // Format values for display
  const formatValue = (value: number): string => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toLocaleString();
  };

  return (
    <LegendContainer>
      {title && <LegendTitle>{title}</LegendTitle>}
      <GradientBar
        width={width}
        height={height}
        color={gradientColors}
      />
      <LabelsContainer width={width}>
        <Label>{minLabel || formatValue(minValue)}</Label>
        <Label>{maxLabel || formatValue(maxValue)}</Label>
      </LabelsContainer>
    </LegendContainer>
  );
};

export default ColorLegend;