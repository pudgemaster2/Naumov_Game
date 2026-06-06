import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import { AuthScreen } from './screens/AuthScreen';
import { CharSelectScreen } from './screens/CharSelectScreen';
import { HubScreen } from './screens/HubScreen';
import { BattleScreen } from './screens/BattleScreen';

const allocateStats = (
  character: any,
  strength: number,
  agility: number,
  endurance: number,
  intellect: number,
  pointsUsed: number
) => {
  const nextStats = {
    strength: character.stats.strength + strength,
    agility: character.stats.agility + agility,
    endurance: character.stats.endurance + endurance,
    intellect: character.stats.intellect + intellect,
  };

  let equipEndurance = 0;
  let equipIntellect = 0;
  if (character.equipment) {
    Object.values(character.equipment).forEach((item: any) => {
      if (item && item.stats) {
        if (item.stats.endurance) equipEndurance += item.stats.endurance;
        if (item.stats.intellect) equipIntellect += item.stats.intellect;
      }
    });
  }

  const nextMaxHp = (nextStats.endurance + equipEndurance) * 10;
  const nextMaxMana = (nextStats.intellect + equipIntellect) * 10;

  return {
    ...character,
    stats: nextStats,
    maxHp: nextMaxHp,
    currentHp: Math.min(character.currentHp + (endurance * 10), nextMaxHp),
    maxMana: nextMaxMana,
    currentMana: Math.min(character.currentMana + (intellect * 10), nextMaxMana),
    statPoints: Math.max(0, (character.statPoints || 0) - pointsUsed)
  };
};

function App() {
  const {
    screen,
    setScreen,
    player,
    bot,
    combatLogs,
    playerChoices,
    setPlayerChoices,
    combatWinner,
    authLoading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    selectCharacterClass,
    startCombat,
    submitTurn,
    exitCombat,
    updateCharacter,
    useCombatPotion,
    useCombatScroll,
    surrenderCombat,
    potionsUsed,
    activeScrolls,
    combatSummary,
    activeSubLoc,
    setActiveSubLoc,
    dungeonState,
    setDungeonState,
    pendingLevelUp,
    setPendingLevelUp,
    getAutoDistribution
  } = useGameState();

  const [localAllocation, setLocalAllocation] = useState({ strength: 0, agility: 0, endurance: 0, intellect: 0 });
  const [allocationMode, setAllocationMode] = useState<'choice' | 'manual'>('choice');

  const handleSelectChoice = (type: 'attack' | 'defense', zone: any) => {
    setPlayerChoices((prev) => ({
      ...prev,
      [type]: zone,
    }));
  };

  const renderAllocationRow = (
    key: 'strength' | 'agility' | 'endurance' | 'intellect',
    label: string,
    colorClass: string,
    baseValue: number
  ) => {
    const allocated = localAllocation[key];
    const totalAllocated = localAllocation.strength + localAllocation.agility + localAllocation.endurance + localAllocation.intellect;
    const pointsLeft = pendingLevelUp ? pendingLevelUp.statPointsGained - totalAllocated : 0;
    
    return (
      <div className="flex items-center justify-between p-3.5 bg-obsidian-950/60 rounded border border-obsidian-850">
        <div>
          <div className="text-xs font-mono text-slate-400 uppercase">{label}</div>
          <div className="text-base font-bold mt-0.5">
            {baseValue} <span className={colorClass}>+{allocated}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLocalAllocation(prev => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }))}
            disabled={allocated === 0}
            className="w-9 h-9 flex items-center justify-center bg-rose-950/45 hover:bg-rose-900 border border-rose-800/45 hover:border-rose-700 rounded text-rose-450 disabled:opacity-30 disabled:pointer-events-none font-bold text-lg transition-colors cursor-pointer select-none"
          >
            -
          </button>
          <span className="w-6 text-center font-mono font-bold text-lg text-slate-200">{allocated}</span>
          <button
            type="button"
            onClick={() => setLocalAllocation(prev => ({ ...prev, [key]: prev[key] + 1 }))}
            disabled={pointsLeft <= 0}
            className="w-9 h-9 flex items-center justify-center bg-emerald-950/45 hover:bg-emerald-900 border border-emerald-800/45 hover:border-emerald-700 rounded text-emerald-450 disabled:opacity-30 disabled:pointer-events-none font-bold text-lg transition-colors cursor-pointer select-none"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden text-slate-100 flex flex-col selection:bg-gold-500 selection:text-obsidian-950">
      {/* Main content body */}
      <main className="flex-grow flex flex-col justify-center py-2 min-h-0 overflow-hidden">
        {screen === 'auth' && (
          <div className="overflow-y-auto w-full h-full rpg-scrollbar flex items-center justify-center py-4">
            <AuthScreen 
              onLogin={login} 
              onRegister={register}
              loading={authLoading}
              error={authError}
              setError={setAuthError}
            />
          </div>
        )}
        
        {screen === 'char_select' && (
          <div className="overflow-y-auto w-full h-full rpg-scrollbar py-4">
            <CharSelectScreen onSelectClass={selectCharacterClass} />
          </div>
        )}
        
        {screen === 'hub' && player && (
          <HubScreen 
            player={player} 
            activeSubLoc={activeSubLoc}
            setActiveSubLoc={setActiveSubLoc}
            dungeonState={dungeonState}
            setDungeonState={setDungeonState}
            onStartCombat={startCombat} 
            onLogout={logout} 
            onUpdatePlayer={updateCharacter}
            onChangeCharacter={() => setScreen('char_select')}
          />
        )}
        
        {screen === 'battle' && player && (
          <div className="overflow-y-auto w-full h-full rpg-scrollbar py-4">
            <BattleScreen
              player={player}
              bot={bot}
              combatLogs={combatLogs}
              playerChoices={playerChoices}
              onSelectChoice={handleSelectChoice}
              onSubmitTurn={submitTurn}
              combatWinner={combatWinner}
              onExitCombat={exitCombat}
              onUsePotion={useCombatPotion}
              onUseScroll={useCombatScroll}
              onSurrender={surrenderCombat}
              potionsUsedCount={potionsUsed}
              activeScrollsState={activeScrolls}
              combatSummary={combatSummary}
            />
          </div>
        )}
      </main>

      {/* Level Up Popup Modal */}
      {pendingLevelUp && player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 select-none">
          <div className="w-full max-w-lg bg-obsidian-900 border border-gold-500 rounded-xl p-6 shadow-[0_0_30px_rgba(197,160,40,0.25)] space-y-6 text-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,40,0.04)_0%,transparent_70%)] pointer-events-none" />
            
            {allocationMode === 'choice' ? (
              <div className="text-center space-y-5">
                <div className="flex justify-center text-4xl animate-bounce">🏆</div>
                <h2 className="text-3xl font-extrabold font-gothic tracking-widest text-gold-400 gold-text-shimmer uppercase">
                  Поздравляем!
                </h2>
                <div className="text-lg font-bold font-gothic tracking-wide border-y border-gold-900/30 py-2">
                  Вы получили новый Уровень! ({pendingLevelUp.oldLevel} → {pendingLevelUp.newLevel})
                </div>
                <p className="text-sm font-sans text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Ваша сила растет, а подвиги воспеты в балладах! Получено: <br />
                  <strong className="text-gold-400">💰 +{pendingLevelUp.goldGained} золота</strong> и <br />
                  <strong className="text-amber-400">⚔️ +{pendingLevelUp.statPointsGained} очков характеристик</strong>.
                </p>
                
                <div className="flex flex-col gap-3.5 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalAllocation({ strength: 0, agility: 0, endurance: 0, intellect: 0 });
                      setAllocationMode('manual');
                    }}
                    className="w-full py-3 bg-gold-600 hover:bg-gold-500 text-obsidian-950 font-bold tracking-wider rounded border border-gold-400 transition-all font-gothic cursor-pointer"
                  >
                    Распределить самостоятельно
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const autoStats = getAutoDistribution(player.classType, pendingLevelUp.statPointsGained);
                      const updated = allocateStats(
                        player,
                        autoStats.strength,
                        autoStats.agility,
                        autoStats.endurance,
                        autoStats.intellect,
                        pendingLevelUp.statPointsGained
                      );
                      updateCharacter(updated);
                      setPendingLevelUp(null);
                    }}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-gold-300 font-bold tracking-wider rounded border border-gold-900/40 transition-all font-gothic cursor-pointer"
                  >
                    Автораспределение
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setPendingLevelUp(null);
                    }}
                    className="w-full py-3 bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 font-bold tracking-wider rounded border border-obsidian-800 transition-all font-sans text-sm cursor-pointer"
                  >
                    Распределить позже
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold font-gothic text-gold-400 text-center tracking-wider uppercase border-b border-obsidian-800 pb-3">
                  Распределение характеристик
                </h2>
                
                <div className="text-center font-mono text-sm text-slate-300">
                  Доступно очков: <strong className="text-amber-400 text-lg">{pendingLevelUp.statPointsGained - (localAllocation.strength + localAllocation.agility + localAllocation.endurance + localAllocation.intellect)}</strong>
                </div>
                
                <div className="space-y-3.5 pt-2">
                  {renderAllocationRow('strength', 'Сила', 'text-rose-400', player.stats.strength)}
                  {renderAllocationRow('agility', 'Ловкость', 'text-amber-400', player.stats.agility)}
                  {renderAllocationRow('endurance', 'Выносливость', 'text-emerald-400', player.stats.endurance)}
                  {renderAllocationRow('intellect', 'Интеллект', 'text-sky-400', player.stats.intellect)}
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      const totalAllocated = localAllocation.strength + localAllocation.agility + localAllocation.endurance + localAllocation.intellect;
                      const updated = allocateStats(
                        player,
                        localAllocation.strength,
                        localAllocation.agility,
                        localAllocation.endurance,
                        localAllocation.intellect,
                        totalAllocated
                      );
                      updateCharacter(updated);
                      setPendingLevelUp(null);
                      setAllocationMode('choice');
                    }}
                    disabled={localAllocation.strength + localAllocation.agility + localAllocation.endurance + localAllocation.intellect === 0}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded border border-emerald-400 transition-all font-gothic cursor-pointer"
                  >
                    Подтвердить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalAllocation({ strength: 0, agility: 0, endurance: 0, intellect: 0 });
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded border border-slate-700 transition-all text-sm font-sans cursor-pointer"
                  >
                    Сбросить
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAllocationMode('choice');
                    }}
                    className="px-6 py-3 bg-obsidian-950 hover:bg-obsidian-800 text-slate-400 font-semibold rounded border border-obsidian-800 transition-all text-sm font-sans cursor-pointer"
                  >
                    Назад
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
