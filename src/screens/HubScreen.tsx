import React from 'react';
import { CLASS_TEMPLATES } from '../types';
import type { Character } from '../types';
import { Button } from '../components/ui/Button';
import { StatTable } from '../components/StatTable';
import { Swords, Award, LogOut } from 'lucide-react';

interface HubScreenProps {
  player: Character;
  onStartCombat: () => void;
  onLogout: () => void;
}

export const HubScreen: React.FC<HubScreenProps> = ({ player, onStartCombat, onLogout }) => {
  const template = CLASS_TEMPLATES[player.classType];
  const totalBattles = player.wins + player.losses;
  const winRate = totalBattles > 0 ? Math.round((player.wins / totalBattles) * 100) : 0;

  // Render SVG avatar for hub profile
  const renderAvatar = (classType: string) => {
    switch (classType) {
      case 'barbarian':
        return (
          <svg className="w-32 h-32 text-rose-500" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,10 L80,30 L80,60 L50,90 L20,60 L20,30 Z" fill="#16161e" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50,15 L70,30 L65,55 L50,45 L35,55 L30,30 Z" fill="currentColor" opacity="0.85" />
            <path d="M20,30 Q10,15 15,5 Q25,10 25,25 Z" fill="#991b1b" />
            <path d="M80,30 Q90,15 85,5 Q75,10 75,25 Z" fill="#991b1b" />
            <circle cx="50" cy="30" r="4" fill="#f8fafc" />
          </svg>
        );
      case 'mage':
        return (
          <svg className="w-32 h-32 text-sky-500" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,5 L85,60 L75,70 L50,60 L25,70 L15,60 Z" fill="#16161e" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50,15 L70,50 L50,40 L30,50 Z" fill="currentColor" opacity="0.85" />
            <circle cx="50" cy="50" r="10" fill="#38bdf8" className="animate-pulse" />
            <path d="M25,70 L50,85 L75,70 L50,95 Z" fill="currentColor" opacity="0.6" />
          </svg>
        );
      case 'archer':
        return (
          <svg className="w-32 h-32 text-emerald-500" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,10 C65,10 75,25 75,50 C75,70 50,90 50,90 C50,90 25,70 25,50 C25,25 35,10 50,10 Z" fill="#16161e" stroke="currentColor" strokeWidth="2.5" />
            <path d="M50,20 C58,20 65,30 65,50 C65,65 50,80 50,80 C50,80 35,65 35,50 C35,30 42,20 50,20 Z" fill="currentColor" opacity="0.8" />
            <path d="M25,40 L10,30 L22,48 Z" fill="currentColor" />
            <path d="M75,40 L90,30 L78,48 Z" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-obsidian-800 pb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold font-gothic tracking-widest text-gold-400">ЦИТАДЕЛЬ БОЙЦОВ</h2>
          <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-widest">
            Добро пожаловать в палаты, боец <span className="text-gold-300 font-bold">{player.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onLogout} className="flex items-center gap-2 text-xs">
            <LogOut className="w-4 h-4" /> Выйти из игры
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Avatar, Nameplate, Battle stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="gothic-panel-gold p-6 flex flex-col items-center text-center relative overflow-hidden bg-obsidian-900/90 rounded-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-500/10 to-transparent pointer-events-none rounded-bl-full" />
            
            {/* Avatar container */}
            <div className="p-3 bg-obsidian-950 rounded-full border border-gold-600 shadow-[inset_0_4px_10px_rgba(0,0,0,0.9),_0_0_15px_rgba(197,160,40,0.1)] mb-4">
              {renderAvatar(player.classType)}
            </div>

            <h3 className="text-2xl font-bold font-gothic text-slate-100">{player.name}</h3>
            <p className="text-sm text-gold-400 font-gothic tracking-wider font-semibold mb-6">{template.title} [ур. {player.level}]</p>
            
            {/* Health, Experience and Gold Preview */}
            <div className="w-full text-left space-y-4 mb-6">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Макс. Здоровье (HP)</span>
                  <span className="text-emerald-400 font-bold">{player.maxHp} HP</span>
                </div>
                <div className="h-2 bg-obsidian-950 rounded overflow-hidden p-[1px] border border-obsidian-800">
                  <div className="h-full bg-emerald-500 rounded-sm" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-slate-400 border-t border-b border-obsidian-800/40 py-2">
                <span>💰 Накопленное Золото</span>
                <span className="text-amber-400 font-bold text-sm">{player.gold} золота</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Опыт (XP)</span>
                  <span className="text-amber-400 font-bold">{player.experience} / {player.level * 100} XP</span>
                </div>
                <div className="h-2 bg-obsidian-950 rounded overflow-hidden p-[1px] border border-obsidian-800">
                  <div 
                    className="h-full bg-amber-500 rounded-sm shadow-[0_0_5px_rgba(245,158,11,0.4)]" 
                    style={{ width: `${Math.min(100, (player.experience / (player.level * 100)) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
            
            {/* Arena CTA */}
            <Button onClick={onStartCombat} fullWidth className="py-4 text-base flex justify-center items-center gap-3">
              <Swords className="w-5 h-5 animate-pulse" />
              ВСТУПИТЬ В БОЙ С БОТОМ
            </Button>
          </div>

          {/* Arena Stats summary */}
          <div className="gothic-panel p-6 bg-obsidian-900/60 rounded-lg space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-500" /> Статистика Арены
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center font-mono">
              <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                <div className="text-[10px] text-slate-500 uppercase">Бои</div>
                <div className="text-xl font-bold text-slate-300">{totalBattles}</div>
              </div>
              <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                <div className="text-[10px] text-emerald-500 uppercase">Победы</div>
                <div className="text-xl font-bold text-emerald-400">{player.wins}</div>
              </div>
              <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                <div className="text-[10px] text-rose-500 uppercase">Винрейт</div>
                <div className="text-xl font-bold text-gold-400">{winRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Stats sheet detail */}
        <div className="lg:col-span-7 space-y-6">
          <div className="gothic-panel p-6 bg-obsidian-900/60 rounded-lg">
            <h4 className="text-base font-semibold uppercase tracking-wider text-gold-400 font-gothic border-b border-obsidian-800 pb-3 mb-6 flex items-center gap-2">
              <Swords className="w-5 h-5 text-gold-500" /> Лист характеристик персонажа
            </h4>
            <StatTable stats={player.stats} classType={player.classType} />
          </div>

          {/* Tips / Rules Panel */}
          <div className="p-4 border border-obsidian-800 rounded bg-obsidian-950/50 text-xs text-slate-500 leading-relaxed font-sans space-y-2">
            <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] font-gothic">Советы Наставника:</p>
            <p>1. В бою с ботом обязательно выбирайте и зону для атаки, и зону для защиты. Невозможно совершить ход, не определив тактику.</p>
            <p>2. Если ваша атака совпадет с защитой бота — удар будет полностью заблокирован. Будьте непредсказуемы!</p>
            <p>3. Характеристика «Ловкость» дает вам огромный шанс критического урона и уклонения. Адепты ловкости опасны, но выносливые Силачи могут пережить их шквал атак.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
