import React from 'react';
import type { Character, CombatZone } from '../types';
import { ProgressBar } from './ui/ProgressBar';
import { ShieldAlert, Crosshair, HelpCircle } from 'lucide-react';

interface FighterCardProps {
  fighter: Character;
  isPlayer: boolean;
  choices?: {
    attack: CombatZone | null;
    defense: CombatZone | null;
  };
  onSelectChoice?: (type: 'attack' | 'defense', zone: CombatZone) => void;
}

export const FighterCard: React.FC<FighterCardProps> = ({
  fighter,
  isPlayer,
  choices,
  onSelectChoice,
}) => {
  const zones: { key: CombatZone; label: string }[] = [
    { key: 'head', label: 'Голова' },
    { key: 'chest', label: 'Грудь' },
    { key: 'stomach', label: 'Живот' },
    { key: 'legs', label: 'Ноги' },
  ];

  // Render a custom SVG avatar representing the class
  const renderAvatar = (classType: string) => {
    switch (classType) {
      case 'barbarian':
        return (
          <svg className="w-24 h-24 text-rose-500" viewBox="0 0 100 100" fill="currentColor">
            {/* Styled Helmet/Warrior icon */}
            <path d="M50,10 L80,30 L80,60 L50,90 L20,60 L20,30 Z" fill="#1e1e24" stroke="currentColor" strokeWidth="3" />
            <path d="M50,15 L70,30 L65,55 L50,45 L35,55 L30,30 Z" fill="currentColor" opacity="0.8" />
            <rect x="40" y="60" width="20" height="15" fill="currentColor" />
            {/* Horns */}
            <path d="M20,30 Q10,15 15,5 Q25,10 25,25 Z" fill="#991b1b" />
            <path d="M80,30 Q90,15 85,5 Q75,10 75,25 Z" fill="#991b1b" />
          </svg>
        );
      case 'mage':
        return (
          <svg className="w-24 h-24 text-sky-500" viewBox="0 0 100 100" fill="currentColor">
            {/* Styled Wizard Hat / Hood */}
            <path d="M50,5 L85,60 L75,70 L50,60 L25,70 L15,60 Z" fill="#1e1e24" stroke="currentColor" strokeWidth="3" />
            <path d="M50,15 L70,50 L50,40 L30,50 Z" fill="currentColor" opacity="0.8" />
            {/* Glowing magic orb in hood */}
            <circle cx="50" cy="50" r="10" fill="#38bdf8" className="animate-pulse" />
            {/* Collar/Cape */}
            <path d="M25,70 L50,85 L75,70 L50,95 Z" fill="currentColor" opacity="0.5" />
          </svg>
        );
      case 'archer':
        return (
          <svg className="w-24 h-24 text-emerald-500" viewBox="0 0 100 100" fill="currentColor">
            {/* Styled Elf Archer / Hood and Bow */}
            <path d="M50,10 C65,10 75,25 75,50 C75,70 50,90 50,90 C50,90 25,70 25,50 C25,25 35,10 50,10 Z" fill="#1e1e24" stroke="currentColor" strokeWidth="3" />
            <path d="M50,20 C58,20 65,30 65,50 C65,65 50,80 50,80 C50,80 35,65 35,50 C35,30 42,20 50,20 Z" fill="currentColor" opacity="0.75" />
            {/* Pointy ears extending */}
            <path d="M25,40 L10,30 L22,48 Z" fill="currentColor" />
            <path d="M75,40 L90,30 L78,48 Z" fill="currentColor" />
          </svg>
        );
      default:
        return <HelpCircle className="w-20 h-20 text-slate-500" />;
    }
  };

  const getClassNameRussian = (classType: string) => {
    switch (classType) {
      case 'barbarian': return 'Силач';
      case 'mage': return 'Маг';
      case 'archer': return 'Эльф-лучник';
      default: return 'Боец';
    }
  };

  const getFighterTheme = (classType: string) => {
    switch (classType) {
      case 'barbarian': return 'border-rose-800/40 text-rose-500';
      case 'mage': return 'border-sky-800/40 text-sky-500';
      case 'archer': return 'border-emerald-800/40 text-emerald-500';
      default: return 'border-gold-800/40 text-gold-500';
    }
  };

  return (
    <div className={`gothic-panel p-5 relative overflow-hidden transition-all duration-300 ${isPlayer ? 'hover:border-gold-500/50' : 'hover:border-rose-500/50'}`}>
      
      {/* Dynamic Background Design Grid */}
      <div className="absolute inset-0 pixel-grid opacity-[0.03] pointer-events-none" />

      {/* Fighter Stats Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold font-gothic text-slate-100 flex items-center gap-2">
            {fighter.name}
            <span className="text-xs px-2 py-0.5 rounded-full bg-obsidian-950 border border-obsidian-700 text-gold-400 font-mono">
              Lvl {fighter.level}
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono tracking-wider">
            {getClassNameRussian(fighter.classType)}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-400">Победы: {fighter.wins}</span>
        </div>
      </div>

      {/* Avatar Container */}
      <div className="flex justify-center items-center py-4 bg-obsidian-950/60 rounded border border-obsidian-800/50 mb-4 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] relative">
        <div className={`p-2 rounded-full border bg-obsidian-900/80 shadow-md ${getFighterTheme(fighter.classType)}`}>
          {renderAvatar(fighter.classType)}
        </div>
      </div>

      {/* HP Progress Bar */}
      <ProgressBar 
        value={fighter.currentHp} 
        max={fighter.maxHp} 
        color={isPlayer ? 'green' : 'red'} 
        label="ЗДОРОВЬЕ (HP)"
        className="mb-6"
      />

      {/* Player Battle Choices Selection Panel */}
      {isPlayer && choices && onSelectChoice && (
        <div className="space-y-5 animate-fade-in">
          {/* Target Attack Zones */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Crosshair className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-rose-400 font-gothic">Куда бить (Атака)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {zones.map((zone) => (
                <button
                  key={`attack-${zone.key}`}
                  onClick={() => onSelectChoice('attack', zone.key)}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all duration-150 uppercase tracking-widest font-gothic ${
                    choices.attack === zone.key
                      ? 'bg-rose-950/40 text-rose-300 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      : 'bg-obsidian-950/80 text-slate-400 border-obsidian-800 hover:border-rose-900/60 hover:text-rose-400'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Defense Block Zones */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-sky-400 font-gothic">Что защищать (Блок)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {zones.map((zone) => (
                <button
                  key={`defense-${zone.key}`}
                  onClick={() => onSelectChoice('defense', zone.key)}
                  className={`py-2 px-3 text-xs font-semibold rounded border transition-all duration-150 uppercase tracking-widest font-gothic ${
                    choices.defense === zone.key
                      ? 'bg-sky-950/40 text-sky-300 border-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                      : 'bg-obsidian-950/80 text-slate-400 border-obsidian-800 hover:border-sky-900/60 hover:text-sky-400'
                  }`}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
