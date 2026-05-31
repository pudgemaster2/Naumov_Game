import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'red' | 'green' | 'blue' | 'gold';
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  color = 'green',
  label,
  className = '',
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const getBarStyles = (c: 'red' | 'green' | 'blue' | 'gold') => {
    switch (c) {
      case 'green':
        return {
          background: 'linear-gradient(to right, #047857, #10b981)',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
          borderRight: '1px solid #34d399',
        };
      case 'red':
        return {
          background: 'linear-gradient(to right, #9f1239, #f43f5e)',
          boxShadow: '0 0 10px rgba(244, 63, 94, 0.5)',
          borderRight: '1px solid #fb7185',
        };
      case 'blue':
        return {
          background: 'linear-gradient(to right, #1d4ed8, #3b82f6)',
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
          borderRight: '1px solid #60a5fa',
        };
      case 'gold':
        return {
          background: 'linear-gradient(to right, #d97706, #f59e0b)',
          boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)',
          borderRight: '1px solid #fcd34d',
        };
      default:
        return {};
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-sm font-bold font-mono mb-1.5 text-slate-350">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className="h-7 w-full bg-obsidian-950 border border-obsidian-700 rounded overflow-hidden p-[2.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        <div
          className="h-full rounded-sm transition-all duration-300 ease-out"
          style={{ 
            width: `${percentage}%`,
            ...getBarStyles(color)
          }}
        />
      </div>
    </div>
  );
};
