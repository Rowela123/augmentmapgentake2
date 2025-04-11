// Vercel Serverless Function to get map data by ID
let mapDatabase = {};

// Initialize with some example data
try {
  // In production, this would be replaced with a real database connection
  mapDatabase = require('./maps.json');
} catch (error) {
  console.log('No existing maps database found, creating new one');
  // Initialize with empty database if file doesn't exist
  mapDatabase = {};
}

export default function handler(req, res) {
  // Set CORS headers to allow embedding from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    // Return map data for the given ID
    if (mapDatabase[id]) {
      res.status(200).json(mapDatabase[id]);
    } else {
      res.status(404).json({ error: 'Map not found' });
    }
  } else if (req.method === 'POST') {
    // Save new map data
    try {
      const data = req.body;
      
      if (!data) {
        res.status(400).json({ error: 'No data provided' });
        return;
      }
      
      mapDatabase[id] = data;
      
      // In a real implementation, you would save to a database here
      // For this example, we're just keeping it in memory
      
      res.status(200).json({ id, success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save map data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 