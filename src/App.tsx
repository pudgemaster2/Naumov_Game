import { useGameState } from './hooks/useGameState';
import { AuthScreen } from './screens/AuthScreen';
import { CharSelectScreen } from './screens/CharSelectScreen';
import { HubScreen } from './screens/HubScreen';
import { BattleScreen } from './screens/BattleScreen';
import { Swords } from 'lucide-react';

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
  } = useGameState();

  const handleSelectChoice = (type: 'attack' | 'defense', zone: any) => {
    setPlayerChoices((prev) => ({
      ...prev,
      [type]: zone,
    }));
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-obsidian-950">
      {/* Universal header decoration */}
      <header className="border-b border-gold-900/30 bg-obsidian-950 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-gold-500" />
            <h1 className="text-xl font-bold font-gothic tracking-widest text-gold-400">
              БОЙЦОВСКИЙ КЛУБ
            </h1>
          </div>
          {player && (
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Боец: <strong className="text-gold-400">{player.name}</strong></span>
              <span className="h-3 w-px bg-obsidian-800" />
              <span>Уровень: <strong className="text-slate-200">{player.level}</strong></span>
            </div>
          )}
        </div>
      </header>

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
          />
        )}
      </main>

      {/* Universal footer */}
      <footer className="border-t border-obsidian-900 bg-obsidian-900/20 py-4 text-center text-[10px] text-slate-600 font-mono">
        <div className="max-w-6xl mx-auto px-4">
          Разработано в стиле легендарных браузерных RPG. Все вычисления урона и уворотов происходят локально.
        </div>
      </footer>
    </div>
  );
}

export default App;
