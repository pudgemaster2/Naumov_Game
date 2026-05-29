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

  const barColors = {
    green: 'bg-gradient-to-r from-emerald-700 to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] border-r border-emerald-400',
    red: 'bg-gradient-to-r from-rose-800 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] border-r border-rose-400',
    blue: 'bg-gradient-to-r from-blue-700 to-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-r border-blue-400',
    gold: 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] border-r border-amber-300',
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
          <span>{label}</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className="h-5 w-full bg-obsidian-950 border border-obsidian-700 rounded overflow-hidden p-[2px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        <div
          className={`h-full rounded-sm transition-all duration-300 ease-out ${barColors[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
