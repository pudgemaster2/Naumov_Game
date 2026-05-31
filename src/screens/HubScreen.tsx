import React, { useState } from 'react';
import type { Character } from '../types';
import { CLASS_TEMPLATES } from '../types';
import { TownMap } from '../components/TownMap';
import { MyHouseView } from '../components/MyHouseView';
import { ForgeView } from '../components/ForgeView';
import { TavernView } from '../components/TavernView';
import { TempleView } from '../components/TempleView';
import { MarketView } from '../components/MarketView';
import { OtherLocationsView } from '../components/OtherLocationsView';
import { LoadingScreen } from '../components/LoadingScreen';
import { StatTable } from '../components/StatTable';
import { Button } from '../components/ui/Button';
import { GeneralChat } from '../components/GeneralChat';
import { Swords, Award, LogOut, Compass, Sparkles, Heart } from 'lucide-react';

import elfImg from '../assets/ELF.jpg';
import gnomeImg from '../assets/GNOME.jpg';
import mageImg from '../assets/MAGE.jpg';
import orcImg from '../assets/ORC.jpg';

interface HubScreenProps {
  player: Character;
  onStartCombat: () => void;
  onLogout: () => void;
  onUpdatePlayer: (updatedPlayer: Character) => Promise<void>;
}

type SubLocation =
  | 'town'
  | 'my_house'
  | 'forge'
  | 'tavern'
  | 'temple'
  | 'market'
  | 'arena'
  | 'gates'
  | 'siege'
  | 'post'
  | 'upper_tier';

const getPortrait = (cType: string) => {
  switch (cType) {
    case 'elf': return elfImg;
    case 'gnome': return gnomeImg;
    case 'mage': return mageImg;
    case 'orc': return orcImg;
    default: return elfImg;
  }
};

export const HubScreen: React.FC<HubScreenProps> = ({
  player,
  onStartCombat,
  onLogout,
  onUpdatePlayer,
}) => {
  const [activeSubLoc, setActiveSubLoc] = useState<SubLocation>('town');
  
  // Transition loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState<SubLocation>('town');
  const [loadingMessage, setLoadingMessage] = useState('Загрузка...');

  const getLoadingMessage = (loc: SubLocation) => {
    switch (loc) {
      case 'my_house': return 'Вход в палаты...';
      case 'forge': return 'Путь в Кузницу Пламени...';
      case 'tavern': return 'Заходим в Таверну...';
      case 'temple': return 'Подходим к Храму Воды...';
      case 'market': return 'Выходим на Торговую площадь...';
      case 'arena': return 'Путь на Арену Гладиаторов...';
      case 'gates': return 'Подходим к Главным вратам...';
      case 'siege': return 'Осмотр оборонительных орудий...';
      case 'post': return 'Идем на Оборонительный пост...';
      case 'upper_tier': return 'Поднимаемся на Верхний Ярус...';
      case 'town': return 'Возвращение на площадь...';
      default: return 'Загрузка...';
    }
  };

  const handleNavigateTo = (targetLoc: SubLocation) => {
    setLoadingLoc(targetLoc);
    setLoadingMessage(getLoadingMessage(targetLoc));
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    setActiveSubLoc(loadingLoc);
    setIsLoading(false);
  };

  // Render Sub views
  const renderActiveView = () => {
    switch (activeSubLoc) {
      case 'town':
        return (
          <TownMap 
            onSelectLocation={(key) => handleNavigateTo(key as SubLocation)} 
          />
        );
      case 'my_house':
        return (
          <MyHouseView 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      case 'forge':
        return (
          <ForgeView 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      case 'tavern':
        return (
          <TavernView 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      case 'temple':
        return (
          <TempleView 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      case 'market':
        return (
          <MarketView 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      case 'arena':
        return renderArenaLobby();
      case 'gates':
      case 'siege':
      case 'post':
      case 'upper_tier':
        return (
          <OtherLocationsView 
            locationKey={activeSubLoc} 
            player={player} 
            onSave={onUpdatePlayer} 
            onBack={() => handleNavigateTo('town')} 
          />
        );
      default:
        return null;
    }
  };

  // Render Arena view specifically
  const renderArenaLobby = () => {
    const totalBattles = player.wins + player.losses;
    const winRate = totalBattles > 0 ? Math.round((player.wins / totalBattles) * 100) : 0;
    const isWounded = player.currentHp < player.maxHp;

    return (
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
              🏟️ АРЕНА ГЛАДИАТОРОВ
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
              Испытайте свою сталь против обученных боевых ботов
            </p>
          </div>
          <Button variant="secondary" onClick={() => handleNavigateTo('town')} className="text-xs">
            Вернуться в город
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stats Lobby Details */}
          <div className="lg:col-span-5 space-y-6">
            {/* Arena Stats summary */}
            <div className="gothic-panel p-6 bg-obsidian-900/60 rounded-lg space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic flex items-center gap-2 border-b border-obsidian-800 pb-2">
                <Award className="w-4 h-4 text-gold-500" /> Боевые Показатели
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-[10px] text-slate-500 uppercase">Бои</div>
                  <div className="text-lg font-bold text-slate-300">{totalBattles}</div>
                </div>
                <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-[10px] text-emerald-500 uppercase">Победы</div>
                  <div className="text-lg font-bold text-emerald-400">{player.wins}</div>
                </div>
                <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-[10px] text-rose-500 uppercase">Пораж.</div>
                  <div className="text-lg font-bold text-rose-400">{player.losses}</div>
                </div>
              </div>
              <div className="p-3 bg-obsidian-950 rounded border border-obsidian-800 text-center font-mono text-xs">
                <span>Процент побед (Винрейт): </span>
                <span className="text-gold-400 font-bold">{winRate}%</span>
              </div>
            </div>

            {/* Rules / Tips panel */}
            <div className="p-4 border border-obsidian-800 rounded bg-obsidian-950/50 text-xs text-slate-500 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px] font-gothic flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" /> Советы Гладиаторам:
              </p>
              <p>1. В бою обязательно выбирайте зону для атаки и зону для защиты. Без этого совершить ход невозможно.</p>
              <p>2. Урон зависит от ваших базовых характеристик, а также временных эффектов таверны или храма.</p>
              <p>3. Выносливость придает вам дополнительные HP. Если вы ранены, используйте кровать дома или лечитесь у жреца.</p>
            </div>
          </div>

          {/* Stat Sheet and Battle Button */}
          <div className="lg:col-span-7 space-y-6">
            <div className="gothic-panel p-6 bg-obsidian-900/60 rounded-lg">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic border-b border-obsidian-800 pb-2 mb-4 flex items-center gap-2">
                <Swords className="w-4 h-4 text-gold-500" /> Характеристики Героя
              </h4>
              <StatTable stats={player.stats} classType={player.classType} />
            </div>

            {/* Injury warning */}
            {isWounded && (
              <div className="p-3 border border-rose-900/40 bg-rose-950/10 rounded text-xs text-rose-400 flex items-center gap-2 font-mono animate-pulse">
                <Heart className="w-4 h-4 flex-shrink-0" />
                <span>Внимание: Вы ранены ({player.currentHp} / {player.maxHp} HP). Выход в бой при неполном здоровье опасен! Восстановите силы!</span>
              </div>
            )}

            <Button onClick={onStartCombat} fullWidth className="py-4 text-base flex justify-center items-center gap-3">
              <Swords className="w-5 h-5 animate-pulse" />
              ВСТУПИТЬ В БОЙ С БОТОМ
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const currentMp = player.currentMana !== undefined ? player.currentMana : player.stats.intellect * 10;
  const maxMp = player.maxMana !== undefined ? player.maxMana : player.stats.intellect * 10;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-2 space-y-6">
      
      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen 
          message={loadingMessage} 
          onComplete={handleLoadingComplete} 
        />
      )}

      {/* Premium HUD Status Bar */}
      <div className="gothic-panel p-6 md:p-8 bg-obsidian-900/90 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 border-gold-900/40 relative overflow-hidden shadow-lg select-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-gold-500/5 to-transparent pointer-events-none rounded-full" />
        
        {/* Left Section: Portrait and Name */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="bg-obsidian-950 border border-gold-500/50 shadow-md w-20 h-24 overflow-hidden rounded flex-shrink-0">
            <img 
              src={getPortrait(player.classType)} 
              alt={player.classType} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold font-gothic text-slate-100">{player.name}</h3>
              <span className="text-xs font-mono font-bold bg-gold-900/30 border border-gold-600/30 text-gold-400 px-3 py-1 rounded-full">
                Уровень {player.level}
              </span>
            </div>
            <p className="text-base text-gold-400 font-gothic tracking-wider font-semibold uppercase">
              {CLASS_TEMPLATES[player.classType].title}
            </p>
          </div>
        </div>

        {/* Center Section: HP, MP & XP bars */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {/* Health points bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs md:text-sm font-bold font-mono text-slate-400">
              <span>Здоровье (HP)</span>
              <span className="text-emerald-400 font-bold">{player.currentHp} / {player.maxHp} HP</span>
            </div>
            <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[1.5px] border border-obsidian-800">
              <div 
                className="h-full bg-emerald-500 rounded-sm shadow-[0_0_5px_rgba(16,185,129,0.3)] transition-all duration-300" 
                style={{ width: `${Math.max(0, Math.min(100, (player.currentHp / player.maxHp) * 100))}%` }} 
              />
            </div>
          </div>

          {/* Mana points bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs md:text-sm font-bold font-mono text-slate-400">
              <span>Мана (MP)</span>
              <span className="text-sky-400 font-bold">{currentMp} / {maxMp} MP</span>
            </div>
            <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[1.5px] border border-obsidian-800">
              <div 
                className="h-full bg-blue-500 rounded-sm shadow-[0_0_5px_rgba(59,130,246,0.3)] transition-all duration-300" 
                style={{ width: `${Math.max(0, Math.min(100, (currentMp / maxMp) * 100))}%` }} 
              />
            </div>
          </div>

          {/* Experience points bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs md:text-sm font-bold font-mono text-slate-400">
              <span>Опыт (XP)</span>
              <span className="text-amber-400 font-bold">{player.experience} / {player.level * 100} XP</span>
            </div>
            <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[1.5px] border border-obsidian-800">
              <div 
                className="h-full bg-amber-500 rounded-sm shadow-[0_0_5px_rgba(245,158,11,0.3)] transition-all duration-300" 
                style={{ width: `${Math.min(100, (player.experience / (player.level * 100)) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Right Section: Gold status, Buff indicator & Return/Logout Button */}
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-0 border-obsidian-800/40 pt-4 md:pt-0">
          {/* Wallet */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold font-mono text-slate-400">Кошелек:</span>
            <span className="text-amber-400 font-bold font-mono text-xl md:text-2xl tracking-wide whitespace-nowrap">
              💰 {player.gold}
            </span>
          </div>

          {/* Buff details icon if present */}
          {player.activeBuff && (
            <div className="flex items-center gap-1.5 bg-gold-950/20 border border-gold-600/30 px-3 py-1.5 rounded text-xs md:text-sm font-mono text-gold-400 animate-pulse">
              <Sparkles className="w-4.5 h-4.5" />
              <span className="uppercase tracking-widest font-bold font-sans">
                {player.activeBuff.type === 'strength' ? 'СИЛА' : 'ИНТ'} +{player.activeBuff.value} ({player.activeBuff.fightsLeft}б)
              </span>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-2">
            {activeSubLoc !== 'town' && (
              <Button 
                variant="secondary" 
                onClick={() => handleNavigateTo('town')} 
                className="p-3 px-5 text-sm md:text-base flex items-center gap-2"
                title="Вернуться на карту города"
              >
                <Compass className="w-5 h-5" /> <span className="hidden sm:inline">Карта</span>
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              onClick={onLogout} 
              className="p-3 px-5 text-sm md:text-base flex items-center gap-2 hover:text-rose-400 hover:border-rose-900/50"
              title="Выйти из игры"
            >
              <LogOut className="w-5 h-5" /> <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>

      </div>

      {/* 2-Column Town Layout: Active View (Left/Center) & General Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 w-full animate-fade-in">
          {renderActiveView()}
        </div>
        <div className="lg:col-span-1 w-full">
          <GeneralChat playerName={player.name} />
        </div>
      </div>

    </div>
  );
};
