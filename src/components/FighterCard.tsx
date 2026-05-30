import React from 'react';
import type { Character, CombatZone } from '../types';
import { ProgressBar } from './ui/ProgressBar';
import { ShieldAlert, Crosshair } from 'lucide-react';
import { CustomAvatar } from './CustomAvatar';

interface FighterCardProps {
  fighter: Character;
  isPlayer: boolean;
  choices?: {
    attack: CombatZone | null;
    defense: CombatZone | null;
  };
  onSelectChoice?: (type: 'attack' | 'defense', zone: CombatZone) => void;
}

const getAvatarSettings = (fighter: Character) => {
  if (fighter.avatarSettings) return fighter.avatarSettings;
  
  switch (fighter.classType) {
    case 'barbarian':
      return {
        gender: 'male' as const,
        hairColor: '#ef4444',
        skinColor: '#ffedd5',
        outfitColor: '#111827',
        faceStyle: 0,
      };
    case 'mage':
      return {
        gender: 'female' as const,
        hairColor: '#8b5cf6',
        skinColor: '#ffedd5',
        outfitColor: '#1e40af',
        faceStyle: 2,
      };
    case 'archer':
      return {
        gender: 'female' as const,
        hairColor: '#ffd54f',
        skinColor: '#bbf7d0',
        outfitColor: '#166534',
        faceStyle: 1,
      };
    default:
      return {
        gender: 'male' as const,
        hairColor: '#cbd5e1',
        skinColor: '#ffedd5',
        outfitColor: '#e5c158',
        faceStyle: 0,
      };
  }
};

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

  const avatarSettings = getAvatarSettings(fighter);

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
        <div className={`p-1 bg-obsidian-900 rounded-full border shadow-md ${getFighterTheme(fighter.classType)}`}>
          <CustomAvatar
            gender={avatarSettings.gender}
            hairColor={avatarSettings.hairColor}
            skinColor={avatarSettings.skinColor}
            outfitColor={avatarSettings.outfitColor}
            faceStyle={avatarSettings.faceStyle}
            className="w-24 h-24"
          />
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
