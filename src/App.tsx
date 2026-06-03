import { useGameState } from './hooks/useGameState';
import { AuthScreen } from './screens/AuthScreen';
import { CharSelectScreen } from './screens/CharSelectScreen';
import { HubScreen } from './screens/HubScreen';
import { BattleScreen } from './screens/BattleScreen';

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
    setDungeonState
  } = useGameState();

  const handleSelectChoice = (type: 'attack' | 'defense', zone: any) => {
    setPlayerChoices((prev) => ({
      ...prev,
      [type]: zone,
    }));
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
    </div>
  );
}

export default App;
