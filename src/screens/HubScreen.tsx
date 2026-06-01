import React, { useState, useEffect } from 'react';
import type { Character } from '../types';
import { CLASS_TEMPLATES, RACE_TEMPLATES } from '../types';
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
import { getPortrait } from '../utils/portraitHelper';

interface HubScreenProps {
  player: Character;
  onStartCombat: () => void;
  onLogout: () => void;
  onUpdatePlayer: (updatedPlayer: Character) => Promise<void>;
  onChangeCharacter?: () => void;
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

// getPortrait is now imported from portraitHelper

export const HubScreen: React.FC<HubScreenProps> = ({
  player,
  onStartCombat,
  onLogout,
  onUpdatePlayer,
  onChangeCharacter,
}) => {
  const [activeSubLoc, setActiveSubLoc] = useState<SubLocation>('town');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempName, setTempName] = useState(player.name);

  // Sync tempName when player updates
  useEffect(() => {
    setTempName(player.name);
  }, [player.name]);

  const handleSaveSettings = async () => {
    if (!tempName.trim()) return;
    const updatedPlayer = {
      ...player,
      name: tempName.trim(),
    };
    await onUpdatePlayer(updatedPlayer);
    setShowSettingsModal(false);
  };
  
  // Transition loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState<SubLocation>('town');


  const handleNavigateTo = (targetLoc: SubLocation) => {
    setLoadingLoc(targetLoc);
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
    <div className="h-full flex flex-row gap-4 w-full px-4 py-2 select-none overflow-hidden min-h-0 items-stretch">
      
      {/* Loading Screen Overlay */}
      {isLoading && (
        <LoadingScreen 
          onComplete={handleLoadingComplete} 
        />
      )}

      {/* Left Column: Vertical Character panel */}
      <div className="w-80 flex-shrink-0 flex flex-col justify-between gothic-panel p-4 bg-obsidian-900/90 rounded-lg border-gold-900/40 relative shadow-lg h-full select-none">
        {/* Profile + Stats block (grouped to stay close) */}
        <div className="flex flex-col items-center w-full space-y-6">
          {/* Profile Block */}
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="bg-obsidian-950 border border-gold-500/50 shadow-md w-48 h-56 overflow-hidden rounded relative flex-shrink-0">
              <img 
                src={getPortrait(player.race, player.classType)} 
                alt={`${player.race} ${player.classType}`} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 leading-none mb-1.5">
                <span className="text-2xl font-bold font-gothic text-slate-100">{player.name}</span>
                <span className="text-base font-mono font-bold bg-gold-900/30 border border-gold-600/30 text-gold-400 px-2 py-0.5 rounded">
                  Ур. {player.level}
                </span>
              </div>
              <span className="text-sm text-gold-400 font-mono tracking-wider font-semibold uppercase block">
                {RACE_TEMPLATES[player.race]?.title || player.race} | {CLASS_TEMPLATES[player.classType]?.title || player.classType}
              </span>
            </div>
          </div>

          {/* Stats Bars */}
          <div className="space-y-4 w-full px-2">
            {/* HP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-bold font-mono text-slate-400">
                <span>Здоровье (HP)</span>
                <span className="text-rose-400 font-bold">{player.currentHp} / {player.maxHp} HP</span>
              </div>
              <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[2px] border border-obsidian-850">
                <div 
                  className="h-full rounded-sm transition-all duration-300" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (player.currentHp / player.maxHp) * 100))}%`,
                    background: 'linear-gradient(to right, #9f1239, #f43f5e)',
                  }} 
                />
              </div>
            </div>

            {/* MP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-bold font-mono text-slate-400">
                <span>Мана (MP)</span>
                <span className="text-sky-400 font-bold">{currentMp} / {maxMp} MP</span>
              </div>
              <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[2px] border border-obsidian-850">
                <div 
                  className="h-full rounded-sm transition-all duration-300" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (currentMp / maxMp) * 100))}%`,
                    background: 'linear-gradient(to right, #1d4ed8, #3b82f6)',
                  }} 
                />
              </div>
            </div>

            {/* XP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-bold font-mono text-slate-400">
                <span>Опыт (XP)</span>
                <span className="text-amber-400 font-bold">{player.experience} / {player.level * 100} XP</span>
              </div>
              <div className="h-4 bg-obsidian-950 rounded overflow-hidden p-[2px] border border-obsidian-850">
                <div 
                  className="h-full rounded-sm transition-all duration-300" 
                  style={{ 
                    width: `${Math.min(100, (player.experience / (player.level * 100)) * 100)}%`,
                    background: 'linear-gradient(to right, #d97706, #f59e0b)',
                  }} 
                />
              </div>
            </div>

            {/* Wallet */}
            <div className="flex justify-between items-center border-t border-obsidian-800 pt-3.5 mt-3 flex-shrink-0">
              <span className="text-base font-mono text-slate-400 uppercase tracking-wider">Кошелек:</span>
              <span className="text-amber-400 font-bold font-mono text-2xl whitespace-nowrap">
                💰 {player.gold}
              </span>
            </div>

            {/* Buff details icon if present */}
            {player.activeBuff && (
              <div className="bg-gold-950/20 border border-gold-600/30 py-1.5 rounded text-sm font-mono text-gold-400 text-center animate-pulse mt-2.5 flex-shrink-0">
                <span className="font-bold">
                  {player.activeBuff.type === 'strength' ? 'СИЛА' : 'ИНТ'} +{player.activeBuff.value}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons Block */}
        <div className="space-y-2 border-t border-obsidian-800 pt-3 flex-shrink-0 w-full">
          <Button 
            variant="secondary" 
            onClick={() => setShowSettingsModal(true)}
            className="w-full py-2.5 text-base flex items-center justify-center gap-1 hover:text-gold-300"
            title="Настройки персонажа"
          >
            Настройки
          </Button>
          <Button 
            variant="secondary" 
            onClick={onLogout} 
            className="w-full py-2.5 text-base flex items-center justify-center gap-1 hover:text-rose-400 hover:border-rose-950"
            title="Выйти из игры"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </Button>
        </div>
      </div>

      {/* Middle Column (Town map / active view) - expanded to fill remaining space */}
      <div className="flex-grow flex-shrink min-w-0 flex flex-col items-center h-full overflow-hidden">
        <div className={`w-full h-full overflow-y-auto rpg-scrollbar animate-fade-in flex flex-col min-h-0 ${
          activeSubLoc === 'town' ? 'justify-center' : 'justify-start'
        }`}>
          {renderActiveView()}
        </div>
      </div>

      {/* Right Column: General Chat */}
      <div className="w-80 flex-shrink-0 flex flex-col min-h-0 h-full">
        <GeneralChat playerName={player.name} />
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="gothic-panel-gold max-w-md w-full p-8 bg-obsidian-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-lg space-y-6">
            <h3 className="text-xl font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-3 flex items-center gap-3">
              ⚙️ НАСТРОЙКИ ГЕРОЯ
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-mono text-slate-400 block">Имя персонажа</label>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full gothic-input px-4 py-2.5 rounded text-sm focus:ring-1 focus:ring-gold-500"
                  maxLength={14}
                />
              </div>

              {onChangeCharacter && (
                <div className="pt-3 border-t border-obsidian-800">
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setShowSettingsModal(false);
                      onChangeCharacter();
                    }}
                    className="w-full text-sm hover:text-gold-300 py-2.5 border-gold-900/40"
                  >
                    Выбор другого персонажа
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleSaveSettings} className="flex-1">
                Сохранить
              </Button>
              <Button variant="secondary" onClick={() => setShowSettingsModal(false)} className="flex-1">
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
