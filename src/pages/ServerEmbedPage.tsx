import React from 'react';
import { Navigate } from 'react-router-dom';

// This is a placeholder component that will redirect to the main embed page
// The server embed functionality has been deprecated
const ServerEmbedPage: React.FC = () => {
  return <Navigate to="/embed" replace />;
};

export default ServerEmbedPage; 