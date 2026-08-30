import React from 'react';
import './MaterialCard.css';

export default function MaterialCard({ title, imageSrc, children, className = '' }) {
  return (
    <div className={`material-card ${className}`}>
      {imageSrc && (
        <div className="material-card-thumbnail">
          <img src={imageSrc} alt={title || 'Thumbnail'} />
        </div>
      )}
      <div className="material-card-content">
        {title && <h3 className="typography-card-title material-card-title">{title}</h3>}
        <div className="material-card-body">
          {children}
        </div>
      </div>
    </div>
  );
}
