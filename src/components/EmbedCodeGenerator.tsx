import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getMapById } from '../utils/storageUtils';

interface EmbedCodeGeneratorProps {
  title: string;
  mapId: string;
}

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Container = styled.div`
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.4s ease-out;
`;

const CodeBox = styled.textarea`
  width: 100%;
  height: 140px;
  padding: 15px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 15px 0;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
`;

const InstructionsBox = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px 25px;
  margin: 25px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${slideUp} 0.5s ease-out;
`;

const WarningBox = styled(InstructionsBox)`
  background-color: #fff8e1;
  border-color: #ffe082;
  border-left: 4px solid #ffc107;
`;

const OptionGroup = styled.div`
  margin: 20px 0;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: ${slideUp} 0.4s ease-out;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 20px;
    background: linear-gradient(to bottom, #4a90e2, #67b26f);
    border-radius: 2px;
  }
`;

const PageTitle = styled.h2`
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 180px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #34495e;
  font-size: 15px;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
  }
  
  &::placeholder {
    color: #bdc3c7;
  }
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #357ABD;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
  </svg>
);

const InstructionList = styled.ol`
  padding-left: 20px;
  
  li {
    margin-bottom: 10px;
    line-height: 1.5;
  }
`;

const Note = styled.p`
  font-style: italic;
  color: #7f8c8d;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

const NotificationMessage = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #2ecc71;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  animation: ${slideUp} 0.3s ease-out;
  
  &::before {
    content: '✓';
    font-weight: bold;
  }
`;

const EmbedCodeGenerator: React.FC<EmbedCodeGeneratorProps> = ({ title, mapId }) => {
  const [height, setHeight] = useState<number>(600);
  const [width, setWidth] = useState<number>(900);
  const [responsive, setResponsive] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string>('');
  
  // Scale customization
  const [scaleTitle, setScaleTitle] = useState<string>('');
  const [minLabel, setMinLabel] = useState<string>('Low');
  const [maxLabel, setMaxLabel] = useState<string>('High');

  // Check if we're running in development or production
  const isLocalhost = window.location.hostname === "localhost" || 
                      window.location.hostname === "127.0.0.1";
                      
  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Update embed code whenever relevant state changes
  useEffect(() => {
    const newEmbedCode = generateEmbedCode();
    setEmbedCode(newEmbedCode);
  }, [mapId, scaleTitle, minLabel, maxLabel]);

  const generateEmbedCode = () => {
    // Build the URL with all necessary parameters
    const params = new URLSearchParams();
    
    // Include the mapId
    if (mapId) {
      params.append('id', mapId);
      
      // Get the actual map data to include directly in the URL
      try {
        const mapData = getMapById(mapId);
        console.log('Retrieved map data:', mapData);
        if (mapData && mapData.data) {
          // Compress the data to keep the URL shorter
          const compressedData = btoa(JSON.stringify(mapData.data));
          params.append('data', compressedData);
          params.append('title', mapData.title || '');
          console.log('Added data parameter with length:', compressedData.length);
        } else {
          console.error('No map data found for mapId:', mapId);
        }
      } catch (error) {
        console.error("Error getting map data:", error);
      }
    } else {
      console.warn('No mapId provided to generateEmbedCode');
    }
    
    if (scaleTitle) params.append('scaleTitle', scaleTitle);
    if (minLabel) params.append('minLabel', minLabel);
    if (maxLabel) params.append('maxLabel', maxLabel);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const embedUrl = `https://map-generator-take2.vercel.app/embed${queryString}`;
    
    console.log("Generated embed code with mapId:", mapId);
    return `<iframe src="${embedUrl}" width="100%" style="min-height:500px" frameborder="0" allowfullscreen></iframe>`;
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setNotification('Embed code copied to clipboard!');
  };

  return (
    <Container>
      <PageTitle>Get Embed Code</PageTitle>
      
      {/* Debug information */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}>
        <p><strong>Debug Info:</strong></p>
        <p>Map ID: {mapId || 'None'}</p>
        <p>Using map data: {mapId ? 'Yes' : 'No'}</p>
        <p>Last update: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <OptionGroup>
        <SectionTitle>Map Settings</SectionTitle>
        <InputGroup>
          <FormGroup>
            <Label>Scale Title</Label>
            <Input
              type="text"
              value={scaleTitle}
              onChange={(e) => setScaleTitle(e.target.value)}
              placeholder="e.g., Average Monthly Earnings"
            />
          </FormGroup>
          <FormGroup>
            <Label>Min Label</Label>
            <Input
              type="text"
              value={minLabel}
              onChange={(e) => setMinLabel(e.target.value)}
              placeholder="e.g., Low"
            />
          </FormGroup>
          <FormGroup>
            <Label>Max Label</Label>
            <Input
              type="text"
              value={maxLabel}
              onChange={(e) => setMaxLabel(e.target.value)}
              placeholder="e.g., High"
            />
          </FormGroup>
        </InputGroup>
      </OptionGroup>
      
      <OptionGroup>
        <SectionTitle>Embed Code</SectionTitle>
        <CodeBox
          value={embedCode}
          readOnly
          onClick={() => {
            const textarea = document.querySelector('textarea');
            if (textarea) textarea.select();
          }}
        />
        <Button onClick={handleCopyCode}>
          <CopyIcon />
          Copy Code
        </Button>
      </OptionGroup>
      
      <InstructionsBox>
        <SectionTitle>How to Use This Code</SectionTitle>
        <InstructionList>
          <li>Copy the embed code above</li>
          <li>Paste it into your Shopify page or blog post</li>
          <li>The map will automatically adjust to fit the width of its container</li>
        </InstructionList>
        <Note>
          Note: The map will be responsive and adjust to the width of its container.
          The minimum height is set to 500px to ensure proper display.
        </Note>
      </InstructionsBox>
      
      {notification && (
        <NotificationMessage>
          {notification}
        </NotificationMessage>
      )}
    </Container>
  );
};

export default EmbedCodeGenerator; 