import React, { useState, useRef, ChangeEvent, CSSProperties, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { StateData } from '../types';
import { stateNameToCode } from '../utils/stateUtils';
import styled, { keyframes, css } from 'styled-components';

interface DataUploaderProps {
  onDataUpload: (data: StateData[]) => void;
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

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.5); }
  70% { box-shadow: 0 0 0 10px rgba(74, 144, 226, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 144, 226, 0); }
`;

const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
  animation: ${fadeIn} 0.4s ease-out;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
`;

interface UploadSectionProps {
  isDragging: boolean;
}

const UploadSection = styled.div<UploadSectionProps>`
  border: 2px dashed ${props => props.isDragging ? '#4a90e2' : '#ccc'};
  padding: 40px;
  text-align: center;
  border-radius: 12px;
  background-color: ${props => props.isDragging ? '#f0f8ff' : '#f9f9f9'};
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  &:hover {
    border-color: #4a90e2;
    background-color: #f0f8ff;
  }
  
  ${props => props.isDragging && css`
    animation: ${pulseAnimation} 1.5s infinite;
  `}
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  }
`;

const SampleSection = styled.div`
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 25px;
  animation: ${slideUp} 0.5s ease-out;
`;

const MessageBase = styled.div`
  margin-top: 15px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  line-height: 1.5;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
`;

const ErrorMessage = styled(MessageBase)`
  color: #c62828;
  background-color: #ffebee;
  border-left: 4px solid #ef5350;
`;

const SuccessMessage = styled(MessageBase)`
  color: #2e7d32;
  background-color: #e8f5e9;
  border-left: 4px solid #66bb6a;
`;

const IconContainer = styled.div`
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MessageContent = styled.div`
  flex: 1;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  th, td {
    padding: 12px 15px;
    text-align: left;
  }
  
  th {
    background-color: #f2f7fd;
    color: #2c3e50;
    font-weight: 600;
    border-bottom: 2px solid #e3e8f0;
  }
  
  td {
    border-bottom: 1px solid #eaeef2;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  tr:hover {
    background-color: #f0f7ff;
  }
`;

const PreviewContainer = styled.div`
  animation: ${slideUp} 0.4s ease-out;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 15h2V9h3l-4-5-4 5h3v6z" fill="currentColor"/>
    <path d="M20 18H4v-7H2v7c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-7h-2v7z" fill="currentColor"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
  </svg>
);

const DataCount = styled.div`
  background-color: #f2f7fd;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #4a90e2;
  display: inline-flex;
  align-items: center;
  margin-top: 10px;
  font-weight: 500;
  
  &::before {
    content: '📊';
    margin-right: 6px;
  }
`;

const UploadInstructions = styled.div`
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
  
  p {
    margin-bottom: 20px;
    color: #5d6d7e;
  }
  
  h4 {
    margin: 0 0 10px;
    color: #2c3e50;
  }
`;

const DataUploader: React.FC<DataUploaderProps> = ({ onDataUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<StateData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleFile = (file: File) => {
    setError(null);
    setSuccess(null);
    
    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      readExcelFile(file);
    } else if (fileExt === 'csv') {
      readCSVFile(file);
    } else {
      setError('Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    handleFile(file);
  };
  
  const readExcelFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        
        // Read the workbook with formatting options enabled
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellStyles: true,
          cellDates: true,
        });
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Get worksheet range
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        
        // Get headers (first row)
        const headers: Record<number, string> = {};
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cell = worksheet[XLSX.utils.encode_cell({r: range.s.r, c: C})];
          if (cell && cell.v) {
            headers[C] = String(cell.v).toLowerCase();
          }
        }
        
        console.log('Excel headers:', headers);
        
        // Get data as JSON
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        
        // Log the cell styling options we detect
        console.log('Sample cell styling from Excel:', worksheet['A2']?.s); 
        
        // Process each row to add formatting info
        const processedData = rawData.map((row: any, idx: number) => {
          // Row in Excel is header + 1 + index
          const rowIdx = range.s.r + 1 + idx;
          const formattedRow = { ...row };
          
          // Create formatting container
          formattedRow._formatting = {};
          
          // Check each column for formatting
          Object.entries(headers).forEach(([colIdxStr, fieldName]) => {
            const colIdx = parseInt(colIdxStr);
            const cellRef = XLSX.utils.encode_cell({r: rowIdx, c: colIdx});
            
            if (worksheet[cellRef] && worksheet[cellRef].s && 
                worksheet[cellRef].s.font && worksheet[cellRef].s.font.bold) {
              // This cell has bold formatting
              formattedRow._formatting[fieldName] = { bold: true };
              
              // Enhanced logging for formatting detection
              console.log(`Detected bold formatting at row ${rowIdx+1}, column ${colIdx+1} (${fieldName}):`, {
                cellRef,
                style: worksheet[cellRef].s,
                fieldValue: worksheet[cellRef].v
              });
            }
          });
          
          return formattedRow;
        });
        
        console.log('Processed Excel data with formatting:', processedData);
        processData(processedData);
      } catch (err) {
        console.error('Excel processing error:', err);
        setError('Error processing Excel file. Please check the format.');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  const readCSVFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          setError(`CSV parse error: ${results.errors[0].message}`);
          return;
        }
        
        processData(results.data as any[]);
      },
      error: (error) => {
        setError(`CSV parse error: ${error.message}`);
      }
    });
  };
  
  const processData = (rawData: any[]) => {
    try {
      if (!rawData.length) {
        setError('No data found in the file.');
        return;
      }
      
      console.log('Raw data from file:', rawData);
      
      // Check required fields
      const firstRow = rawData[0];
      if (!('state' in firstRow || 'State' in firstRow || 'STATE' in firstRow || 'stateName' in firstRow || 'StateName' in firstRow)) {
        setError('State name column not found. Please include a column named "state", "State", or "stateName".');
        return;
      }
      
      // Log if we detect any formatting information in the raw data
      const hasFormatting = rawData.some(row => row._formatting || Object.keys(row).some(key => key.endsWith('_formatting')));
      console.log('Detected formatting information in uploaded file:', hasFormatting);
      
      const processedData: StateData[] = rawData.map((row, index) => {
        // Find the state name column (using various possible naming conventions)
        const stateName = row.state || row.State || row.STATE || row.stateName || row.StateName;
        let stateCode = row.stateCode || row.StateCode || row.stateAbbr || row.code || '';
        
        // If we don't have a code but have a name, try to convert
        if (!stateCode && stateName) {
          stateCode = stateNameToCode(stateName);
          if (!stateCode) {
            console.warn(`Could not find state code for: "${stateName}"`);
          }
        }
        
        // Get value and ensure it's proper type if possible
        let value = row.value || row.Value || row.amount || row.Amount || null;
        if (value !== null && !isNaN(Number(value))) {
          value = Number(value);
        }
        
        // Get label and info
        let label = row.label || row.Label || row.description || row.Description || '';
        let info = row.info || row.Info || row.details || row.Details || '';
        
        // Check for formatting info
        const formatting: Record<string, any> = {};
        
        // If the row has _formatting property (from Excel), use it directly
        if (row._formatting) {
          console.log(`Row ${index} (_formatting found):`, row._formatting);
          
          // Map Excel field names to our standardized field names
          const valueField = row.value !== undefined ? 'value' : 
                            row.Value !== undefined ? 'Value' : 
                            row.amount !== undefined ? 'amount' : 
                            row.Amount !== undefined ? 'Amount' : '';
                            
          const labelField = row.label !== undefined ? 'label' : 
                            row.Label !== undefined ? 'Label' : 
                            row.description !== undefined ? 'description' : 
                            row.Description !== undefined ? 'Description' : '';
                            
          const infoField = row.info !== undefined ? 'info' : 
                           row.Info !== undefined ? 'Info' : 
                           row.details !== undefined ? 'details' : 
                           row.Details !== undefined ? 'Details' : '';
          
          // Check if any of our fields have bold formatting
          if (valueField && row._formatting[valueField.toLowerCase()]?.bold) {
            formatting.value = { bold: true };
            console.log(`Bold formatting detected for value field '${valueField}'`);
          }
          
          if (labelField && row._formatting[labelField.toLowerCase()]?.bold) {
            formatting.label = { bold: true };
            label = `<strong>${label}</strong>`;
            console.log(`Bold formatting detected for label field '${labelField}'`);
          }
          
          if (infoField && row._formatting[infoField.toLowerCase()]?.bold) {
            formatting.info = { bold: true };
            info = `<strong>${info}</strong>`;
            console.log(`Bold formatting detected for info field '${infoField}'`);
          }
        } else {
          // Look for legacy formatting method (_formatting tags)
          Object.keys(row).forEach(key => {
            if (key.endsWith('_formatting')) {
              const baseField = key.replace('_formatting', '');
              formatting[baseField] = row[key];
              console.log(`Legacy formatting found for field '${baseField}':`, row[key]);
            }
          });
        }
        
        // Create the StateData object with available fields
        return {
          stateCode,
          stateName: stateName || '',
          value,
          label,
          info,
          color: row.color || row.Color || row.fillColor || row.FillColor || '',
          // Store formatting info in the data
          formatting: Object.keys(formatting).length > 0 ? formatting : undefined
        };
      }).filter(item => item.stateCode); // Only include items with a valid state code
      
      if (processedData.length === 0) {
        setError('No valid state data found in the file. Make sure your file has state names or codes.');
        return;
      }
      
      console.log('Processed data with formatting:', processedData);
      setPreviewData(processedData.slice(0, 10)); // Preview first 10 rows
      setSuccess(`File uploaded successfully! Loaded data for ${processedData.length} states.`);
      
      // Call the onDataUpload callback with the processed data
      onDataUpload(processedData);
    } catch (err) {
      console.error('Error processing data:', err);
      setError(`Error processing data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  const handleButtonClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const downloadSampleFile = () => {
    console.log('Generating sample file with bold formatting...');
    
    // Create sample data with formatting
    const sampleData = [
      { state: 'California', value: 1250000, label: 'Online Tutoring', info: 'Highest Earning Side Hustle' },
      { state: 'Texas', value: 980000, label: 'DoorDash Delivery', info: 'Most Popular Side Hustle' },
      { state: 'New York', value: 1100000, label: 'Uber Driving', info: 'Second Most Popular Side Hustle' },
      { state: 'Florida', value: 850000, label: 'Part-time Home Rental', info: 'Growing Fast' },
      { state: 'Illinois', value: 720000, label: 'Babysitting', info: 'Traditional Side Hustle' },
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Get the cell references
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:E6');
    
    // Create a bold style
    const boldStyle = { font: { bold: true } };
    console.log('Using bold style object:', boldStyle);
    
    // Apply bold to header row
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
      if (!ws[headerCell]) continue;
      
      // Create or update the style
      ws[headerCell].s = boldStyle;
      console.log(`Applied bold to header cell ${headerCell}`);
    }
    
    // Apply bold to specific values to demonstrate formatting:
    
    // 1. New York's VALUE (bold the amount)
    // Find the cell for New York's value (row 3, value column - usually B or C)
    let valueColIndex = -1;
    
    // First, find the column index for the value field
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
      if (ws[headerCell] && (ws[headerCell].v === 'value' || ws[headerCell].v === 'Value')) {
        valueColIndex = C;
        break;
      }
    }
    
    if (valueColIndex >= 0) {
      // Apply bold to New York's value (row 3 because of 0-indexing + 1 for header row)
      const nyValueCell = XLSX.utils.encode_cell({r: 3, c: valueColIndex});
      if (ws[nyValueCell]) {
        ws[nyValueCell].s = boldStyle;
        console.log(`Applied bold to New York's value cell ${nyValueCell}: ${ws[nyValueCell].v}`);
      }
    }
    
    // 2. Apply bold to the "Most Popular Side Hustle" in label column for Texas
    let labelColIndex = -1;
    
    // Find the label column
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
      if (ws[headerCell] && (ws[headerCell].v === 'label' || ws[headerCell].v === 'Label')) {
        labelColIndex = C;
        break;
      }
    }
    
    if (labelColIndex >= 0) {
      // Apply bold to Texas's label (row 2)
      const txLabelCell = XLSX.utils.encode_cell({r: 2, c: labelColIndex});
      if (ws[txLabelCell]) {
        ws[txLabelCell].s = boldStyle;
        console.log(`Applied bold to Texas's label cell ${txLabelCell}: ${ws[txLabelCell].v}`);
      }
    }
    
    // 3. Apply bold to California's info ("Highest Earning Side Hustle")
    let infoColIndex = -1;
    
    // Find the info column
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
      if (ws[headerCell] && (ws[headerCell].v === 'info' || ws[headerCell].v === 'Info')) {
        infoColIndex = C;
        break;
      }
    }
    
    if (infoColIndex >= 0) {
      // Apply bold to California's info (row 1)
      const caInfoCell = XLSX.utils.encode_cell({r: 1, c: infoColIndex});
      if (ws[caInfoCell]) {
        ws[caInfoCell].s = boldStyle;
        console.log(`Applied bold to California's info cell ${caInfoCell}: ${ws[caInfoCell].v}`);
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Data');
    
    // Verify styling before writing file
    console.log('Sample worksheet with styling:', {
      A2_style: ws['A2']?.s,
      B2_style: ws['B2']?.s,
      C2_style: ws['C2']?.s,
      D2_style: ws['D2']?.s,
    });
    
    // Generate download with a descriptive filename
    XLSX.writeFile(wb, 'map_data_sample_with_formatting.xlsx');
    
    // Notify the user
    setSuccess('Sample Excel file with formatting has been downloaded. You can use this as a template for your data.');
    console.log('Sample file with formatting has been generated and downloaded');
  };
  
  return (
    <UploaderContainer>
      <h2>Upload Your Data</h2>
      <p>
        Upload an Excel (.xlsx, .xls) or CSV file with your state data to create your customized U.S. map.
        Your file should include columns for state names or codes and any values you want to display.
      </p>
      
      <UploadSection 
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".xlsx,.xls,.csv" 
        />
        
        <UploadInstructions>
          <h4>{isDragging ? 'Drop your file here!' : 'Upload your data file'}</h4>
          <p>Drag and drop your Excel or CSV file here, or click to browse</p>
          <UploadButton>
            <UploadIcon /> Choose File
          </UploadButton>
        </UploadInstructions>
      </UploadSection>
      
      {error && (
        <ErrorMessage>
          <IconContainer>⚠️</IconContainer>
          <MessageContent>{error}</MessageContent>
        </ErrorMessage>
      )}
      
      {success && (
        <SuccessMessage>
          <IconContainer>✅</IconContainer>
          <MessageContent>{success}</MessageContent>
        </SuccessMessage>
      )}
      
      {previewData.length > 0 && (
        <PreviewContainer>
          <SectionTitle>Data Preview</SectionTitle>
          <DataTable>
            <thead>
              <tr>
                <th>State</th>
                <th>Code</th>
                <th>Value</th>
                <th>Label</th>
                <th>Info</th>
                <th>Formatting</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((item, index) => (
                <tr key={index}>
                  <td>{item.stateName}</td>
                  <td>{item.stateCode}</td>
                  <td style={{ 
                    fontWeight: item.formatting && 
                                item.formatting.value && 
                                item.formatting.value.bold ? 'bold' : 'normal' 
                  } as React.CSSProperties}>
                    {item.value}
                  </td>
                  <td style={{ 
                    fontWeight: item.formatting && 
                                item.formatting.label && 
                                item.formatting.label.bold ? 'bold' : 'normal' 
                  } as React.CSSProperties}>
                    {item.label}
                  </td>
                  <td style={{ 
                    fontWeight: item.formatting && 
                                item.formatting.info && 
                                item.formatting.info.bold ? 'bold' : 'normal' 
                  } as React.CSSProperties}>
                    {item.info}
                  </td>
                  <td>
                    {item.formatting ? 
                      Object.entries(item.formatting)
                        .filter(([_, format]) => format && format.bold)
                        .map(([field]) => field)
                        .join(', ') || 'None' :
                      'None'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          <DataCount>
            Showing {previewData.length} of {success ? success.match(/\d+/)?.[0] : 0} states
          </DataCount>
        </PreviewContainer>
      )}
      
      <SampleSection>
        <SectionTitle>Need a Sample File?</SectionTitle>
        <p>
          Not sure how to format your data? Download our sample Excel file with formatting 
          that shows how to highlight specific values.
        </p>
        <UploadButton onClick={downloadSampleFile}>
          <DownloadIcon /> Download Sample File
        </UploadButton>
      </SampleSection>
    </UploaderContainer>
  );
};

export default DataUploader; 