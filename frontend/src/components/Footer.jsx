import React from 'react';
import { FaGithub, FaDocker, FaServer, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
          <strong style={{ color: '#f1f5f9' }}>Distributed URL Shortener</strong> • Built with Microservices
        </p>
        
        <div className="footer-icons">
          <a href="#" title="Microservices Architecture" style={{ color: 'inherit' }}>
            <FaServer />
          </a>
          <a href="#" title="Docker Containers" style={{ color: 'inherit' }}>
            <FaDocker />
          </a>
          <a href="https://www.github.com/syedalijabir/url-shortner-design" title="GitHub Repository" style={{ color: 'inherit' }}>
            <FaGithub />
          </a>
        </div>
        
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Made with <FaHeart style={{ color: '#ef4444', margin: '0 4px' }} /> • © {currentYear} • <span style={{ color: '#10b981' }}>●</span> System Operational
        </p>
      </div>
    </footer>
  );
};

export default Footer;