import React, { useState } from 'react';
import { FaExternalLinkAlt, FaExchangeAlt } from 'react-icons/fa';

const UrlRedirect = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const extractShortCode = (input) => {
    if (!input) return '';
    
    try {
      const url = new URL(input);
      return url.pathname.split('/').pop() || input;
    } catch {
      return input.trim();
    }
  };

  const handleOpen = (e) => {
    e.preventDefault();
    setError('');
    
    const shortCode = extractShortCode(input);
    
    if (!shortCode) {
      setError('Please enter a short code or URL');
      return;
    }
    
    const shortUrl = `${window.location.origin}/api/${shortCode}`;
    
    try {
      const link = document.createElement('a');
      link.href = shortUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
      
    } catch (err) {
      console.error('Error opening URL:', err);
      setError('Could not open URL. Please try copying and pasting it directly.');
    }
  };

  return (
    <div className="card">
      <h2>Open Short URL</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Enter short code or URL to open in new tab
      </p>
      
      <form onSubmit={handleOpen}>
        <div className="input-group">
          <label htmlFor="redirectInput">Short Code or URL</label>
          <input
            id="redirectInput"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Short URL"
            required
          />
        </div>

        <button type="submit" disabled={!input}>
          <FaExternalLinkAlt style={{ marginRight: '0.5rem' }} />
          Open in New Tab
        </button>
      </form>

      {error && (
        <div className="error" style={{ marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

    </div>
  );
};

export default UrlRedirect;