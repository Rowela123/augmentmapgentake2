import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface SaveMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  initialName?: string;
  initialDescription?: string;
  isEditing?: boolean;
}

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out forwards;
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 35px;
  border-radius: 12px;
  width: 550px;
  max-width: 95%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  animation: ${slideIn} 0.3s ease-out forwards;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: linear-gradient(to right, #4a90e2, #67b26f);
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    color: #e74c3c;
    background-color: #f9f9f9;
    transform: rotate(90deg);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #34495e;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .required {
    color: #e74c3c;
    font-size: 18px;
    line-height: 1;
  }
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
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

const TextArea = styled.textarea`
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f1f2f6;
  color: #2c3e50;
  
  &:hover:not(:disabled) {
    background-color: #e0e0e0;
  }
`;

const SaveButton = styled(Button)`
  background-color: #4a90e2;
  color: white;
  padding-left: 25px;
  padding-right: 25px;
  
  &:hover:not(:disabled) {
    background-color: #3a7abd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.2);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '⚠️';
    font-size: 16px;
  }
`;

const CharCount = styled.div<{ isNearLimit: boolean }>`
  font-size: 12px;
  text-align: right;
  margin-top: 5px;
  color: ${props => props.isNearLimit ? '#e67e22' : '#95a5a6'};
`;

const SaveMapModal: React.FC<SaveMapModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  initialDescription = '',
  isEditing = false
}) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [errorMessage, setErrorMessage] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_NAME_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 500;
  
  // Update form when initialValues change
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setErrorMessage('');
      
      // Focus the name input when modal opens after a small delay
      // to ensure the animation doesn't interfere
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialName, initialDescription]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMessage('Please enter a name for your map');
      return;
    }
    
    if (name.length > MAX_NAME_LENGTH) {
      setErrorMessage(`Map name must be ${MAX_NAME_LENGTH} characters or less`);
      return;
    }
    
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      setErrorMessage(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`);
      return;
    }
    
    onSave(name.trim(), description.trim());
    onClose();
  };
  
  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Map' : 'Save Map'}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            &times;
          </CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="map-name">
              Map Name <span className="required">*</span>
            </Label>
            <Input
              id="map-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (errorMessage && e.target.value.trim()) {
                  setErrorMessage('');
                }
              }}
              placeholder="Enter a descriptive name for your map"
              maxLength={MAX_NAME_LENGTH}
            />
            <CharCount isNearLimit={name.length > MAX_NAME_LENGTH * 0.8}>
              {name.length}/{MAX_NAME_LENGTH}
            </CharCount>
            {errorMessage && (
              <ErrorMessage>{errorMessage}</ErrorMessage>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="map-description">Description (Optional)</Label>
            <TextArea
              id="map-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details about what this map represents"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            <CharCount isNearLimit={description.length > MAX_DESCRIPTION_LENGTH * 0.8}>
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </CharCount>
          </FormGroup>
          
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton 
              type="submit"
              disabled={!name.trim()}
            >
              {isEditing ? 'Update' : 'Save'}
            </SaveButton>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SaveMapModal; 