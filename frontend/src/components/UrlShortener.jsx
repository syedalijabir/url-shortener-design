import React, { useState } from 'react';
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';
import { urlService } from '../services/api';

const UrlShortener = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);

    try {
      const data = await urlService.shorten(url, customAlias);
      setResult(data);
    } catch (err) {
      setError(err.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShortUrl = (shortCode) => {
    return `${window.location.origin}/${shortCode}`;
  };

  return (
    <div className="card">
      <h2>Shorten URL</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="url">Original URL *</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            required
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="customAlias">Custom Alias (Optional)</label>
          <input
            id="customAlias"
            type="text"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-custom-alias"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !url}>
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="result">
          <h3>🎉 URL Shortened Successfully!</h3>
          <p>
            <strong>Short URL:</strong><br />
            <a 
              href={getShortUrl(result.short_code)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {getShortUrl(result.short_code)}
            </a>
            <button
              onClick={() => copyToClipboard(getShortUrl(result.short_code))}
              style={{ 
                marginLeft: '1rem', 
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem'
              }}
            >
              <FaCopy /> {copied ? 'Copied!' : 'Copy'}
            </button>
          </p>
          <p>
            <strong>Original URL:</strong><br />
            <a 
              href={result.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {result.original_url} <FaExternalLinkAlt />
            </a>
          </p>
          <p>
            <strong>Short Code:</strong> {result.short_code}
          </p>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;