import React, { useState } from 'react';
import { CLASS_TEMPLATES } from '../types';
import type { CharacterClass } from '../types';
import { Button } from '../components/ui/Button';
import { StatTable } from '../components/StatTable';

import elfImg from '../assets/ELF.jpg';
import gnomeImg from '../assets/GNOME.jpg';
import mageImg from '../assets/MAGE.jpg';
import orcImg from '../assets/ORC.jpg';

interface CharSelectScreenProps {
  onSelectClass: (classType: CharacterClass, name: string) => void;
}

export const CharSelectScreen: React.FC<CharSelectScreenProps> = ({ onSelectClass }) => {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('elf');
  
  // Retrieve the temporarily stored name
  const tempName = sessionStorage.getItem('rpg_temp_name') || 'Гость';

  const classesList: { key: CharacterClass; title: string; color: string; icon: string }[] = [
    { 
      key: 'elf', 
      title: 'Эльф', 
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]', 
      icon: '🧝'
    },
    { 
      key: 'mage', 
      title: 'Маг', 
      color: 'border-sky-500 text-sky-400 bg-sky-950/10 shadow-[0_0_12px_rgba(56,189,248,0.15)]', 
      icon: '🧙'
    },
    { 
      key: 'orc', 
      title: 'Орк', 
      color: 'border-rose-500 text-rose-400 bg-rose-950/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]', 
      icon: '👹'
    },
    { 
      key: 'gnome', 
      title: 'Гном', 
      color: 'border-amber-500 text-amber-400 bg-amber-950/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]', 
      icon: '🧔'
    },
  ];

  const getPortrait = (cType: string) => {
    switch (cType) {
      case 'elf': return elfImg;
      case 'gnome': return gnomeImg;
      case 'mage': return mageImg;
      case 'orc': return orcImg;
      default: return elfImg;
    }
  };

  const handleConfirm = () => {
    onSelectClass(selectedClass, tempName);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 animate-fade-in select-none">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold font-gothic tracking-widest text-gold-400">ВЫБОР КЛАССА ПЕРСОНАЖА</h2>
        <p className="text-sm font-mono text-slate-400 mt-3">
          Боец: <span className="text-gold-300 font-bold">{tempName}</span>. Выберите расу для поединков.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {/* Class options grid */}
        {classesList.map((item) => {
          const template = CLASS_TEMPLATES[item.key];
          const isSelected = selectedClass === item.key;
          
          return (
            <div
              key={item.key}
              onClick={() => setSelectedClass(item.key)}
              className={`gothic-panel p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5 ${
                isSelected 
                  ? `${item.color} border-2` 
                  : 'border-obsidian-750 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl p-1.5 bg-obsidian-950 border border-obsidian-700 rounded select-none">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold font-gothic tracking-wider text-slate-100 group-hover:text-gold-400 transition-colors">
                    {template.title}
                  </h3>
                </div>
                
                {/* Lore description */}
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-5 line-clamp-3">
                  {template.description}
                </p>
              </div>

              {/* Mini visual indicators of stats */}
              <div className="space-y-1.5 border-t border-obsidian-800/60 pt-4 text-xs font-mono text-slate-450">
                <div className="flex justify-between">
                  <span>Сила:</span>
                  <span className="font-bold text-slate-200">{template.stats.strength}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ловкость:</span>
                  <span className="font-bold text-slate-200">{template.stats.agility}</span>
                </div>
                <div className="flex justify-between">
                  <span>Выносливость:</span>
                  <span className="font-bold text-slate-200">{template.stats.endurance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Интеллект:</span>
                  <span className="font-bold text-slate-200">{template.stats.intellect}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail panel of the selected class */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-gold-700/30 p-8 rounded bg-obsidian-900/40">
        
        {/* Selection Race Image Preview */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="border border-gold-900/30 rounded-lg p-2 bg-obsidian-950 shadow-lg">
            <img 
              src={getPortrait(selectedClass)} 
              alt={selectedClass} 
              className="w-48 h-64 object-cover rounded border border-obsidian-800" 
            />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5">
          <h3 className="text-2xl font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-3 uppercase tracking-wide">
            Особенности: {CLASS_TEMPLATES[selectedClass].title}
          </h3>
          
          <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
            {selectedClass === 'elf' && (
              <>
                <p>🏹 <strong className="text-emerald-400">Невероятная ловкость и криты</strong>. Эльфы уклоняются от большинства лобовых атак соперников и славятся смертоносными критическими попаданиями.</p>
                <p>🎯 Шанс уворота и критического удара рассчитывается на основе вашей характеристики <strong className="text-emerald-400">Ловкость</strong>.</p>
              </>
            )}
            {selectedClass === 'mage' && (
              <>
                <p>⚡ <strong className="text-sky-400">Магические заклинания</strong>. Наносит колоссальный урон тайными сферами, расходуя 15 единиц маны (MP) за каждый каст. Без маны наносит очень слабый урон посохом.</p>
                <p>🔮 Урон заклинаний увеличивается на основе вашей характеристики <strong className="text-sky-400">Интеллект</strong>. В бою вы сможете пить зелья маны для поддержания сил.</p>
              </>
            )}
            {selectedClass === 'orc' && (
              <>
                <p>🪓 <strong className="text-rose-400">Сокрушительная мощь и здоровье</strong>. Орки обладают колоссальной мышечной массой и выносливостью, превосходя другие расы в чистой силе удара.</p>
                <p>⚔️ Физический урон масштабируется от характеристики <strong className="text-rose-400">Сила</strong>, а выносливость дает максимальный запас HP.</p>
              </>
            )}
            {selectedClass === 'gnome' && (
              <>
                <p>🛡️ <strong className="text-amber-400">Абсолютная стойкость</strong>. Гномы — мастера выживания на арене. Обладают сбалансированной силой и наивысшим стартовым запасом здоровья.</p>
                <p>🦾 Их выносливость позволяет выдерживать даже самые опасные критические комбо противников.</p>
              </>
            )}
          </div>
        </div>

        {/* Detailed stats table for chosen class */}
        <div className="lg:col-span-3">
          <StatTable stats={CLASS_TEMPLATES[selectedClass].stats} classType={selectedClass} />
        </div>
      </div>

      {/* Action panel */}
      <div className="flex justify-center mt-8">
        <Button onClick={handleConfirm} size="lg" className="w-full max-w-md">
          Вступить в Бойцовский Клуб
        </Button>
      </div>
    </div>
  );
};
