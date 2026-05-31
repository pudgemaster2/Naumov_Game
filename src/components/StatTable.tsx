import React from 'react';
import type { CharacterStats } from '../types';
import { Swords, Shield, Zap, Sparkles } from 'lucide-react';

interface StatTableProps {
  stats: CharacterStats;
  classType: string;
}

export const StatTable: React.FC<StatTableProps> = ({ stats, classType }) => {
  const statList = [
    {
      key: 'strength',
      name: 'Сила',
      value: stats.strength,
      icon: <Swords className="w-5 h-5 text-rose-500" />,
      desc: 'Увеличивает физический урон на 0.8 за ед. (кроме Магов)',
    },
    {
      key: 'agility',
      name: 'Ловкость',
      value: stats.agility,
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      desc: 'Увеличивает крит (+1.5% за ед.) и уворот (+1% за ед.)',
    },
    {
      key: 'endurance',
      name: 'Выносливость',
      value: stats.endurance,
      icon: <Shield className="w-5 h-5 text-emerald-500" />,
      desc: 'Определяет максимальный запас здоровья (10 HP за ед.)',
    },
    {
      key: 'intellect',
      name: 'Интеллект',
      value: stats.intellect,
      icon: <Sparkles className="w-5 h-5 text-sky-500" />,
      desc: 'Увеличивает магический урон на 1.0 за ед. (только у Магов)',
    },
  ];

  // Calculated secondary attributes
  const maxHp = stats.endurance * 10;
  const dodgeChance = stats.agility * 1.0;
  const critChance = stats.agility * 1.5;
  const baseDmgMin = 5;
  const baseDmgMax = 9;
  const dmgModifier = classType === 'mage' ? stats.intellect * 1.0 : stats.strength * 0.8;
  const finalDmgMin = Math.round(baseDmgMin + dmgModifier);
  const finalDmgMax = Math.round(baseDmgMax + dmgModifier);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border border-obsidian-700 rounded-lg bg-obsidian-950/80 backdrop-blur">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-obsidian-800 bg-obsidian-900/50">
              <th className="p-4.5 text-sm md:text-base font-semibold tracking-wider uppercase text-gold-400 font-gothic">Характеристика</th>
              <th className="p-4.5 text-sm md:text-base font-semibold tracking-wider uppercase text-gold-400 font-gothic text-right">Значение</th>
            </tr>
          </thead>
          <tbody>
            {statList.map((stat) => (
              <tr key={stat.key} className="border-b border-obsidian-800/40 hover:bg-obsidian-800/20 group transition-colors">
                <td className="p-4.5 flex items-center gap-3">
                  {stat.icon}
                  <div>
                    <div className="text-base font-semibold text-slate-200 group-hover:text-gold-300 transition-colors">{stat.name}</div>
                    <div className="text-xs md:text-sm text-slate-500 mt-0.5">{stat.desc}</div>
                  </div>
                </td>
                <td className="p-4.5 text-right text-xl md:text-2xl font-mono font-bold text-slate-300 group-hover:text-gold-400 transition-colors">
                  {stat.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border border-gold-700/30 rounded bg-obsidian-900/40 space-y-4">
        <h4 className="text-sm md:text-base font-semibold uppercase tracking-wider text-gold-500 font-gothic border-b border-obsidian-800 pb-2">Вторичные параметры</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm md:text-base font-mono">
          <div className="flex justify-between border-b border-obsidian-800/30 pb-1.5">
            <span className="text-slate-500">Здоровье (HP):</span>
            <span className="text-emerald-400 font-semibold">{maxHp}</span>
          </div>
          <div className="flex justify-between border-b border-obsidian-800/30 pb-1.5">
            <span className="text-slate-500">Урон (удар):</span>
            <span className="text-rose-400 font-semibold">{finalDmgMin} - {finalDmgMax}</span>
          </div>
          <div className="flex justify-between border-b border-obsidian-800/30 pb-1.5">
            <span className="text-slate-500">Крит. шанс:</span>
            <span className="text-amber-400 font-semibold">{critChance.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between border-b border-obsidian-800/30 pb-1.5">
            <span className="text-slate-500">Шанс уворота:</span>
            <span className="text-sky-400 font-semibold">{dodgeChance.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
