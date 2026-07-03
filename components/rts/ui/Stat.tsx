import React from 'react';

export const Stat: React.FC<{
  label: string;
  value: string | number;
  color: string;
}> = ({ label, value, color }) => (
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
