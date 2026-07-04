import React from 'react';

interface StatProps {
  label: string;
  value: string | number;
  color: string;
}

export const Stat: React.FC<StatProps> = ({ label, value, color }) => (
  <div>
    <div
      style={{
        color: '#64748b',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
    <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div>
  </div>
);
