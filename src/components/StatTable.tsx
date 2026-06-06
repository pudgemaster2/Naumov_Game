import React from 'react';
import type { CharacterStats } from '../types';
import { Swords, Shield, Zap, Sparkles } from 'lucide-react';

interface StatTableProps {
  stats: CharacterStats;
  classType: string;
  compact?: boolean;
}

export const StatTable: React.FC<StatTableProps> = ({ stats, classType, compact = false }) => {
  const statList = [
    {
      key: 'strength',
      name: 'Сила',
      value: stats.strength,
      icon: <Swords className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-rose-500`} />,
      desc: 'Увеличивает физический урон на 0.8 за ед. (кроме Магов)',
    },
    {
      key: 'agility',
      name: 'Ловкость',
      value: stats.agility,
      icon: <Zap className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-amber-500`} />,
      desc: 'Увеличивает крит (+1.5% за ед.) и уворот (+1% за ед.)',
    },
    {
      key: 'endurance',
      name: 'Выносливость',
      value: stats.endurance,
      icon: <Shield className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-emerald-500`} />,
      desc: 'Определяет максимальный запас здоровья (10 HP за ед.)',
    },
    {
      key: 'intellect',
      name: 'Интеллект',
      value: stats.intellect,
      icon: <Sparkles className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-sky-500`} />,
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
    <div className={compact ? "space-y-3" : "space-y-6"}>
      <div className="overflow-hidden border border-obsidian-700 rounded-xl bg-obsidian-950/90 shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-obsidian-800 bg-obsidian-900/60">
              <th className={`${compact ? 'p-2 px-3 text-xs' : 'p-4 px-5 text-sm md:text-base'} font-semibold tracking-wider uppercase text-gold-400 font-gothic`}>Характеристика</th>
              <th className={`${compact ? 'p-2 px-3 text-xs' : 'p-4 px-5 text-sm md:text-base'} font-semibold tracking-wider uppercase text-gold-400 font-gothic text-right`}>Значение</th>
            </tr>
          </thead>
          <tbody>
            {statList.map((stat) => (
              <tr key={stat.key} className="border-b border-obsidian-800/40 hover:bg-obsidian-800/30 group transition-colors">
                <td className={`${compact ? 'p-2 px-3' : 'p-4 px-5'} flex items-center gap-3`}>
                  <div className={`${compact ? 'p-1' : 'p-1.5'} bg-obsidian-900 rounded-lg border border-obsidian-800 group-hover:border-gold-600/40 transition-colors shadow-inner flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className={`${compact ? 'text-sm' : 'text-base'} font-bold text-slate-200 group-hover:text-gold-300 transition-colors`}>{stat.name}</div>
                    {!compact && (
                      <div className="text-xs md:text-sm text-slate-400 group-hover:text-slate-300 transition-colors mt-0.5 font-medium">{stat.desc}</div>
                    )}
                  </div>
                </td>
                <td className={`${compact ? 'p-2 px-3 text-lg font-bold' : 'p-4 px-5 text-xl md:text-2xl font-extrabold'} text-right font-mono text-slate-300 group-hover:text-gold-400 transition-colors`}>
                  {stat.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compact ? (
        <div className="p-3 border border-obsidian-700 rounded-xl bg-obsidian-950/90 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-mono">
            <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1">
              <span className="text-slate-400">Здоровье (HP):</span>
              <span className="text-emerald-400 font-bold">{maxHp}</span>
            </div>
            <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1">
              <span className="text-slate-400">Урон (удар):</span>
              <span className="text-rose-400 font-bold">{finalDmgMin} - {finalDmgMax}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Крит. шанс:</span>
              <span className="text-amber-400 font-bold">{critChance.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Шанс уворота:</span>
              <span className="text-sky-400 font-bold">{dodgeChance.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-obsidian-700 rounded-xl bg-obsidian-950/90 shadow-2xl backdrop-blur-md space-y-4">
          <h4 className="text-sm md:text-base font-bold uppercase tracking-wider text-gold-400 font-gothic border-b border-obsidian-800 pb-2 flex items-center gap-2">
            🎯 Вторичные параметры
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5 text-sm md:text-base font-mono">
            <div className="flex justify-between items-center border-b border-obsidian-850 pb-2">
              <span className="text-slate-400 font-medium">Здоровье (HP):</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/45 px-2.5 py-0.5 rounded border border-emerald-900/30 shadow-sm">{maxHp}</span>
            </div>
            <div className="flex justify-between items-center border-b border-obsidian-850 pb-2">
              <span className="text-slate-400 font-medium">Урон (удар):</span>
              <span className="text-rose-400 font-bold bg-rose-950/45 px-2.5 py-0.5 rounded border border-rose-900/30 shadow-sm">{finalDmgMin} - {finalDmgMax}</span>
            </div>
            <div className="flex justify-between items-center border-b border-obsidian-850 pb-2">
              <span className="text-slate-400 font-medium">Крит. шанс:</span>
              <span className="text-amber-400 font-bold bg-amber-950/45 px-2.5 py-0.5 rounded border border-amber-900/30 shadow-sm">{critChance.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-obsidian-850 pb-2">
              <span className="text-slate-400 font-medium">Шанс уворота:</span>
              <span className="text-sky-400 font-bold bg-sky-950/45 px-2.5 py-0.5 rounded border border-sky-900/30 shadow-sm">{dodgeChance.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
