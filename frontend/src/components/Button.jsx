import React from 'react';
import './Button.css';

const Button = ({text, onClick, disabled=false, icon=null}) => {
  return (
    <button className="btn" onClick={onClick} disabled={disabled}>
      {icon && <span className="btn-icon">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
