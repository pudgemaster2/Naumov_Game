import React from 'react';
import type { Character, Equipment, Item } from '../types';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import { ProgressBar } from './ui/ProgressBar';
import { getPortrait } from '../utils/portraitHelper';
import { getItemImage } from '../utils/itemHelper';

import dungeonMonsterRat from '../assets/dungeon/dungeon_monster_rat.png';
import dungeonMonsterSkeleton from '../assets/dungeon/dungeon_monster_skeleton.png';
import dungeonMonsterBoss from '../assets/dungeon/dungeon_monster_boss.png';

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

  const getFighterPortrait = () => {
    if (fighter.sprite === 'rat') return dungeonMonsterRat;
    if (fighter.sprite === 'skeleton') return dungeonMonsterSkeleton;
    if (fighter.sprite === 'boss') return dungeonMonsterBoss;
    return getPortrait(fighter.race, fighter.classType);
  };

  const renderItemIcon = (icon: string) => {
    if (icon.includes('/') || icon.includes('.') || icon.startsWith('data:')) {
      return <img src={icon} alt="item" className="w-11 h-11 object-contain transition-transform duration-200 group-hover:scale-105" />;
    }
    return <span className="text-3xl leading-none transition-transform duration-200 group-hover:scale-105">{icon}</span>;
  };

  const getSlotBackgroundIcon = (slotKey: string) => {
    if (slotKey === 'ring1' || slotKey === 'ring2') {
      return getItemImage('ring');
    }
    return getItemImage(slotKey);
  };

  const ItemHtmlTooltip: React.FC<{ item: Item }> = ({ item }) => {
    const stats = Object.entries(item.stats);
    
    const getItemTypeName = (type: string) => {
      switch (type) {
        case 'helmet': return 'Шлем';
        case 'armor': return 'Нагрудник';
        case 'gloves': return 'Перчатки';
        case 'boots': return 'Сапоги';
        case 'weapon': return 'Оружие';
        case 'shield': return 'Вторая рука';
        case 'spellbook': return 'Боевой пояс';
        case 'ring': return 'Кольцо';
        case 'potion_hp': return 'Зелье здоровья';
        case 'potion_mp': return 'Зелье маны';
        case 'scroll_atk': return 'Свиток Ярости';
        case 'scroll_def': return 'Свиток Каменной Кожи';
        case 'scroll_dodge': return 'Свиток Ветра';
        case 'scroll_crit': return 'Свиток Гнева';
        default: return 'Предмет';
      }
    };

    return (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-60 p-3.5 bg-obsidian-950/95 border border-gold-600/40 rounded-xl text-center shadow-2xl pointer-events-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 font-sans backdrop-blur-sm">
        <div className="text-sm font-bold text-gold-300 font-gothic tracking-wide border-b border-obsidian-800 pb-1.5">{item.name}</div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1.5 px-0.5">
          <span>{getItemTypeName(item.type)}</span>
          <span className="text-amber-500 font-bold">Уровень: 1</span>
        </div>
        {item.description && (
          <div className="text-[10px] text-slate-350 italic mt-1.5 text-left border-t border-obsidian-900/60 pt-1.5 leading-relaxed">
            {item.description}
          </div>
        )}
        {stats.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-obsidian-900/60 flex flex-col gap-1 text-[11px] font-mono font-bold text-left px-0.5">
            {stats.map(([key, val]) => {
              let colorClass = 'text-slate-300';
              let label = key;
              if (key === 'strength') { colorClass = 'text-rose-400'; label = 'Сила'; }
              if (key === 'agility') { colorClass = 'text-emerald-400'; label = 'Ловкость'; }
              if (key === 'endurance') { colorClass = 'text-red-400'; label = 'Выносливость'; }
              if (key === 'intellect') { colorClass = 'text-sky-400'; label = 'Интеллект'; }
              return (
                <div key={key} className={`${colorClass} flex justify-between`}>
                  <span>{label}:</span>
                  <span>+{val}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderSlot = (slotKey: keyof Equipment, label: string, slotTitle: string) => {
    const equippedItem = fighter.equipment?.[slotKey];
    
    return (
      <div 
        className={`w-18 h-18 border rounded-xl flex flex-col items-center justify-center relative group select-none transition-all duration-200 ${
          equippedItem
            ? 'border-gold-600/50 bg-gold-500/10 hover:border-gold-400 hover:bg-gold-500/20 shadow-[0_0_12px_rgba(197,160,40,0.2)]'
            : 'border-obsidian-800 bg-obsidian-950/40 hover:border-obsidian-700 hover:bg-obsidian-900/20'
        }`}
        title={equippedItem ? undefined : `Ячейка: ${slotTitle}`}
      >
        {equippedItem ? (
          <>
            <div className="p-0.5">{renderItemIcon(equippedItem.icon)}</div>
            <span className="text-[8px] text-slate-400 font-mono mt-0.5 text-center truncate w-full px-1 relative z-10">{equippedItem.name}</span>
            <ItemHtmlTooltip item={equippedItem} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-25 select-none pointer-events-none w-full h-full p-1 text-center">
            {getSlotBackgroundIcon(slotKey).includes('/') ? (
              <img src={getSlotBackgroundIcon(slotKey)} alt={label} className="w-8 h-8 object-contain grayscale" />
            ) : (
              <span className="text-2xl leading-none">{getSlotBackgroundIcon(slotKey)}</span>
            )}
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider mt-1 text-slate-500">
              {label}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`gothic-panel p-6 relative transition-all duration-300 ${getPanelClass(fighter.classType)}`}>
      
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

      {/* Symmetrical Layout for Equipment and Avatar */}
      <div className="flex flex-col items-center gap-3 mb-6 relative z-10">
        <div className="flex flex-row items-center justify-center gap-2.5">
          
          {/* Left Column: 4 Slots */}
          <div className="flex flex-col gap-2">
            {renderSlot('helmet', 'Шлем', 'Шлем')}
            {renderSlot('armor', 'Доспех', 'Нагрудник')}
            {renderSlot('belt', 'Поножи', 'Поножи')}
            {renderSlot(
              'weapon',
              fighter.classType === 'mage' ? 'Посох' : fighter.classType === 'archer' ? 'Лук' : 'Меч',
              fighter.classType === 'mage' ? 'Посох' : fighter.classType === 'archer' ? 'Лук' : 'Меч'
            )}
          </div>

          {/* Center Portrait */}
          <div className="flex justify-center items-center bg-obsidian-950/60 p-3 rounded-xl border border-obsidian-800/50 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]">
            <div className={`p-1 bg-obsidian-900 border shadow-md w-56 h-80 overflow-hidden rounded-lg ${getFighterTheme(fighter.classType)}`}>
              <img 
                src={getFighterPortrait()} 
                alt={fighter.sprite ? `${fighter.sprite} monster` : `${fighter.race} ${fighter.classType}`} 
                className="w-full h-full object-cover rounded" 
              />
            </div>
          </div>

          {/* Right Column: 4 Slots */}
          <div className="flex flex-col gap-2">
            {renderSlot(
              'shield',
              fighter.classType === 'mage' ? 'Книга' : fighter.classType === 'archer' ? 'Колчан' : 'Щит',
              fighter.classType === 'mage' ? 'Книга заклинаний' : fighter.classType === 'archer' ? 'Колчан стрел' : 'Щит'
            )}
            {renderSlot('gloves', 'Руки', 'Перчатки')}
            {renderSlot('boots', 'Ноги', 'Сапоги')}
            {renderSlot('spellbook', 'Пояс', 'Боевой пояс')}
          </div>

        </div>

        {/* Rings Row below */}
        <div className="flex gap-2">
          {renderSlot('ring1', 'Кольцо', 'Кольцо 1')}
          {renderSlot('ring2', 'Кольцо', 'Кольцо 2')}
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
