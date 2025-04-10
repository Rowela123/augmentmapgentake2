import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SavedMap } from '../types';

interface SavedMapsProps {
  maps: SavedMap[];
  currentMapId: string | null;
  onSelectMap: (mapId: string) => void;
  onDeleteMap: (mapId: string) => void;
  onSaveCurrentMap: () => void;
  onCreateNewMap: () => void;
}

const SavedMapsContainer = styled.div`
  margin-bottom: 20px;
`;

const MapList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;
`;

const MapItem = styled.div<{ isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: ${props => props.isActive ? '#e3f2fd' : '#f5f5f5'};
  border-radius: 4px;
  border-left: 4px solid ${props => props.isActive ? '#2196f3' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isActive ? '#bbdefb' : '#e0e0e0'};
  }
`;

const MapInfo = styled.div`
  flex: 1;
`;

const MapName = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
`;

const MapDate = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
`;

const MapActions = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #357ABD;
  }
`;

const DeleteButton = styled.button`
  background-color: transparent;
  color: #f44336;
  border: 1px solid #f44336;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background-color: #ffebee;
  }
`;

const NoMapsMessage = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  color: #666;
`;

const SavedMaps: React.FC<SavedMapsProps> = ({ 
  maps, 
  currentMapId, 
  onSelectMap, 
  onDeleteMap, 
  onSaveCurrentMap,
  onCreateNewMap 
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const handleDeleteClick = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation(); // Prevent selection of the map when clicking delete
    
    // If already confirming for this map, then actually delete it
    if (confirmDelete === mapId) {
      onDeleteMap(mapId);
      setConfirmDelete(null);
    } else {
      // Otherwise, enter confirm state
      setConfirmDelete(mapId);
      
      // Auto-reset after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <SavedMapsContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>Saved Maps</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button onClick={onSaveCurrentMap}>
            {currentMapId ? 'Save Current Map' : 'Save Map'}
          </Button>
          <Button onClick={onCreateNewMap}>
            Create New Map
          </Button>
        </div>
      </div>
      
      {maps.length > 0 ? (
        <MapList>
          {maps.map(map => (
            <MapItem 
              key={map.id} 
              isActive={map.id === currentMapId}
              onClick={() => onSelectMap(map.id)}
            >
              <MapInfo>
                <MapName>{map.name}</MapName>
                <MapDate>
                  Last modified: {formatDate(map.lastModified)}
                </MapDate>
              </MapInfo>
              <MapActions>
                <DeleteButton 
                  onClick={(e) => handleDeleteClick(e, map.id)}
                >
                  {confirmDelete === map.id ? 'Confirm' : 'Delete'}
                </DeleteButton>
              </MapActions>
            </MapItem>
          ))}
        </MapList>
      ) : (
        <NoMapsMessage>
          No saved maps yet. Create your first map and save it!
        </NoMapsMessage>
      )}
    </SavedMapsContainer>
  );
};

export default SavedMaps; 