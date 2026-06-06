import React, { useState } from 'react';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import type { CharacterRace, CharacterClass } from '../types';
import { Button } from '../components/ui/Button';
import { StatTable } from '../components/StatTable';
import { getPortrait } from '../utils/portraitHelper';

interface CharSelectScreenProps {
  onSelectClass: (
    race: CharacterRace,
    classType: CharacterClass,
    name: string,
    gender: 'male' | 'female'
  ) => void;
}

export const CharSelectScreen: React.FC<CharSelectScreenProps> = ({ onSelectClass }) => {
  const [selectedRace, setSelectedRace] = useState<CharacterRace>('human');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
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

  const handleConfirm = () => {
    const trimmed = charName.trim();
    if (trimmed.length < 2 || trimmed.length > 14) {
      return;
    }
    onSelectClass(selectedRace, selectedClass, trimmed, selectedGender);
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
    <div className="max-w-[1400px] mx-auto px-6 py-4 animate-fade-in select-none">
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold font-gothic tracking-widest text-amber-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)]">СОЗДАНИЕ ПЕРСОНАЖА</h2>
        <p className="text-sm font-mono text-slate-800 font-bold mt-1">
          Настройте имя героя, его расу и боевой класс перед путешествием.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Character Controls (Enlarged Fonts) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Race Selection Grid */}
          <div>
            <h3 className="text-lg font-bold font-gothic tracking-widest text-amber-950 mb-3.5 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">1. Выберите Расу</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {racesList.map((item) => {
                const template = RACE_TEMPLATES[item.key];
                const isSelected = selectedRace === item.key;
                
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedRace(item.key)}
                    className={`gothic-panel p-4 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 ${
                      isSelected 
                        ? `${item.color} border-2 ring-1 ring-gold-500 shadow-md` 
                        : 'border-slate-300 bg-slate-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-bold font-gothic tracking-wider text-slate-950 group-hover:text-amber-700 transition-colors">
                          {template.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Class Selection Grid */}
          <div>
            <h3 className="text-lg font-bold font-gothic tracking-widest text-amber-950 mb-3.5 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">2. Выберите Класс</h3>
            <div className="grid grid-cols-3 gap-3.5">
              {classesList.map((item) => {
                const template = CLASS_TEMPLATES[item.key];
                const isSelected = selectedClass === item.key;
                
                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedClass(item.key)}
                    className={`gothic-panel p-4 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 ${
                      isSelected 
                        ? `${item.color} border-2 ring-1 ring-gold-500 shadow-md` 
                        : 'border-slate-300 bg-slate-100 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="text-2xl p-1.5 bg-slate-200 border border-slate-300 rounded select-none">
                          {item.icon}
                        </div>
                        <h3 className="text-base font-bold font-gothic tracking-wider text-slate-950 group-hover:text-amber-700 transition-colors">
                          {template.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-800 font-sans leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Gender Selection */}
          <div>
            <h3 className="text-lg font-bold font-gothic tracking-widest text-amber-950 mb-3.5 uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">3. Выберите Пол</h3>
            <div className="flex justify-start gap-4 max-w-md">
              <div
                onClick={() => setSelectedGender('male')}
                className={`gothic-panel p-4 cursor-pointer flex-1 text-center font-bold font-gothic tracking-wider text-base transition-all duration-300 group hover:-translate-y-0.5 flex items-center justify-center gap-2 border rounded ${
                  selectedGender === 'male'
                    ? 'border-sky-400 bg-sky-50 shadow-[0_0_12px_rgba(56,189,248,0.25)] border-2 ring-1 ring-gold-500 text-sky-700'
                    : 'border-slate-300 bg-slate-100/90 text-slate-700 opacity-75 hover:opacity-100'
                }`}
              >
                <span className="text-2xl font-extrabold text-sky-500">♂</span> МУЖЧИНА
              </div>
              <div
                onClick={() => setSelectedGender('female')}
                className={`gothic-panel p-4 cursor-pointer flex-1 text-center font-bold font-gothic tracking-wider text-base transition-all duration-300 group hover:-translate-y-0.5 flex items-center justify-center gap-2 border rounded ${
                  selectedGender === 'female'
                    ? 'border-rose-400 bg-rose-50 shadow-[0_0_12px_rgba(244,63,94,0.25)] border-2 ring-1 ring-gold-500 text-rose-700'
                    : 'border-slate-300 bg-slate-100/90 text-slate-700 opacity-75 hover:opacity-100'
                }`}
              >
                <span className="text-2xl font-extrabold text-rose-500">♀</span> ДЕВУШКА
              </div>
            </div>
          </div>

          {/* Name Input & Action Button Section */}
          <div className="border-t border-gold-700/20 pt-6 space-y-4">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-mono text-amber-950 font-bold uppercase tracking-widest text-center drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                Введите имя персонажа:
              </label>
              <input
                type="text"
                placeholder="Имя героя..."
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                className="w-full max-w-md mx-auto gothic-input px-4 py-3 rounded text-center text-lg font-extrabold tracking-wide focus:ring-2 focus:ring-gold-500 bg-obsidian-950/90 border-gold-900/30 text-gold-200"
                maxLength={14}
              />
              {charName.trim() && charName.trim().length < 2 && (
                <span className="text-xs text-rose-700 font-mono font-bold animate-pulse text-center">
                  * Имя должно содержать от 2 до 14 символов
                </span>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleConfirm} 
                disabled={!isNameValid}
                size="lg" 
                className="w-full max-w-md py-4 text-lg font-bold uppercase tracking-wider"
              >
                Появиться в Средиземье Наумова
              </Button>
            </div>
          </div>

        </div>

        {/* Right Column: Preview Panel (Enlarged Portrait, Compact Stats) */}
        <div className="lg:col-span-5 border border-gold-900/50 p-5 rounded bg-obsidian-950/95 shadow-2xl backdrop-blur-md space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold font-gothic text-amber-300 border-b border-obsidian-800 pb-2.5 uppercase tracking-wide text-center mb-3">
              {RACE_TEMPLATES[selectedRace].title} • {CLASS_TEMPLATES[selectedClass].title}
            </h3>

            {/* Selection Portrait Preview (Optimized size for screen fit) */}
            <div className="flex justify-center mb-3">
              <div className="border border-gold-900/35 rounded-lg p-2 bg-obsidian-950 shadow-2xl w-full max-w-[340px]">
                <img 
                  src={getPortrait(selectedRace, selectedClass, selectedGender)} 
                  alt={`${selectedRace} ${selectedClass}`} 
                  className="w-full h-[440px] object-contain rounded border border-obsidian-800 bg-obsidian-900" 
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="text-xs text-slate-300 space-y-1 bg-obsidian-950/50 p-2.5 rounded border border-obsidian-850/40 leading-relaxed mb-3 text-center">
              {selectedClass === 'warrior' && (
                <p>🛡️ <strong className="text-rose-400">Сила и мощь</strong>. Урон зависит от <strong className="text-rose-400">Силы</strong>, а выносливость дает высокий запас HP.</p>
              )}
              {selectedClass === 'archer' && (
                <p>🏹 <strong className="text-emerald-400">Ловкость и криты</strong>. Уворот и крит зависят от <strong className="text-emerald-400">Ловкости</strong>.</p>
              )}
              {selectedClass === 'mage' && (
                <p>🔮 <strong className="text-sky-400">Магия стихий</strong>. Урон зависит от <strong className="text-sky-400">Интеллекта</strong> (расходует 15 MP).</p>
              )}
            </div>
          </div>

          {/* Compact Stats Table */}
          <div className="border-t border-obsidian-800 pt-2">
            <StatTable stats={combinedStats} classType={selectedClass} compact={true} />
          </div>
        </div>
      </div>
    </div>
  );
};


