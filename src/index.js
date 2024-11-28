import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; // Import the BrowserRouter component from the react-router-dom library
import App from './App'; // Import the App component
import './index.css'; // Optional, you can add custom styles here.

// Renders the App component into the root div in the HTML file
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
    
    <App />
    </BrowserRouter>
    
  </React.StrictMode>,
  document.getElementById('root')
);

// Optional: Track performance metrics
// reportWebVitals();
