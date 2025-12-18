import React, { useState } from 'react';
import { FaChartBar, FaMousePointer } from 'react-icons/fa';
import { urlService } from '../services/api';

const UrlStats = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  // Extract short code from URL or use as-is
  const extractShortCode = (input) => {
    if (!input) return '';
    
    try {
      const url = new URL(input);
      // Remove /api/ prefix if present
      const path = url.pathname.replace(/^\/api\//, '');
      return path.split('/').pop() || input;
    } catch {
      return input.trim();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStats(null);

    const shortCode = extractShortCode(input);
    
    if (!shortCode) {
      setError('Please enter a short code');
      setLoading(false);
      return;
    }

    try {
      // This will call /api/stats/{shortCode} via the API service
      const data = await urlService.getStats(shortCode);
      setStats(data);
    } catch (err) {
      setError(err.error || 'Failed to get statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card">
      <h2>URL Statistics</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.9rem' }}>
        Enter short code to get statistics
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="statsInput">Short Code</label>
          <input
            id="statsInput"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Short URL"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading || !input}>
          {loading ? 'Loading...' : 'Get Statistics'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {stats && !stats.error && (
        <div className="result">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <FaChartBar size={24} color="#8b5cf6" />
            <h3>Statistics for: {stats.short_code}</h3>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{stats.click_count}</div>
              <div className="stat-label">
                <FaMousePointer /> Total Visits
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-value">
                {formatDate(stats.created_at)}
              </div>
              <div className="stat-label">Created</div>
            </div>
          </div>
        </div>
      )}

      {stats?.error && (
        <div className="error">
          <strong>Error:</strong> {stats.error}
        </div>
      )}

    </div>
  );
};

export default UrlStats;