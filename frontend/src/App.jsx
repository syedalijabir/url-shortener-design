import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UrlShortener from './components/UrlShortener';
import UrlStats from './components/UrlStats';
import UrlRedirect from './components/UrlRedirect';
import Footer from './components/Footer';
import { urlService } from './services/api';
import './App.css';

function App() {
  const [health, setHealth] = useState(null);
  const [services, setServices] = useState({
    gateway: 'checking',
    url: 'checking',
    cache: 'checking',
    storage: 'checking'
  });

  useEffect(() => {
    // Check overall health
    const checkHealth = async () => {
      try {
        const data = await urlService.health();
        setHealth(data);
      } catch (err) {
        setHealth({ status: 'unhealthy', error: err.error });
      }
    };

    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Header />
      
      <div className="container">
        {/* Health Status Banner */}
        {health && (
          <div style={{
            background: health.status === 'healthy' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${health.status === 'healthy' ? '#4CAF50' : '#F44336'}`,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            color: health.status === 'healthy' ? '#4CAF50' : '#F44336',
            textAlign: 'center'
          }}>
            <strong>Service Status:</strong> {health.status === 'healthy' ? '✅ All Systems Operational' : '⚠️ Service Issues'}
            {health.error && <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{health.error}</div>}
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          <UrlShortener />
          <UrlStats />
          <UrlRedirect />
        </div>

        {/* Architecture Info */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>System Architecture</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div className="stat-item">
              <div className="stat-value">5</div>
              <div className="stat-label">Microservices</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">gRPC</div>
              <div className="stat-label">Communication</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">HA</div>
              <div className="stat-label">High Availability</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">Docker</div>
              <div className="stat-label">Containers</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;