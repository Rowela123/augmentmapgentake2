// Vercel Serverless Function to create a new map
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

// Generate a random ID similar to Columns.ai (11-character alphanumeric)
function generateMapId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 11; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export default function handler(req, res) {
  // Set CORS headers to allow requests from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return a list of all map IDs (could be limited or paginated in a real implementation)
    res.status(200).json({
      maps: Object.keys(mapDatabase).map(id => ({
        id,
        title: mapDatabase[id].title || 'Untitled Map'
      }))
    });
  } else if (req.method === 'POST') {
    // Create a new map
    try {
      const data = req.body;
      
      if (!data) {
        res.status(400).json({ error: 'No data provided' });
        return;
      }
      
      // Generate a unique ID for the new map
      const id = generateMapId();
      
      // Store the map data
      mapDatabase[id] = data;
      
      // In a real implementation, you would save to a database here
      
      res.status(201).json({ id, success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save map data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 