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
    </footer>
  );
};
