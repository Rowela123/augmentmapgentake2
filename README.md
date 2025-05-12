# Legend Fix for Map Generator

This repository contains the fixed files for the map generator legend issue.

## Issue

When uploading an Excel file with custom colors (green, yellow, red), the legend doesn't reflect these custom colors.

## Fix

The fix modifies the legend creation code to check if:
1. We're using the "multi" color scheme
2. We have custom colors loaded from the Excel file

If both conditions are true, the legend will use the custom colors instead of the predefined color scale.

## Files Modified

1. `public/js/map-generator.js` - Updated the legend gradient creation to use custom colors when available
2. `public/embed.html` - Made similar changes for embedded maps

## How to Use

1. Upload an Excel file with custom colors in a column (the column name should contain "color", "colour", or "fill")
2. Select the "multi" color scheme (first option)
3. The legend will now reflect the custom colors from your Excel file

This ensures that when you upload an Excel sheet with green, yellow, and red colors, the legend will accurately reflect these colors.
