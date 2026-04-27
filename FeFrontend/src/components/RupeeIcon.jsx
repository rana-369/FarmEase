import React from 'react';

export const RupeeIcon = ({ className, style, size = 24 }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
    style={style}
    width={size}
    height={size}
  >
    <path d="M6 3h12M6 8h12M6 8l6 8M6 13h6M6 13l6 8" />
  </svg>
);

export default RupeeIcon;
