# US Map Generator

A simple, clean web application for generating interactive US maps from Excel or CSV data.

## Features

- Upload Excel (.xlsx, .xls) or CSV files with state data
- Customize map colors and appearance
- Generate embed codes for your website
- Save and load map configurations
- Interactive tooltips with custom information
- Support for custom colors from Excel data
- Mobile-responsive design

## How to Use

1. Open the Map Generator
2. Upload an Excel or CSV file with state data
3. Customize the map appearance
4. Generate an embed code for your website

## File Format

Your Excel or CSV file should include:

- A column with state codes (e.g., NY, CA) or state names
- A column with values for each state
- Optional columns for additional information:
  - `info` or `description`: Additional text to show in tooltips
  - `label` or `header`: Custom header text for tooltips
  - `color`: Custom colors for states (hex codes or color names)

## Deployment

This project is deployed on Vercel at [https://augmentmapgentake2.vercel.app/](https://augmentmapgentake2.vercel.app/)

## Technologies Used

- HTML, CSS, JavaScript
- D3.js for map visualization
- TopoJSON for map data
- SheetJS for Excel parsing
- PapaParse for CSV parsing

## License

MIT License
