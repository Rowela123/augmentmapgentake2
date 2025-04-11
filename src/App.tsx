import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import USMap from './components/USMap';
// Import components directly for now
import DataUploader from './components/DataUploader';
import EmbedCodeGenerator from './components/EmbedCodeGenerator';
import SavedMaps from './components/SavedMaps';
import SaveMapModal from './components/SaveMapModal';
import { EmbedPage, TestPage } from './pages';
import { StateData, SavedMap } from './types';
import { sideHustleData } from './data/sampleData';
import {
  getSavedMaps,
  saveMap,
  deleteMap,
  createBlankMap,
  getMapById
} from './utils/storageUtils';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border: none;
  border-bottom: ${props => props.active ? '2px solid #4a90e2' : 'none'};
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  margin-right: 10px;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const Content = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

function MainApp() {
  const [activeTab, setActiveTab] = useState('map');
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [mapTitle, setMapTitle] = useState('US Map Generator');
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom scale settings
  const [scaleTitle, setScaleTitle] = useState('');
  const [minLabel, setMinLabel] = useState('Low');
  const [maxLabel, setMaxLabel] = useState('High');
  
  // Custom tooltip settings
  const [tooltipDescription, setTooltipDescription] = useState('Popular side hustles and their average monthly earnings in');

  const [selectedColorScheme, setSelectedColorScheme] = useState('default');

  // Load saved maps on component mount
  useEffect(() => {
    const maps = getSavedMaps();
    setSavedMaps(maps);
    
    // If we have saved maps, load the most recent one
    if (maps.length > 0) {
      // Sort maps by last modified date, most recent first
      const sortedMaps = [...maps].sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      
      const mostRecentMap = sortedMaps[0];
      setCurrentMapId(mostRecentMap.id);
      setMapTitle(mostRecentMap.title);
      setStateData(mostRecentMap.data);
    } else {
      // If no saved maps, use sample data
      setStateData(sideHustleData);
      setMapTitle('Most Popular Side Hustle in Every US State');
    }
  }, []);

  // Log the state data whenever it changes, for debugging
  useEffect(() => {
    console.log('Current state data in App:', stateData);
  }, [stateData]);

  const handleDataUpload = (data: StateData[]) => {
    console.log('Data received from uploader:', data);
    if (data && data.length > 0) {
      setStateData(data);
      // Automatically switch to map view to show the uploaded data
      setActiveTab('map');
    } else {
      console.error('Received empty data from uploader');
    }
  };
  
  const handleSelectMap = (mapId: string) => {
    const selectedMap = getMapById(mapId);
    if (selectedMap) {
      setCurrentMapId(selectedMap.id);
      setMapTitle(selectedMap.title);
      setStateData(selectedMap.data);
      // Switch to map view
      setActiveTab('map');
    }
  };
  
  const handleDeleteMap = (mapId: string) => {
    if (deleteMap(mapId)) {
      setSavedMaps(prev => prev.filter(map => map.id !== mapId));
      
      // If we deleted the current map, load another map or clear the data
      if (currentMapId === mapId) {
        const remainingMaps = savedMaps.filter(map => map.id !== mapId);
        
        if (remainingMaps.length > 0) {
          // Load the most recent remaining map
          const sortedMaps = [...remainingMaps].sort((a, b) => 
            new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
          );
          
          const nextMap = sortedMaps[0];
          setCurrentMapId(nextMap.id);
          setMapTitle(nextMap.title);
          setStateData(nextMap.data);
        } else {
          // No maps left, reset to sample data
          setCurrentMapId(null);
          setStateData(sideHustleData);
          setMapTitle('Most Popular Side Hustle in Every US State');
        }
      }
    }
  };
  
  const handleCreateNewMap = () => {
    // Reset to a blank slate
    setCurrentMapId(null);
    setStateData([]);
    setMapTitle('New Map');
    setActiveTab('data'); // Switch to data upload tab
  };
  
  const handleSaveCurrentMap = () => {
    setIsEditing(currentMapId !== null);
    setIsModalOpen(true);
  };
  
  const handleSaveMap = (name: string, description: string) => {
    const savedMapData = saveMap({
      id: currentMapId || undefined,
      name,
      title: mapTitle,
      data: stateData,
      description
    });
    
    setCurrentMapId(savedMapData.id);
    setSavedMaps(getSavedMaps());
  };

  return (
    <AppContainer>
      <Header>
        <Title>US Map Generator</Title>
        <Subtitle>Create, save, and share interactive maps with ease</Subtitle>
      </Header>

      <SavedMaps 
        maps={savedMaps}
        currentMapId={currentMapId}
        onSelectMap={handleSelectMap}
        onDeleteMap={handleDeleteMap}
        onSaveCurrentMap={handleSaveCurrentMap}
        onCreateNewMap={handleCreateNewMap}
      />

      <Tabs>
        <Tab 
          active={activeTab === 'map'} 
          onClick={() => setActiveTab('map')}
        >
          Map Preview {stateData.length > 0 && `(${stateData.length} states)`}
        </Tab>
        <Tab 
          active={activeTab === 'data'} 
          onClick={() => setActiveTab('data')}
        >
          Upload Data
        </Tab>
        <Tab 
          active={activeTab === 'embed'} 
          onClick={() => setActiveTab('embed')}
        >
          Get Embed Code
        </Tab>
      </Tabs>

      <Content>
        {activeTab === 'map' && (
          <>
            <input
              type="text"
              value={mapTitle}
              onChange={(e) => setMapTitle(e.target.value)}
              placeholder="Enter map title"
              style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
            />
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ fontSize: '14px', marginRight: '5px' }}>Color Scheme:</label>
                <select 
                  value={selectedColorScheme}
                  onChange={(e) => setSelectedColorScheme(e.target.value)}
                  style={{ padding: '5px', width: '120px' }}
                >
                  <option value="default">Default</option>
                  <option value="blues">Blues</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '14px', marginRight: '5px' }}>Min Label:</label>
                <input 
                  type="text" 
                  value={minLabel} 
                  onChange={(e) => setMinLabel(e.target.value)} 
                  style={{ padding: '5px', width: '80px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', marginRight: '5px' }}>Scale Title:</label>
                <input 
                  type="text" 
                  value={scaleTitle} 
                  onChange={(e) => setScaleTitle(e.target.value)} 
                  style={{ padding: '5px', width: '100px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', marginRight: '5px' }}>Max Label:</label>
                <input 
                  type="text" 
                  value={maxLabel} 
                  onChange={(e) => setMaxLabel(e.target.value)} 
                  style={{ padding: '5px', width: '80px' }}
                />
              </div>
            </div>
            
            <div style={{ width: '100%', maxWidth: '600px' }}>
              <label style={{ fontSize: '14px', marginRight: '5px', display: 'block', marginBottom: '5px' }}>
                Tooltip Description:
              </label>
              <input 
                type="text" 
                value={tooltipDescription} 
                onChange={(e) => setTooltipDescription(e.target.value)} 
                style={{ padding: '5px', width: '100%' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                State name will be automatically added after this text.
              </div>
            </div>
            {stateData.length > 0 ? (
              <>
                <USMap 
                  data={stateData} 
                  title={mapTitle} 
                  selectedColorScheme={selectedColorScheme as 'default' | 'blues'}
                  minLabel={minLabel}
                  maxLabel={maxLabel}
                  scaleTitle={scaleTitle}
                  tooltipDescription={tooltipDescription}
                />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                No data available. Please upload data first.
              </div>
            )}
          </>
        )}
        {activeTab === 'data' && (
          <DataUploader onDataUpload={handleDataUpload} />
        )}
        {activeTab === 'embed' && (
          <EmbedCodeGenerator
            title={mapTitle}
            mapId={currentMapId || ''}
            stateData={stateData}
          />
        )}
      </Content>
      
      <SaveMapModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMap}
        initialName={currentMapId ? savedMaps.find(m => m.id === currentMapId)?.name || '' : 'New Map'}
        initialDescription={currentMapId ? savedMaps.find(m => m.id === currentMapId)?.description || '' : ''}
        isEditing={isEditing}
      />
    </AppContainer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/embed" element={<EmbedPage />} />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 