import React from 'react';
import './Breadcrumb.css';

export default function Breadcrumb({ items, className = '' }) {
  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="breadcrumb-item typography-label-sm">
              {isLast ? (
                <span className="breadcrumb-current">{item.label}</span>
              ) : (
                <a href={item.href} className="breadcrumb-link">{item.label}</a>
              )}
              {!isLast && <span className="breadcrumb-separator">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
