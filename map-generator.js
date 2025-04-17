// State Variables
let stateData = [
    { stateCode: 'NY', stateName: 'New York', value: 75 },
    { stateCode: 'CA', stateName: 'California', value: 50 },
    { stateCode: 'TX', stateName: 'Texas', value: 25 }
]; // Add some sample data to test with
let colorScheme = 'green-to-red';
let mapTitle = 'US Map';
let legendTitle = 'Value';
let legendMinLabel = 'Low';
let legendMaxLabel = 'High';
let showLabels = true;
let statesFeatures = [];
let mapId = 'demo-' + Date.now().toString(); // Generate a default map ID
let customColors = {}; // Store custom colors from Excel

// State code to name mapping
const stateCodeToName = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia'
};

// State name to code mapping
const stateNameToCode = {};
for (const [code, name] of Object.entries(stateCodeToName)) {
    stateNameToCode[name.toUpperCase()] = code;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form fields with default values
    document.getElementById('map-title-input').value = mapTitle;
    document.getElementById('legend-title-input').value = legendTitle;
    document.getElementById('legend-min-label').value = legendMinLabel;
    document.getElementById('legend-max-label').value = legendMaxLabel;
    document.getElementById('show-labels').checked = showLabels;

    // Initialize map
    initMap();

    // Set up event listeners
    setupEventListeners();

    // Generate initial embed code
    updateEmbedCode();
});

// Initialize map
function initMap() {
    // Load US TopoJSON data
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
        .then(us => {
            // Convert TopoJSON to GeoJSON
            statesFeatures = topojson.feature(us, us.objects.states).features;

            // Add state names
            statesFeatures.forEach(state => {
                const stateId = state.id;
                // Convert numeric IDs to state codes
                const stateInfo = getStateInfoFromId(stateId);
                if (stateInfo) {
                    state.properties.code = stateInfo.code;
                    state.properties.name = stateInfo.name;
                }
            });

            // Draw the map
            drawMap();
        })
        .catch(error => {
            console.error('Error loading US map data:', error);
        });
}

// Helper function to convert numeric state IDs to state codes
function getStateInfoFromId(id) {
    // This is a simplified mapping - in a real app, you'd use a complete mapping
    const stateMapping = {
        "01": { code: "AL", name: "Alabama" },
        "02": { code: "AK", name: "Alaska" },
        "04": { code: "AZ", name: "Arizona" },
        "05": { code: "AR", name: "Arkansas" },
        "06": { code: "CA", name: "California" },
        "08": { code: "CO", name: "Colorado" },
        "09": { code: "CT", name: "Connecticut" },
        "10": { code: "DE", name: "Delaware" },
        "11": { code: "DC", name: "District of Columbia" },
        "12": { code: "FL", name: "Florida" },
        "13": { code: "GA", name: "Georgia" },
        "15": { code: "HI", name: "Hawaii" },
        "16": { code: "ID", name: "Idaho" },
        "17": { code: "IL", name: "Illinois" },
        "18": { code: "IN", name: "Indiana" },
        "19": { code: "IA", name: "Iowa" },
        "20": { code: "KS", name: "Kansas" },
        "21": { code: "KY", name: "Kentucky" },
        "22": { code: "LA", name: "Louisiana" },
        "23": { code: "ME", name: "Maine" },
        "24": { code: "MD", name: "Maryland" },
        "25": { code: "MA", name: "Massachusetts" },
        "26": { code: "MI", name: "Michigan" },
        "27": { code: "MN", name: "Minnesota" },
        "28": { code: "MS", name: "Mississippi" },
        "29": { code: "MO", name: "Missouri" },
        "30": { code: "MT", name: "Montana" },
        "31": { code: "NE", name: "Nebraska" },
        "32": { code: "NV", name: "Nevada" },
        "33": { code: "NH", name: "New Hampshire" },
        "34": { code: "NJ", name: "New Jersey" },
        "35": { code: "NM", name: "New Mexico" },
        "36": { code: "NY", name: "New York" },
        "37": { code: "NC", name: "North Carolina" },
        "38": { code: "ND", name: "North Dakota" },
        "39": { code: "OH", name: "Ohio" },
        "40": { code: "OK", name: "Oklahoma" },
        "41": { code: "OR", name: "Oregon" },
        "42": { code: "PA", name: "Pennsylvania" },
        "44": { code: "RI", name: "Rhode Island" },
        "45": { code: "SC", name: "South Carolina" },
        "46": { code: "SD", name: "South Dakota" },
        "47": { code: "TN", name: "Tennessee" },
        "48": { code: "TX", name: "Texas" },
        "49": { code: "UT", name: "Utah" },
        "50": { code: "VT", name: "Vermont" },
        "51": { code: "VA", name: "Virginia" },
        "53": { code: "WA", name: "Washington" },
        "54": { code: "WV", name: "West Virginia" },
        "55": { code: "WI", name: "Wisconsin" },
        "56": { code: "WY", name: "Wyoming" }
    };

    return stateMapping[id];
}

// Draw the map
function drawMap() {
    if (statesFeatures.length === 0) return;

    const svg = d3.select('#map');
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create projection
    const projection = d3.geoAlbersUsa()
        .fitSize([width, height], { type: 'FeatureCollection', features: statesFeatures });

    // Create path generator
    const pathGenerator = d3.geoPath().projection(projection);

    // Create color scale
    let colorScale;

    // Set color scheme
    if (colorScheme === 'multi') {
        // For multi-color scheme, use a standard threshold scale
        // We'll handle custom colors separately when setting the fill attribute
        colorScale = d3.scaleThreshold()
            .domain([25, 50, 75])
            .range(['#388e3c', '#fbc02d', '#f57c00', '#d32f2f']); // Green, Yellow, Orange, Red
    } else if (colorScheme === 'green-to-red') {
        // Create a custom green to red color scale
        colorScale = d3.scaleSequential()
            .interpolator(d3.interpolateRgbBasis(['#388e3c', '#fbc02d', '#f57c00', '#d32f2f'])); // Green, Yellow, Orange, Red
    } else {
        // Sequential color schemes
        colorScale = d3.scaleSequential();

        switch (colorScheme) {
            case 'blues':
                colorScale.interpolator(d3.interpolateBlues);
                break;
            case 'greens':
                colorScale.interpolator(d3.interpolateGreens);
                break;
            case 'reds':
                colorScale.interpolator(d3.interpolateReds);
                break;
            case 'purples':
                colorScale.interpolator(d3.interpolatePurples);
                break;
            case 'oranges':
                colorScale.interpolator(d3.interpolateOranges);
                break;
            case 'viridis':
                colorScale.interpolator(d3.interpolateViridis);
                break;
            default:
                colorScale.interpolator(d3.interpolateBlues);
        }
    }

    // Find min and max values
    let minValue = 0;
    let maxValue = 100;

    if (stateData.length > 0) {
        minValue = d3.min(stateData, d => d.value) || 0;
        maxValue = d3.max(stateData, d => d.value) || 100;
    }

    // Set domain for color scale
    colorScale.domain([minValue, maxValue]);

    // Create tooltip
    const tooltip = d3.select('#tooltip');

    // Define small states that need special handling
    const smallStates = ['RI', 'DE', 'DC', 'CT', 'NJ', 'MD', 'MA', 'NH', 'VT'];

    // Draw states
    svg.selectAll('path')
        .data(statesFeatures)
        .enter()
        .append('path')
        .attr('d', d => pathGenerator(d) || '')
        .attr('fill', d => {
            const stateCode = d.properties.code;
            const stateDataItem = stateData.find(item => item.stateCode === stateCode);

            // If we're using multi-color scheme and have a custom color for this state, use it
            if (colorScheme === 'multi' && customColors[stateCode]) {
                return customColors[stateCode];
            }

            // Special case for Hawaii to ensure it's colored
            if (stateCode === 'HI') {
                // Force Hawaii to be colored with a specific color from the scale
                // Use the minimum value of the scale to ensure it's colored
                return colorScale(minValue);
            }

            // For other states, if we have data but value is null, use a light gray
            if (stateDataItem) {
                return stateDataItem.value !== null ? colorScale(stateDataItem.value) : '#ccc';
            }

            // No data for this state
            return '#eee';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('class', d => {
            // Add a class for small states for easier selection
            return smallStates.includes(d.properties.code) ? 'small-state' : '';
        })
        .on('mouseover', (event, d) => {
            const stateCode = d.properties.code;
            const stateName = d.properties.name;
            const stateDataItem = stateData.find(item => item.stateCode === stateCode);

            d3.select(event.currentTarget)
                .attr('stroke', '#333')
                .attr('stroke-width', 1.5);

            tooltip
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);

            // Determine color for tooltip header based on value
            let headerColor = '#999';
            if (stateDataItem) {
                const value = stateDataItem.value;
                const minValue = d3.min(stateData, d => d.value) || 0;
                const maxValue = d3.max(stateData, d => d.value) || 100;
                const normalizedValue = (value - minValue) / (maxValue - minValue);

                if (normalizedValue >= 0.75) {
                    headerColor = '#d32f2f'; // Red for highest values
                } else if (normalizedValue >= 0.5) {
                    headerColor = '#f57c00'; // Orange for high values
                } else if (normalizedValue >= 0.25) {
                    headerColor = '#fbc02d'; // Yellow for medium values
                } else {
                    headerColor = '#388e3c'; // Green for low values
                }
            }

            // Create tooltip content with header and body
            // Use the label as the header if available, otherwise use the state name
            const headerText = stateDataItem && stateDataItem.label ? stateDataItem.label : stateName.toUpperCase();

            let tooltipContent = `
                <div class="tooltip-header" style="background-color: ${headerColor}">
                    <div class="state-icon">${stateDataItem ? stateDataItem.stateCode : ''}</div>
                    ${headerText}
                </div>
                <div class="tooltip-body">`;

            if (stateDataItem) {
                // If we're using a label as the header, show the state name in the body
                if (stateDataItem.label) {
                    tooltipContent += `<p><strong>State:</strong> ${stateName}</p>`;
                }

                // We're not showing the value in this map as per user request
                // Value is still used for coloring the map, but not displayed in tooltip

                // Add info if available, preserving HTML formatting
                if (stateDataItem.info) {
                    // Process the info text to preserve bold formatting
                    let infoText = stateDataItem.info;

                    // Check if the text contains HTML-like bold tags from Excel
                    // Excel sometimes exports bold text with <b> tags or with special formatting
                    const hasBoldTags = infoText.includes('<b>') || infoText.includes('</b>');

                    // If no HTML tags, check for Excel's special character sequences that might indicate bold
                    if (!hasBoldTags) {
                        // Look for patterns that might indicate bold text from Excel
                        // This regex looks for text that might be surrounded by special characters or formatting
                        infoText = infoText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    }

                    // Split the info by line breaks if any
                    const infoLines = infoText.split('\n');

                    // Check if the info has numbered or bulleted list format
                    const hasListFormat = infoLines.some(line =>
                        line.trim().match(/^\d+\.\s/) || line.trim().match(/^[\*\-•]\s/));

                    if (hasListFormat) {
                        tooltipContent += '<ul>';
                        infoLines.forEach(line => {
                            const trimmedLine = line.trim();
                            // Remove the number/bullet and add as list item
                            const listItemText = trimmedLine.replace(/^\d+\.\s|^[\*\-•]\s/, '');
                            tooltipContent += `<li>${listItemText}</li>`;
                        });
                        tooltipContent += '</ul>';
                    } else {
                        tooltipContent += `<p>${infoText}</p>`;
                    }
                }
            } else {
                tooltipContent += '<p>No data available</p>';
            }

            tooltipContent += '</div>';

            tooltip.html(tooltipContent);
        })
        .on('mousemove', (event) => {
            tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseout', (event) => {
            d3.select(event.currentTarget)
                .attr('stroke', '#fff')
                .attr('stroke-width', 0.5);

            tooltip.style('opacity', 0);
        });

    // Add state labels if enabled
    if (showLabels) {
        svg.selectAll('text')
            .data(statesFeatures)
            .enter()
            .append('text')
            .attr('x', d => {
                const centroid = pathGenerator.centroid(d);
                return centroid[0];
            })
            .attr('y', d => {
                const centroid = pathGenerator.centroid(d);
                return centroid[1];
            })
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '8px')
            .attr('fill', '#333')
            .text(d => d.properties.code);
    }

    // Add small states list to the side
    if (smallStates.length > 0) {
        // Create a group for the small states list
        // Position it at the far right edge of the SVG and centered vertically
        const smallStatesGroup = svg.append('g')
            .attr('class', 'small-states-list')
            .attr('transform', `translate(${width - 30}, ${height/2 - smallStates.length * 10})`);

        // Add each small state to the list
        smallStates.forEach((stateCode, index) => {
            const state = statesFeatures.find(d => d.properties.code === stateCode);
            if (!state) return;

            const stateCentroid = pathGenerator.centroid(state);

            // Add small dot for the state
            smallStatesGroup.append('circle')
                .attr('cx', 0)
                .attr('cy', index * 20)
                .attr('r', 3)
                .attr('fill', '#666');

            // Add state code text
            smallStatesGroup.append('text')
                .attr('x', 10)
                .attr('y', index * 20 + 4)
                .attr('font-size', '10px')
                .attr('fill', '#333')
                .attr('text-anchor', 'start')
                .attr('alignment-baseline', 'middle')
                .text(stateCode);

            // Draw connecting line from list to state - curved line like in the example
            if (stateCentroid && stateCentroid.length === 2) {
                // Calculate the position relative to the smallStatesGroup
                const targetX = stateCentroid[0] - (width - 30);
                const targetY = stateCentroid[1] - (height/2 - smallStates.length * 10);

                // Create a curved path using SVG path commands
                const path = `M 0 ${index * 20} L -10 ${index * 20} Q -30 ${index * 20} ${targetX} ${targetY}`;

                smallStatesGroup.append('path')
                    .attr('d', path)
                    .attr('fill', 'none')
                    .attr('stroke', '#ccc')
                    .attr('stroke-width', 0.5);
            }
        });
    }

    // Add legend if we have data
    if (stateData.length > 0) {
        const legendWidth = 200;
        const legendHeight = 20;
        // Position the legend to the right side of the map, between Texas and Florida
        const legendX = width * 0.58; // Moved a tiny bit more to the left
        const legendY = height - 40; // Very close to the bottom

        // Create gradient for legend
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('x2', '100%')
            .attr('y1', '0%')
            .attr('y2', '0%');

        // Add color stops
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const offset = `${i * 100 / numStops}%`;
            const value = minValue + (i / numStops) * (maxValue - minValue);
            gradient.append('stop')
                .attr('offset', offset)
                .attr('stop-color', colorScale(value));
        }

        // Draw legend rectangle
        svg.append('rect')
            .attr('x', legendX)
            .attr('y', legendY)
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .style('fill', 'url(#legend-gradient)')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 1);

        // Add legend title
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY - 5)
            .attr('font-size', '12px')
            .attr('fill', '#333')
            .text(legendTitle);

        // Add min label directly below the scale
        svg.append('text')
            .attr('x', legendX)
            .attr('y', legendY + legendHeight + 15) // Positioned closer to the scale
            .attr('font-size', '12px')
            .attr('fill', '#000')
            .attr('font-weight', 'bold')
            .text(legendMinLabel);

        // Add max label directly below the scale
        svg.append('text')
            .attr('x', legendX + legendWidth)
            .attr('y', legendY + legendHeight + 15) // Positioned closer to the scale
            .attr('font-size', '12px')
            .attr('fill', '#000')
            .attr('text-anchor', 'end')
            .attr('font-weight', 'bold')
            .text(legendMaxLabel);
    }
}
// Set up event listeners
function setupEventListeners() {
    // File upload
    document.getElementById('file-upload').addEventListener('change', handleFileUpload);

    // Color scheme selection
    document.querySelectorAll('.color-scheme').forEach(element => {
        element.addEventListener('click', () => {
            // Update selected scheme
            document.querySelectorAll('.color-scheme').forEach(el => {
                el.classList.remove('selected');
            });
            element.classList.add('selected');

            // Update color scheme
            colorScheme = element.getAttribute('data-scheme');

            // Redraw map
            drawMap();

            // Update embed code
            updateEmbedCode();
        });
    });

    // Map settings
    document.getElementById('apply-settings').addEventListener('click', () => {
        // Update map title
        mapTitle = document.getElementById('map-title-input').value;
        document.getElementById('map-title').textContent = mapTitle;

        // Update legend title
        legendTitle = document.getElementById('legend-title-input').value;

        // Update legend min and max labels
        legendMinLabel = document.getElementById('legend-min-label').value;
        legendMaxLabel = document.getElementById('legend-max-label').value;

        // Update show labels
        showLabels = document.getElementById('show-labels').checked;

        // Redraw map
        drawMap();

        // Update embed code
        updateEmbedCode();
    });

    // Save map
    document.getElementById('save-map').addEventListener('click', () => {
        saveMapToFile();
    });

    // Load map
    document.getElementById('load-map-file').addEventListener('change', (event) => {
        loadMapFromFile(event);
    });

    // Copy embed code
    document.getElementById('copy-code').addEventListener('click', () => {
        const embedCode = document.getElementById('embed-code');
        embedCode.select();
        
        // Use modern clipboard API with fallback
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(embedCode.value)
                .then(() => {
                    showCopySuccess();
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    // Fallback
                    document.execCommand('copy');
                    showCopySuccess();
                });
        } else {
            // Fallback for older browsers
            document.execCommand('copy');
            showCopySuccess();
        }
    });
}

// Show copy success message
function showCopySuccess() {
    const copyMessage = document.getElementById('copy-message');
    copyMessage.innerHTML = '<div class="success-message">✓ Copied to clipboard!</div>';
    
    setTimeout(() => {
        copyMessage.innerHTML = '';
    }, 3000);
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileInfo = document.getElementById('file-info');
    fileInfo.textContent = `Selected file: ${file.name}`;

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
        // Parse CSV
        Papa.parse(file, {
            header: true,
            complete: results => {
                processData(results.data);
            },
            error: error => {
                showUploadError(`Error parsing CSV: ${error.message}`);
            }
        });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Parse Excel
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const data = e.target.result;
                // Use arraybuffer type instead of binary
                const workbook = XLSX.read(new Uint8Array(data), { type: 'array', cellStyles: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Use sheet_to_json with options to preserve formatting
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,  // Convert values to strings to preserve formatting
                    defval: ''   // Default value for empty cells
                });

                processData(jsonData);
            } catch (error) {
                showUploadError(`Error parsing Excel file: ${error}`);
            }
        };
        reader.onerror = () => {
            showUploadError('Error reading file');
        };
        // Use modern ArrayBuffer instead of deprecated readAsBinaryString
        reader.readAsArrayBuffer(file);
    } else {
        showUploadError('Unsupported file format. Please upload a CSV or Excel file.');
    }
}

// Process uploaded data
function processData(rawData) {
    try {
        if (!rawData || rawData.length === 0) {
            showUploadError('No data found in the file');
            return;
        }

        // Find state code and value columns
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);

        let stateCodeColumn = '';
        let valueColumn = '';

        // Try to automatically detect columns
        let infoColumn = '';
        let colorColumn = '';
        let labelColumn = '';
        for (const column of columns) {
            const lowerColumn = column.toLowerCase();
            if (
                lowerColumn.includes('state') ||
                lowerColumn.includes('code') ||
                lowerColumn === 'st'
            ) {
                stateCodeColumn = column;
            } else if (
                lowerColumn.includes('value') ||
                lowerColumn.includes('data') ||
                lowerColumn.includes('count') ||
                lowerColumn.includes('amount')
            ) {
                valueColumn = column;
            } else if (
                lowerColumn.includes('info') ||
                lowerColumn.includes('description') ||
                lowerColumn.includes('notes') ||
                lowerColumn.includes('details')
            ) {
                infoColumn = column;
            } else if (
                lowerColumn.includes('color') ||
                lowerColumn.includes('colour') ||
                lowerColumn.includes('fill')
            ) {
                colorColumn = column;
            } else if (
                lowerColumn.includes('label') ||
                lowerColumn.includes('header') ||
                lowerColumn.includes('title')
            ) {
                labelColumn = column;
            }
        }

        // If we couldn't detect columns, use the first two
        if (!stateCodeColumn && columns.length > 0) {
            stateCodeColumn = columns[0];
        }

        if (!valueColumn && columns.length > 1) {
            valueColumn = columns[1];
        }

        if (!stateCodeColumn || !valueColumn) {
            showUploadError('Could not identify state code and value columns in your data');
            return;
        }

        // Process the data
        const processedData = rawData
            .filter(row => row[stateCodeColumn]) // Only filter by state code, allow blank values
            .map(row => {
                // Normalize state code to 2 letters
                let stateCode = String(row[stateCodeColumn]).trim().toUpperCase();

                // Handle full state names
                if (stateCode.length > 2) {
                    if (stateNameToCode[stateCode]) {
                        stateCode = stateNameToCode[stateCode];
                    } else {
                        // Try to match partial state names
                        for (const [name, code] of Object.entries(stateNameToCode)) {
                            if (name.includes(stateCode) || stateCode.includes(name)) {
                                stateCode = code;
                                break;
                            }
                        }
                    }
                }

                // Ensure state code is exactly 2 characters
                if (stateCode.length !== 2 || !stateCodeToName[stateCode]) {
                    return null;
                }

                // Parse value as number if it exists
                let value = null;
                // Check if the value column exists and is not an empty string
                if (row[valueColumn] !== undefined && row[valueColumn] !== '') {
                    value = parseFloat(row[valueColumn]);
                    // If value is not a valid number, set to null but don't return null
                    if (isNaN(value)) {
                        value = null;
                    }
                }

                // Get info if available
                const info = infoColumn && row[infoColumn] ? String(row[infoColumn]) : null;

                // Get label if available
                const label = labelColumn && row[labelColumn] ? String(row[labelColumn]) : null;

                // Get color if available
                let color = null;
                if (colorColumn && row[colorColumn]) {
                    color = String(row[colorColumn]).trim();

                    // Try to validate the color
                    if (color) {
                        // If it doesn't start with #, try to add it (Excel might strip the #)
                        if (!color.startsWith('#') && !color.match(/^rgb/i) && color.match(/^[0-9A-Fa-f]{6}$/)) {
                            color = '#' + color;
                        }

                        // Store color in our custom colors object if it's a valid color
                        if (color.startsWith('#') || color.match(/^rgb/i) || isNamedColor(color)) {
                            customColors[stateCode] = color;
                        }
                    }
                }

                return {
                    stateCode,
                    stateName: stateCodeToName[stateCode],
                    value,
                    info,
                    label,
                    color
                };
            })
            .filter(Boolean);

        if (processedData.length === 0) {
            showUploadError('No valid data found in the file');
            return;
        }

        // Update state data
        stateData = processedData;

        // Generate a unique ID for the map
        mapId = Date.now().toString();

        // Show success message with color info if available
        let successMessage = `Successfully loaded data for ${processedData.length} states`;
        const colorCount = Object.keys(customColors).length;
        if (colorCount > 0) {
            successMessage += `. Found ${colorCount} custom colors.`;
        }
        showUploadSuccess(successMessage);

        // Redraw map
        drawMap();

        // Update embed code
        updateEmbedCode();

        // Save map data to localStorage
        saveMapData();
    } catch (error) {
        showUploadError(`Error processing data: ${error}`);
    }
}

// Show upload error
function showUploadError(message) {
    const uploadMessage = document.getElementById('upload-message');
    uploadMessage.innerHTML = `<div class="error-message">${message}</div>`;
}

// Show upload success
function showUploadSuccess(message) {
    const uploadMessage = document.getElementById('upload-message');
    uploadMessage.innerHTML = `<div class="success-message">${message}</div>`;
}

// Helper function to check if a string is a valid CSS color name
function isNamedColor(color) {
    // Create a temporary element to test if the color is valid
    const tempElement = document.createElement('div');
    tempElement.style.color = color;

    // If the color is valid, the browser will set the style
    return tempElement.style.color !== '';
}

// Update embed code
function updateEmbedCode() {
    if (!mapId || stateData.length === 0) {
        document.getElementById('embed-code').value = 'Upload data first to generate an embed code.';
        return;
    }

    // Create the embed code with the map ID
    const baseUrl = window.location.origin;
    const embedUrl = `${baseUrl}/embed.html?id=${mapId}`;

    const code = `<!-- US Map Generator Embed Code -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="500"
  style="border: none; max-width: 100%;"
  title="${mapTitle}"
  allow="fullscreen">
</iframe>`;

    document.getElementById('embed-code').value = code;
}

// Save map data to localStorage
function saveMapData() {
    if (!mapId) return;

    const mapData = {
        stateData,
        colorScheme,
        title: mapTitle,
        legendTitle,
        legendMinLabel,
        legendMaxLabel,
        showLabels,
        customColors
    };

    localStorage.setItem(`map_${mapId}`, JSON.stringify(mapData));
}

// Save map to file
function saveMapToFile() {
    if (stateData.length === 0) {
        showSaveLoadMessage('Please upload data first.', 'error');
        return;
    }

    // Create map data object
    const mapData = {
        stateData,
        colorScheme,
        title: mapTitle,
        legendTitle,
        legendMinLabel,
        legendMaxLabel,
        showLabels,
        customColors,
        savedDate: new Date().toISOString()
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(mapData, null, 2);

    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `map_${mapTitle.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);

    showSaveLoadMessage('Map saved successfully!', 'success');
}

// Load map from file
function loadMapFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if it's a JSON file
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        showSaveLoadMessage('Please select a valid JSON map file.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const mapData = JSON.parse(e.target.result);

            // Validate the map data
            if (!mapData.stateData || !Array.isArray(mapData.stateData)) {
                throw new Error('Invalid map data format');
            }

            // Update all map settings
            stateData = mapData.stateData;
            colorScheme = mapData.colorScheme || 'green-to-red';
            mapTitle = mapData.title || 'US Map';
            legendTitle = mapData.legendTitle || 'Value';
            legendMinLabel = mapData.legendMinLabel || 'Low';
            legendMaxLabel = mapData.legendMaxLabel || 'High';
            showLabels = mapData.showLabels !== undefined ? mapData.showLabels : true;
            customColors = mapData.customColors || {};

            // Update UI elements
            document.getElementById('map-title-input').value = mapTitle;
            document.getElementById('map-title').textContent = mapTitle;
            document.getElementById('legend-title-input').value = legendTitle;
            document.getElementById('legend-min-label').value = legendMinLabel;
            document.getElementById('legend-max-label').value = legendMaxLabel;
            document.getElementById('show-labels').checked = showLabels;

            // Update color scheme selection
            document.querySelectorAll('.color-scheme').forEach(el => {
                el.classList.remove('selected');
                if (el.getAttribute('data-scheme') === colorScheme) {
                    el.classList.add('selected');
                }
            });

            // Generate a new map ID
            mapId = Date.now().toString();

            // Redraw map
            drawMap();

            // Update embed code
            updateEmbedCode();

            // Show success message
            showSaveLoadMessage(`Map "${mapTitle}" loaded successfully!`, 'success');
        } catch (error) {
            showSaveLoadMessage(`Error loading map: ${error.message}`, 'error');
        }
    };
    reader.onerror = () => {
        showSaveLoadMessage('Error reading file', 'error');
    };
    reader.readAsText(file);
}

// Show save/load message
function showSaveLoadMessage(message, type) {
    const messageElement = document.getElementById('save-load-message');

    let className = 'success-message';
    if (type === 'error') {
        className = 'error-message';
    } else if (type === 'info') {
        className = 'info-message';
    }

    messageElement.innerHTML = `<div class="${className}">${message}</div>`;

    setTimeout(() => {
        messageElement.innerHTML = '';
    }, 5000);
}
