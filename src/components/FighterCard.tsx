import React from 'react';
import type { Character } from '../types';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import { ProgressBar } from './ui/ProgressBar';
import { getPortrait } from '../utils/portraitHelper';

interface FighterCardProps {
  fighter: Character;
}

export const FighterCard: React.FC<FighterCardProps> = ({
  fighter,
}) => {
  const getFighterTheme = (classType: string) => {
    switch (classType) {
      case 'warrior': return 'border-rose-800/50 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]';
      case 'archer': return 'border-emerald-800/50 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
      case 'mage': return 'border-sky-800/50 text-sky-500 shadow-[0_0_12px_rgba(56,189,248,0.15)]';
      default: return 'border-gold-800/50 text-gold-500';
    }
  };

  const getPanelClass = (classType: string) => {
    switch (classType) {
      case 'warrior': return 'border-rose-950/70 hover:border-rose-500/40 bg-rose-950/5 shadow-[0_0_15px_rgba(244,63,94,0.05)] hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]';
      case 'archer': return 'border-emerald-950/70 hover:border-emerald-500/40 bg-emerald-950/5 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]';
      case 'mage': return 'border-sky-950/70 hover:border-sky-500/40 bg-sky-950/5 shadow-[0_0_15px_rgba(56,189,248,0.05)] hover:shadow-[0_0_20px_rgba(56,189,248,0.12)]';
      default: return 'border-obsidian-850 hover:border-gold-500/30';
    }
  };

  const currentMp = fighter.currentMana === undefined ? fighter.stats.intellect * 10 : fighter.currentMana;
  const maxMp = fighter.maxMana === undefined ? fighter.stats.intellect * 10 : fighter.maxMana;

  return (
    <div className={`gothic-panel p-6 relative overflow-hidden transition-all duration-300 ${getPanelClass(fighter.classType)}`}>
      
      {/* Dynamic Background Design Grid */}
      <div className="absolute inset-0 pixel-grid opacity-[0.03] pointer-events-none" />

      {/* Fighter Stats Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-3xl font-black font-gothic text-slate-950 flex items-center gap-3">
            {fighter.name}
            <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-gold-300 font-mono">
              Lvl {fighter.level}
            </span>
          </h3>
          <p className="text-xs font-bold font-gothic tracking-widest text-slate-700 uppercase mt-1">
            {RACE_TEMPLATES[fighter.race]?.title || fighter.race} • {CLASS_TEMPLATES[fighter.classType]?.title || fighter.classType}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-700 font-bold">Победы: {fighter.wins}</span>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex justify-center items-center py-6 bg-obsidian-950/60 rounded border border-obsidian-800/50 mb-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] relative">
        <div className={`p-1 bg-obsidian-900 border shadow-md w-40 h-52 overflow-hidden rounded ${getFighterTheme(fighter.classType)}`}>
          <img 
            src={getPortrait(fighter.race, fighter.classType)} 
            alt={`${fighter.race} ${fighter.classType}`} 
            className="w-full h-full object-cover rounded" 
          />
        </div>
      </div>

      {/* HP Progress Bar */}
      <ProgressBar 
        value={fighter.currentHp} 
        max={fighter.maxHp} 
        color="red" 
        label="ЗДОРОВЬЕ (HP)"
        className="mb-3"
      />

      {/* MP Progress Bar */}
      <ProgressBar 
        value={currentMp} 
        max={maxMp} 
        color="blue" 
        label="МАНА (MP)"
        className="mb-4"
      />

      {/* Bot Static Card/Status removed */}
    </div>
  );
};
