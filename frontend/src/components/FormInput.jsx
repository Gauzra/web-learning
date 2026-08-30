import React from 'react';
import './FormInput.css';

export default function FormInput({ label, id, className = '', ...props }) {
  return (
    <div className={`form-input-container ${className}`}>
      {label && <label htmlFor={id} className="typography-label-sm form-input-label">{label}</label>}
      <input id={id} className="form-input" {...props} />
    </div>
  );
}
