import { useGameState } from './hooks/useGameState';
import { AuthScreen } from './screens/AuthScreen';
import { CharSelectScreen } from './screens/CharSelectScreen';
import { HubScreen } from './screens/HubScreen';
import { BattleScreen } from './screens/BattleScreen';

function App() {
  const {
    screen,
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
    activeScrolls
  } = useGameState();

  const handleSelectChoice = (type: 'attack' | 'defense', zone: any) => {
    setPlayerChoices((prev) => ({
      ...prev,
      [type]: zone,
    }));
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-obsidian-950">
      {/* Main content body */}
      <main className="flex-grow flex flex-col justify-center py-6">
        {screen === 'auth' && (
          <AuthScreen 
            onLogin={login} 
            onRegister={register}
            loading={authLoading}
            error={authError}
            setError={setAuthError}
          />
        )}
        
        {screen === 'char_select' && (
          <CharSelectScreen onSelectClass={selectCharacterClass} />
        )}
        
        {screen === 'hub' && player && (
          <HubScreen 
            player={player} 
            onStartCombat={startCombat} 
            onLogout={logout} 
            onUpdatePlayer={updateCharacter}
          />
        )}
        
        {screen === 'battle' && player && (
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
          />
        )}
      </main>
    </div>
  );
}

export default App;
