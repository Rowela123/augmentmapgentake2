# US Map Generator

An interactive US Map Generator that allows you to create and embed customizable maps on any website. Upload your data, customize the map, and generate embed code to share your visualizations.

![US Map Generator Screenshot](screenshot.png)

## Features

- **Interactive US Map**: Hover over states to see detailed information
- **Data Upload**: Import data from Excel or CSV files
- **Customization Options**: Configure colors, tooltips, and styles
- **Embed Code Generator**: Easily embed maps in any website
- **Responsive Design**: Maps adapt to different screen sizes
- **Future Support**: Planning to add maps for Europe, Canada, and more regions

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/us-map-generator.git
   cd us-map-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or with yarn:
   ```
   yarn install
   ```

3. Start the development server:
   ```
   npm start
   ```
   or with yarn:
   ```
   yarn start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Uploading Data

1. Prepare an Excel or CSV file with the following columns:
   - `state`: Full state name (e.g., "California")
   - `value`: Numeric value for coloring/visualization
   - `label`: Label to display in the tooltip
   - `info`: Additional information to display in the tooltip
   - `color`: (Optional) Custom color for the state (hex format)

2. Click the "Upload Data" tab and select your file.

3. Preview your data and make sure it's correctly loaded.

### Customizing Your Map

- Set a title for your map
- Adjust the color scheme if needed
- Preview how your map looks with the loaded data

### Generating Embed Code

1. Click the "Get Embed Code" tab
2. Configure display options (width, height, responsiveness)
3. Copy the generated code
4. Paste it into your website HTML

### Embedding Options

The generated embed code will include:

- An iframe with your map
- Proper attribution with a link back to the original
- Optional responsive script to adapt the height automatically

## Data Format

The generator accepts data in the following formats:

### Excel (.xlsx, .xls)

Your Excel file should have columns named to match these fields:
- state or stateName
- value
- label
- info
- color (optional)

### CSV

Similar to Excel, with column headers as described above.

## Customization

You can customize various aspects of the map:
- Colors for different value ranges
- Hover effects
- Tooltip content and styling
- Map dimensions and responsiveness

## Development

### Project Structure

```
us-map-generator/
├── public/               # Static files
├── src/                  # Source code
│   ├── components/       # React components
│   ├── utils/            # Utility functions
│   ├── data/             # Data processing
│   ├── App.tsx           # Main application
│   └── index.tsx         # Entry point
└── package.json          # Dependencies and scripts
```

### Adding New Map Types

Future versions will include support for additional map regions:
- Europe
- Canada
- World Map
- Custom Regions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- D3.js for the mapping functionality
- TopoJSON for the geographical data
- React for the UI framework
- Inspired by other great map visualization tools 