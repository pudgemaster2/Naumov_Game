import React, { useState } from 'react';
import { CLASS_TEMPLATES } from '../types';
import type { CharacterClass } from '../types';
import { Button } from '../components/ui/Button';
import { StatTable } from '../components/StatTable';
import { Swords, Zap, Sparkles } from 'lucide-react';

interface CharSelectScreenProps {
  onSelectClass: (classType: CharacterClass, name: string) => void;
}

export const CharSelectScreen: React.FC<CharSelectScreenProps> = ({ onSelectClass }) => {
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('barbarian');
  
  // Retrieve the temporarily stored name
  const tempName = sessionStorage.getItem('rpg_temp_name') || 'Гость';

  const classesList: { key: CharacterClass; title: string; color: string; icon: React.ReactNode }[] = [
    { 
      key: 'barbarian', 
      title: 'Силач (Воин)', 
      color: 'border-rose-500 text-rose-400 bg-rose-950/10 shadow-[0_0_12px_rgba(244,63,94,0.15)]', 
      icon: <Swords className="w-6 h-6" /> 
    },
    { 
      key: 'mage', 
      title: 'Маг', 
      color: 'border-sky-500 text-sky-400 bg-sky-950/10 shadow-[0_0_12px_rgba(56,189,248,0.15)]', 
      icon: <Sparkles className="w-6 h-6" /> 
    },
    { 
      key: 'archer', 
      title: 'Эльф-лучник', 
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/10 shadow-[0_0_12px_rgba(16,185,129,0.15)]', 
      icon: <Zap className="w-6 h-6" /> 
    },
  ];

  const handleConfirm = () => {
    onSelectClass(selectedClass, tempName);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-gothic tracking-widest text-gold-400">ВЫБОР КЛАССА ПЕРСОНАЖА</h2>
        <p className="text-xs font-mono text-slate-400 mt-2">
          Боец: <span className="text-gold-300 font-bold">{tempName}</span>. Выберите стезю для поединков.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Class options grid */}
        {classesList.map((item) => {
          const template = CLASS_TEMPLATES[item.key];
          const isSelected = selectedClass === item.key;
          
          return (
            <div
              key={item.key}
              onClick={() => setSelectedClass(item.key)}
              className={`gothic-panel p-6 cursor-pointer flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 ${
                isSelected 
                  ? `${item.color} border-2` 
                  : 'border-obsidian-700 opacity-60 hover:opacity-100'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded bg-obsidian-950 border ${
                    isSelected ? 'border-current' : 'border-obsidian-700'
                  }`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold font-gothic tracking-wider text-slate-100 group-hover:text-gold-400 transition-colors">
                    {template.title}
                  </h3>
                </div>
                
                {/* Lore description */}
                <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
                  {template.description}
                </p>
              </div>

              {/* Mini visual indicators of stats */}
              <div className="space-y-2 border-t border-obsidian-800/60 pt-4 text-xs font-mono text-slate-400">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border border-gold-700/30 p-6 rounded bg-obsidian-900/40">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2">
            Свойства класса: {CLASS_TEMPLATES[selectedClass].title}
          </h3>
          
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            {selectedClass === 'barbarian' && (
              <>
                <p>🛡️ <strong className="text-rose-400">Мощная броня и выносливость</strong> позволяют выдерживать колоссальный урон. Силач идеален для затяжных боев с ботами.</p>
                <p>⚔️ Физический урон увеличивается от характеристики <strong className="text-rose-400">Сила</strong>.</p>
              </>
            )}
            {selectedClass === 'mage' && (
              <>
                <p>⚡ <strong className="text-sky-400">Смертоносные заклинания</strong> пробивают любую защиту. Однако малый запас здоровья делает его уязвимым к быстрым атакам.</p>
                <p>🔮 Урон значительно масштабируется от характеристики <strong className="text-sky-400">Интеллект</strong>.</p>
              </>
            )}
            {selectedClass === 'archer' && (
              <>
                <p>💨 <strong className="text-emerald-400">Уклонения и критические выстрелы</strong>. Урон лучника средний, но частые критические попадания и способность избегать урона делают его опасным дуэлянтом.</p>
                <p>🎯 Шанс крита и уворота зависят от характеристики <strong className="text-emerald-400">Ловкость</strong>.</p>
              </>
            )}
          </div>
        </div>

        {/* Detailed stats table for chosen class */}
        <div>
          <StatTable stats={CLASS_TEMPLATES[selectedClass].stats} classType={selectedClass} />
        </div>
      </div>

      {/* Action panel */}
      <div className="flex justify-center mt-8 gap-4">
        <Button onClick={handleConfirm} className="w-full max-w-sm">
          Выбрать персонажа и войти в хаб
        </Button>
      </div>
    </div>
  );
};
