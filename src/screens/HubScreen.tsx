import React, { useState, useEffect } from 'react';
import type { Character } from '../types';
import { CLASS_TEMPLATES, RACE_TEMPLATES } from '../types';
import { TownMap } from '../components/TownMap';
import { MyHouseView } from '../components/MyHouseView';
import { ForgeView } from '../components/ForgeView';
import { TavernView } from '../components/TavernView';
import { TempleView } from '../components/TempleView';
import { MarketView } from '../components/MarketView';
import { SuburbsView } from '../components/SuburbsView';
import { DungeonCrawler } from '../components/DungeonCrawler';
import { OtherLocationsView } from '../components/OtherLocationsView';
import { LoadingScreen } from '../components/LoadingScreen';
import { StatTable } from '../components/StatTable';
import { Button } from '../components/ui/Button';
import { GeneralChat } from '../components/GeneralChat';
import { Swords, Award, LogOut, Sparkles, Heart } from 'lucide-react';
import { getPortrait } from '../utils/portraitHelper';

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
  | 'upper_tier'
  | 'suburbs'
  | 'dungeon';

interface HubScreenProps {
  player: Character;
  onStartCombat: (customEnemy?: any) => void;
  onLogout: () => void;
  onUpdatePlayer: (updatedPlayer: Character) => Promise<void>;
  onChangeCharacter?: () => void;
  activeSubLoc: SubLocation;
  setActiveSubLoc: (loc: SubLocation) => void;
  dungeonState: any;
  setDungeonState: (state: any) => void;
}

// getPortrait is now imported from portraitHelper

export const HubScreen: React.FC<HubScreenProps> = ({
  player,
  onStartCombat,
  onLogout,
  onUpdatePlayer,
  onChangeCharacter,
  activeSubLoc,
  setActiveSubLoc,
  dungeonState,
  setDungeonState,
}) => {
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
        return (
          <SuburbsView 
            onBack={() => handleNavigateTo('town')} 
            onEnterDungeon={(dungKey) => {
              // Set up initial coordinate grids for the dungeons
              const isCatacomb = dungKey === 'dungeon_2';
              setDungeonState({
                activeDungeonKey: dungKey,
                x: isCatacomb ? 1 : 3,
                y: isCatacomb ? 10 : 8,
                dir: 'N',
                visited: [isCatacomb ? '1,10' : '3,8'],
                defeatedMonsters: [],
                openedChests: [],
                unlockedDoors: [],
                keys: [],
                log: [`Вы вошли в подземелье: ${dungKey === 'dungeon_1' ? 'Заброшенная Канализация' : dungKey === 'dungeon_2' ? 'Катакомбы Мучений' : 'Тайное Логово'}`]
              });
              handleNavigateTo('dungeon');
            }}
          />
        );
      case 'dungeon':
        return (
          <DungeonCrawler
            player={player}
            onSave={onUpdatePlayer}
            onBack={() => handleNavigateTo('gates')}
            dungeonKey={dungeonState?.activeDungeonKey || 'dungeon_1'}
            onStartCombat={(monster) => onStartCombat(monster)}
            initialDungeonState={dungeonState}
            onSaveDungeonState={setDungeonState}
          />
        );
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
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 animate-fade-in text-slate-850">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-300 pb-4">
          <div>
            <h2 className="text-2xl font-bold font-gothic text-slate-900 tracking-widest flex items-center gap-2">
              🏟️ АРЕНА ГЛАДИАТОРОВ
            </h2>
            <p className="text-xs font-mono text-slate-650 mt-1 uppercase tracking-wider">
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
            <div className="gothic-panel p-6 bg-gradient-to-br from-slate-50/95 via-slate-100/95 to-amber-50/95 border-amber-600/45 rounded-xl shadow-md space-y-5 text-slate-850">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-gothic flex items-center gap-2 border-b border-slate-350 pb-2.5">
                <Award className="w-5 h-5 text-amber-600" /> Боевые Показатели
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-350">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Бои</div>
                  <div className="text-xl font-black text-slate-800 mt-1">{totalBattles}</div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-150 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-300">
                  <div className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Победы</div>
                  <div className="text-xl font-black text-emerald-700 mt-1">{player.wins}</div>
                </div>
                <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-150 shadow-sm transition-all duration-200 hover:shadow-md hover:border-rose-300">
                  <div className="text-[10px] text-rose-800 uppercase font-bold tracking-wider">Пораж.</div>
                  <div className="text-xl font-black text-rose-700 mt-1">{player.losses}</div>
                </div>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-150 text-center font-mono text-xs text-slate-850 flex justify-between items-center px-4">
                <span className="font-semibold text-slate-700">Процент побед (Винрейт):</span>
                <span className="text-amber-800 font-extrabold text-sm bg-amber-100 px-2 py-0.5 rounded border border-amber-250">{winRate}%</span>
              </div>
            </div>

            {/* Rules / Tips panel */}
            <div className="p-5 border border-amber-600/30 rounded-xl bg-amber-50/45 backdrop-blur-sm text-xs text-slate-800 leading-relaxed space-y-3 shadow-md">
              <p className="font-bold text-amber-900 uppercase tracking-widest text-[10px] font-gothic flex items-center gap-1.5 border-b border-amber-200 pb-2">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" /> Советы Гладиаторам:
              </p>
              <div className="space-y-2.5">
                <p className="flex gap-2">
                  <span className="text-amber-700 font-bold font-mono">1.</span>
                  <span>В бою обязательно выбирайте зону для атаки и зону для защиты. Без этого совершить ход невозможно.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-amber-700 font-bold font-mono">2.</span>
                  <span>Урон зависит от ваших базовых характеристик, а также временных эффектов таверны или храма.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-amber-700 font-bold font-mono">3.</span>
                  <span>Выносливость придает вам дополнительные HP. Если вы ранены, используйте кровать дома или лечитесь у жреца.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stat Sheet and Battle Button */}
          <div className="lg:col-span-7 space-y-6">
            <div className="gothic-panel p-6 bg-gradient-to-br from-slate-50/95 via-slate-100/95 to-amber-50/95 border-amber-600/45 rounded-xl shadow-md text-slate-850">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-gothic border-b border-slate-350 pb-2.5 mb-4 flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-600" /> Характеристики Героя
              </h4>
              <StatTable stats={player.stats} classType={player.classType} />
            </div>

            {/* Injury warning */}
            {isWounded && (
              <div className="p-3 border border-rose-300 bg-rose-50 rounded text-xs text-rose-800 flex items-center gap-2 font-mono animate-pulse">
                <Heart className="w-4 h-4 flex-shrink-0" />
                <span>Внимание: Вы ранены ({player.currentHp} / {player.maxHp} HP). Выход в бой при неполном здоровье опасен! Восстановите силы!</span>
              </div>
            )}

            <Button onClick={() => onStartCombat()} fullWidth className="py-4 text-base flex justify-center items-center gap-3">
              <Swords className="w-5 h-5 animate-pulse" />
              ВСТУПИТЬ В БОЙ
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
      <div className="w-80 flex-shrink-0 flex flex-col justify-between gothic-panel p-4 bg-slate-100/95 border-slate-350 shadow-lg h-full select-none text-slate-800">
        {/* Profile + Stats block (grouped to stay close) */}
        <div className="flex flex-col items-center w-full space-y-6">
          {/* Profile Block */}
          <div className="flex flex-col items-center text-center space-y-3.5">
            <div className="bg-slate-200 border border-slate-350 shadow-md w-48 h-56 overflow-hidden rounded relative flex-shrink-0">
              <img 
                src={getPortrait(player.race, player.classType, player.gender)} 
                alt={`${player.race} ${player.classType}`} 
                className="w-full h-full object-contain bg-slate-900" 
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 leading-none mb-1.5">
                <span className="text-2xl font-bold font-gothic text-slate-900">{player.name}</span>
                <span className="text-base font-mono font-bold bg-slate-200 border border-slate-300 text-slate-700 px-2 py-0.5 rounded">
                  Ур. {player.level}
                </span>
              </div>
              <span className="text-sm text-slate-650 font-mono tracking-wider font-semibold uppercase block">
                {RACE_TEMPLATES[player.race]?.title || player.race} | {CLASS_TEMPLATES[player.classType]?.title || player.classType}
              </span>
            </div>
          </div>

          {/* Stats Bars */}
          <div className="space-y-4 w-full px-2">
            {/* HP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-bold font-mono text-slate-650">
                <span>Здоровье (HP)</span>
                <span className="text-rose-700 font-extrabold">{player.currentHp} / {player.maxHp} HP</span>
              </div>
              <div className="h-4 bg-slate-200 rounded overflow-hidden p-[2px] border border-slate-300">
                <div 
                  className="h-full rounded-sm transition-all duration-300" 
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (player.currentHp / player.maxHp) * 100))}%`,
                    background: 'linear-gradient(to right, #b91c1c, #ef4444)',
                  }} 
                />
              </div>
            </div>

            {/* MP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-base font-bold font-mono text-slate-650">
                <span>Мана (MP)</span>
                <span className="text-sky-700 font-extrabold">{currentMp} / {maxMp} MP</span>
              </div>
              <div className="h-4 bg-slate-200 rounded overflow-hidden p-[2px] border border-slate-300">
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
              <div className="flex justify-between text-base font-bold font-mono text-slate-650">
                <span>Опыт (XP)</span>
                <span className="text-amber-700 font-extrabold">{player.experience} / {player.level * 100} XP</span>
              </div>
              <div className="h-4 bg-slate-200 rounded overflow-hidden p-[2px] border border-slate-300">
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
            <div className="flex justify-between items-center border-t border-slate-250 pt-3.5 mt-3 flex-shrink-0">
              <span className="text-base font-mono text-slate-650 uppercase tracking-wider">Кошелек:</span>
              <span className="text-amber-700 font-extrabold font-mono text-2xl whitespace-nowrap">
                💰 {player.gold}
              </span>
            </div>

            {/* Buff details icon if present */}
            {player.activeBuff && (
              <div className="bg-amber-100 border border-amber-300 py-1.5 rounded text-sm font-mono text-amber-800 text-center animate-pulse mt-2.5 flex-shrink-0">
                <span className="font-bold">
                  {player.activeBuff.type === 'strength' ? 'СИЛА' : 'ИНТ'} +{player.activeBuff.value}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buttons Block */}
        <div className="space-y-2 border-t border-slate-250 pt-3 flex-shrink-0 w-full">
          <Button 
            variant="secondary" 
            onClick={() => setShowSettingsModal(true)}
            className="w-full py-2.5 text-base flex items-center justify-center gap-1 hover:text-gold-700 hover:border-slate-400"
            title="Настройки персонажа"
          >
            Настройки
          </Button>
          <Button 
            variant="secondary" 
            onClick={onLogout} 
            className="w-full py-2.5 text-base flex items-center justify-center gap-1 hover:text-rose-700 hover:border-rose-300"
            title="Выйти из игры"
          >
            <LogOut className="w-4 h-4" /> Выйти
          </Button>
        </div>
      </div>

      {/* Middle Column (Town map / active view) - expanded to fill remaining space */}
      <div className="flex-grow flex-shrink min-w-0 flex flex-col items-center h-full overflow-hidden">
        <div className={`w-full h-full overflow-y-auto rpg-scrollbar animate-fade-in flex flex-col min-h-0 ${
          (activeSubLoc === 'town' || activeSubLoc === 'gates') ? 'justify-center' : 'justify-start'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in select-none">
          <div className="gothic-panel-gold max-w-md w-full p-8 bg-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.15)] rounded-lg space-y-6 text-slate-800">
            <h3 className="text-xl font-bold font-gothic text-slate-900 border-b border-slate-250 pb-3 flex items-center gap-3">
              ⚙️ НАСТРОЙКИ ГЕРОЯ
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-sm font-mono text-slate-650 block">Имя персонажа</label>
                <input 
                  type="text" 
                  value={tempName} 
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full gothic-input px-4 py-2.5 rounded text-sm focus:ring-1 focus:ring-gold-500"
                  maxLength={14}
                />
              </div>

              {onChangeCharacter && (
                <div className="pt-3 border-t border-slate-250">
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setShowSettingsModal(false);
                      onChangeCharacter();
                    }}
                    className="w-full text-sm hover:text-gold-700 py-2.5 border-slate-350"
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
