import React from 'react';
import { FaLink, FaBolt, FaServer } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaLink size={28} style={{ color: 'white' }} />
          </div>
          <h1>Distributed URL Shortener</h1>
        </div>
        
        <p style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6',
          marginBottom: '1.5rem'
        }}>
          High-performance URL shortening with microservices architecture
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaBolt color="#60a5fa" />
            <span style={{ color: '#cbd5e1' }}>Fast & Scalable</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaServer color="#8b5cf6" />
            <span style={{ color: '#cbd5e1' }}>Distributed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="health-indicator health-good" />
            <span style={{ color: '#cbd5e1' }}>High Availability</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;