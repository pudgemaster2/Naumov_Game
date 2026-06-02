import React, { useState } from 'react';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import type { CharacterRace, CharacterClass } from '../types';
import { Button } from '../components/ui/Button';
import { StatTable } from '../components/StatTable';

// Import all 12 combination portraits
import newElfWarrior from '../assets/new_races/new_elf_warrior.jpg';
import newElfArcher from '../assets/new_races/new_elf_archer.jpg';
import newElfMage from '../assets/new_races/new_elf_mage.jpg';

import newGnomeWarrior from '../assets/new_races/new_gnome_warrior.jpg';
import newGnomeArcher from '../assets/new_races/new_gnome_archer.jpg';
import newGnomeMage from '../assets/new_races/new_gnome_mage.jpg';

import newHumanWarrior from '../assets/new_races/new_human_warrior.jpg';
import newHumanArcher from '../assets/new_races/new_human_archer.jpg';
import newHumanMage from '../assets/new_races/new_human_mage.jpg';

import newOrcWarrior from '../assets/new_races/new_orc_warrior.jpg';
import newOrcArcher from '../assets/new_races/new_orc_archer.jpg';
import newOrcMage from '../assets/new_races/new_orc_mage.jpg';

interface CharSelectScreenProps {
  onSelectClass: (race: CharacterRace, classType: CharacterClass, name: string) => void;
}

export const CharSelectScreen: React.FC<CharSelectScreenProps> = ({ onSelectClass }) => {
  const [selectedRace, setSelectedRace] = useState<CharacterRace>('human');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [charName, setCharName] = useState('');

  const racesList: { key: CharacterRace; title: string; color: string }[] = [
    { 
      key: 'human', 
      title: 'Человек', 
      color: 'border-slate-400 bg-slate-50 shadow-[0_0_12px_rgba(148,163,184,0.1)]', 
    },
    { 
      key: 'elf', 
      title: 'Эльф', 
      color: 'border-emerald-400 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.1)]', 
    },
    { 
      key: 'gnome', 
      title: 'Гном', 
      color: 'border-amber-400 bg-amber-50 shadow-[0_0_12px_rgba(245,158,11,0.1)]', 
    },
    { 
      key: 'orc', 
      title: 'Орк', 
      color: 'border-rose-400 bg-rose-50 shadow-[0_0_12px_rgba(244,63,94,0.1)]', 
    },
  ];

  const classesList: { key: CharacterClass; title: string; color: string; icon: string }[] = [
    { 
      key: 'warrior', 
      title: 'Воин', 
      color: 'border-rose-400 bg-rose-50 shadow-[0_0_12px_rgba(244,63,94,0.1)]', 
      icon: '⚔️'
    },
    { 
      key: 'archer', 
      title: 'Лучник', 
      color: 'border-emerald-400 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.1)]', 
      icon: '🏹'
    },
    { 
      key: 'mage', 
      title: 'Маг', 
      color: 'border-sky-400 bg-sky-50 shadow-[0_0_12px_rgba(56,189,248,0.1)]', 
      icon: '🧙'
    },
  ];

  const getPortrait = (race: CharacterRace, classType: CharacterClass) => {
    switch (race) {
      case 'elf':
        if (classType === 'warrior') return newElfWarrior;
        if (classType === 'archer') return newElfArcher;
        return newElfMage;
      case 'gnome':
        if (classType === 'warrior') return newGnomeWarrior;
        if (classType === 'archer') return newGnomeArcher;
        return newGnomeMage;
      case 'human':
        if (classType === 'warrior') return newHumanWarrior;
        if (classType === 'archer') return newHumanArcher;
        return newHumanMage;
      case 'orc':
        if (classType === 'warrior') return newOrcWarrior;
        if (classType === 'archer') return newOrcArcher;
        return newOrcMage;
      default:
        return newHumanWarrior;
    }
  };

  const handleConfirm = () => {
    const trimmed = charName.trim();
    if (trimmed.length < 2 || trimmed.length > 14) {
      return;
    }
    onSelectClass(selectedRace, selectedClass, trimmed);
  };

  const raceStats = RACE_TEMPLATES[selectedRace].baseStats;
  const classModifiers = CLASS_TEMPLATES[selectedClass].statModifiers;

  const combinedStats = {
    strength: raceStats.strength + classModifiers.strength,
    agility: raceStats.agility + classModifiers.agility,
    endurance: raceStats.endurance + classModifiers.endurance,
    intellect: raceStats.intellect + classModifiers.intellect,
  };

  const isNameValid = charName.trim().length >= 2 && charName.trim().length <= 14;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 animate-fade-in select-none">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold font-gothic tracking-widest text-gold-400">СОЗДАНИЕ ПЕРСОНАЖА</h2>
        <p className="text-sm font-mono text-slate-350 mt-3">
          Настройте имя героя, его расу и боевой класс перед путешествием.
        </p>
      </div>

      {/* 1. Race Selection Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold font-gothic tracking-widest text-gold-400 mb-4 text-center uppercase">1. Выберите Расу</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {racesList.map((item) => {
            const template = RACE_TEMPLATES[item.key];
            const isSelected = selectedRace === item.key;
            
            return (
              <div
                key={item.key}
                onClick={() => setSelectedRace(item.key)}
                className={`gothic-panel p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 ${
                  isSelected 
                    ? `${item.color} border-2 ring-1 ring-gold-500` 
                    : 'border-slate-300 bg-slate-100/90 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold font-gothic tracking-wider text-slate-900 group-hover:text-amber-700 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 font-sans leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Class Selection Grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold font-gothic tracking-widest text-gold-400 mb-4 text-center uppercase">2. Выберите Класс</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classesList.map((item) => {
            const template = CLASS_TEMPLATES[item.key];
            const isSelected = selectedClass === item.key;
            
            return (
              <div
                key={item.key}
                onClick={() => setSelectedClass(item.key)}
                className={`gothic-panel p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 ${
                  isSelected 
                    ? `${item.color} border-2 ring-1 ring-gold-500` 
                    : 'border-slate-300 bg-slate-100/90 opacity-75 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-xl p-1.5 bg-slate-200 border border-slate-300 rounded select-none">
                      {item.icon}
                    </div>
                    <h3 className="text-base font-bold font-gothic tracking-wider text-slate-900 group-hover:text-amber-700 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-700 font-sans leading-relaxed">
                    {template.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel of the selected combination */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-gold-700/30 p-8 rounded bg-obsidian-900/40">
        
        {/* Selection Portrait Preview */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="border border-gold-900/30 rounded-lg p-2 bg-obsidian-950 shadow-lg">
            <img 
              src={getPortrait(selectedRace, selectedClass)} 
              alt={`${selectedRace} ${selectedClass}`} 
              className="w-48 h-64 object-cover rounded border border-obsidian-800" 
            />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5">
          <h3 className="text-2xl font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-3 uppercase tracking-wide">
            {RACE_TEMPLATES[selectedRace].title} • {CLASS_TEMPLATES[selectedClass].title}
          </h3>
          
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            {selectedClass === 'warrior' && (
              <>
                <p>🛡️ <strong className="text-rose-400">Сокрушительная сила и мощь</strong>. Воины превосходно сражаются в ближнем бою. Их физический урон масштабируется от характеристики <strong className="text-rose-400">Сила</strong>, а выносливость дает максимальный запас HP.</p>
                <p>⚔️ Физические атаки наносят гарантированно высокий урон по соперникам.</p>
              </>
            )}
            {selectedClass === 'archer' && (
              <>
                <p>🏹 <strong className="text-emerald-400">Невероятная ловкость и криты</strong>. Лучники уклоняются от большинства лобовых атак соперников и славятся смертоносными критическими попаданиями.</p>
                <p>🎯 Шанс уворота и критического удара рассчитывается на основе вашей характеристики <strong className="text-emerald-400">Ловкость</strong>.</p>
              </>
            )}
            {selectedClass === 'mage' && (
              <>
                <p>⚡ <strong className="text-sky-400">Магические заклинания</strong>. Маг наносит колоссальный урон стихийными сферами, расходуя 15 единиц маны (MP) за каждый каст. Без маны наносит очень слабый урон посохом.</p>
                <p>🔮 Урон заклинаний увеличивается на основе вашей характеристики <strong className="text-sky-400">Интеллект</strong>. В бою вы сможете пить зелья маны для поддержания сил.</p>
              </>
            )}
          </div>
        </div>

        {/* Detailed stats table for chosen combination */}
        <div className="lg:col-span-4">
          <StatTable stats={combinedStats} classType={selectedClass} />
        </div>
      </div>

      {/* Name Input Section */}
      <div className="flex flex-col items-center justify-center max-w-md mx-auto mt-8 space-y-2">
        <label className="text-sm font-mono text-slate-400 font-bold uppercase tracking-widest">
          Введите имя персонажа:
        </label>
        <input
          type="text"
          placeholder="Имя героя..."
          value={charName}
          onChange={(e) => setCharName(e.target.value)}
          className="w-full gothic-input px-4 py-3 rounded text-center text-base font-bold tracking-wide focus:ring-2 focus:ring-gold-500 bg-obsidian-950/80 border-gold-900/30"
          maxLength={14}
        />
        {charName.trim() && charName.trim().length < 2 && (
          <span className="text-xs text-rose-455 font-mono animate-pulse">
            * Имя должно содержать от 2 до 14 символов
          </span>
        )}
      </div>

      {/* Action panel */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleConfirm} 
          disabled={!isNameValid}
          size="lg" 
          className="w-full max-w-md"
        >
          Появиться в Средиземье Наумова
        </Button>
      </div>
    </div>
  );
};
