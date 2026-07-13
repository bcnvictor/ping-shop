import React from 'react';
import './Logo.css';

interface LogoProps {
  src: string;
  alt?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = () => {
  return (
    <div className="logo-container flex-center">
      <img
            src="https://s3.cri.epita.fr/acu-scrooge/scrooge/img/scrooge.png" 
            alt="Logo" 
            className="logo"
            style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '50%' }}
          />
    </div>
  );
};