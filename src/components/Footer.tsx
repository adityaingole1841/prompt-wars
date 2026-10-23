import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <p className="footer-disclaimer-bold">
        Emergency Helper India — Citizen Safety Guidance Prototype
      </p>
      <p>
        <strong>Legal & Medical Disclaimer:</strong> This application is an educational prototype and
        assistive safety guidance tool. It is not an authorized emergency dispatch system, medical
        diagnostic tool, or law enforcement authority. In any real-world emergency, always contact
        official emergency responders directly by dialing <strong>112</strong>.
      </p>
      <p style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
        <Shield size={14} />
        <span>Privacy: Zero-data-retention prototype. Photos and locations are never sold or stored on external servers.</span>
      </p>
      <p style={{ marginTop: '0.65rem', fontSize: '0.8rem', color: '#94a3b8' }}>
        Built with pride for Indian citizens by{' '}
        <a
          href="https://github.com/adityaingole1841"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}
        >
          Aditya Ingole (@adityaingole1841)
        </a>
      </p>
    </footer>
  );
};
