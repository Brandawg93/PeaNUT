import React from 'react';
import './kpi.css';

export default function Kpi(props: any) {
  const { text, description } = props;
  return (
    <div className="kpi-container">
      <div className="kpi-text">{text}</div>
      <div className="kpi-description">{description}</div>
    </div>
  );
}
