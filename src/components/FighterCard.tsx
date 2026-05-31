import React from 'react';
import type { Character } from '../types';
import { ProgressBar } from './ui/ProgressBar';
import { ShieldAlert, Crosshair } from 'lucide-react';

import elfImg from '../assets/ELF.jpg';
import gnomeImg from '../assets/GNOME.jpg';
import mageImg from '../assets/MAGE.jpg';
import orcImg from '../assets/ORC.jpg';

interface FighterCardProps {
  fighter: Character;
  isPlayer: boolean;
}

export const FighterCard: React.FC<FighterCardProps> = ({
  fighter,
  isPlayer,
}) => {
  const getClassNameRussian = (classType: string) => {
    switch (classType) {
      case 'elf': return 'Эльф';
      case 'mage': return 'Маг';
      case 'orc': return 'Орк';
      case 'gnome': return 'Гном';
      default: return 'Боец';
    }
  };

  const getFighterTheme = (classType: string) => {
    switch (classType) {
      case 'orc': return 'border-rose-800/50 text-rose-500';
      case 'mage': return 'border-sky-800/50 text-sky-500';
      case 'elf': return 'border-emerald-800/50 text-emerald-500';
      case 'gnome': return 'border-amber-800/50 text-amber-500';
      default: return 'border-gold-800/50 text-gold-500';
    }
  };

  const getPortrait = (cType: string) => {
    switch (cType) {
      case 'elf': return elfImg;
      case 'gnome': return gnomeImg;
      case 'mage': return mageImg;
      case 'orc': return orcImg;
      default: return elfImg;
    }
  };

  const currentMp = fighter.currentMana === undefined ? fighter.stats.intellect * 10 : fighter.currentMana;
  const maxMp = fighter.maxMana === undefined ? fighter.stats.intellect * 10 : fighter.maxMana;

  return (
    <div className={`gothic-panel p-6 relative overflow-hidden transition-all duration-300 ${isPlayer ? 'hover:border-gold-500/50' : 'hover:border-rose-500/50'}`}>
      
      {/* Dynamic Background Design Grid */}
      <div className="absolute inset-0 pixel-grid opacity-[0.03] pointer-events-none" />

      {/* Fighter Stats Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-3xl font-bold font-gothic text-slate-100 flex items-center gap-3">
            {fighter.name}
            <span className="text-sm px-3 py-1 rounded-full bg-obsidian-950 border border-obsidian-700 text-gold-400 font-mono">
              Lvl {fighter.level}
            </span>
          </h3>
          <p className="text-base text-slate-400 font-mono tracking-wider mt-1">
            {getClassNameRussian(fighter.classType)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-mono text-slate-400">Победы: {fighter.wins}</span>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex justify-center items-center py-6 bg-obsidian-950/60 rounded border border-obsidian-800/50 mb-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] relative">
        <div className={`p-1 bg-obsidian-900 border shadow-md w-40 h-52 overflow-hidden rounded ${getFighterTheme(fighter.classType)}`}>
          <img 
            src={getPortrait(fighter.classType)} 
            alt={fighter.classType} 
            className="w-full h-full object-cover rounded" 
          />
        </div>
      </div>

      {/* HP Progress Bar */}
      <ProgressBar 
        value={fighter.currentHp} 
        max={fighter.maxHp} 
        color={isPlayer ? 'green' : 'red'} 
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

      {/* Bot Static Card/Status */}
      {!isPlayer && (
        <div className="p-4 rounded border border-obsidian-800 bg-obsidian-950/40 text-center space-y-2 select-none">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-gothic">Намерения противника скрыты</p>
          <div className="flex justify-center gap-4 text-slate-600">
            <div className="flex items-center gap-1">
              <Crosshair className="w-4 h-4" />
              <span className="text-sm font-bold font-mono">?</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-sm font-bold font-mono">?</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
