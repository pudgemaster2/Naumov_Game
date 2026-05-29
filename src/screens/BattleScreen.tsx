import React from 'react';
import type { Character, CombatZone, CombatLogEntry } from '../types';
import { FighterCard } from '../components/FighterCard';
import { CombatLog } from '../components/CombatLog';
import { Button } from '../components/ui/Button';
import { Swords, Award, RefreshCw, ChevronLeft } from 'lucide-react';

interface BattleScreenProps {
  player: Character;
  bot: Character | null;
  combatLogs: CombatLogEntry[];
  playerChoices: {
    attack: CombatZone | null;
    defense: CombatZone | null;
  };
  onSelectChoice: (type: 'attack' | 'defense', zone: CombatZone) => void;
  onSubmitTurn: () => void;
  combatWinner: 'player' | 'bot' | 'draw' | null;
  onExitCombat: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  player,
  bot,
  combatLogs,
  playerChoices,
  onSelectChoice,
  onSubmitTurn,
  combatWinner,
  onExitCombat,
}) => {
  if (!bot) {
    return (
      <div className="flex flex-col justify-center items-center h-96 space-y-4">
        <RefreshCw className="w-8 h-8 text-gold-500 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Подготовка арены...</p>
      </div>
    );
  }

  const isTurnReady = playerChoices.attack !== null && playerChoices.defense !== null;
  const isGameOver = combatWinner !== null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in relative">
      
      {/* Upper Navigation/Status Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <button
          onClick={onExitCombat}
          className="text-xs text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1 font-mono uppercase"
          disabled={!isGameOver && player.currentHp > 0 && bot.currentHp > 0}
          title={isGameOver ? 'Выйти в хаб' : 'Нельзя покинуть поле боя во время сражения!'}
        >
          <ChevronLeft className="w-4 h-4" /> Сбежать с арены
        </button>
        <div className="text-center">
          <span className="text-sm font-bold font-gothic tracking-widest text-gold-400 uppercase">Поединок на арене</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Battle Grid: Player vs Bot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Player column */}
        <div className={`${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard
            fighter={player}
            isPlayer={true}
            choices={playerChoices}
            onSelectChoice={!isGameOver ? onSelectChoice : undefined}
          />
        </div>

        {/* Bot column */}
        <div className={`${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard
            fighter={bot}
            isPlayer={false}
          />
        </div>
      </div>

      {/* Combat actions panel */}
      <div className="flex flex-col items-center justify-center p-4 rounded border border-gold-700/20 bg-obsidian-900/40 relative">
        {!isGameOver ? (
          <div className="w-full max-w-xs space-y-3 text-center">
            {/* Show choices checklist */}
            <div className="flex justify-center gap-6 text-[11px] font-mono mb-2">
              <span className={playerChoices.attack ? 'text-emerald-400' : 'text-slate-500'}>
                {playerChoices.attack ? '✓ Атака выбрана' : '✗ Атака не выбрана'}
              </span>
              <span className={playerChoices.defense ? 'text-emerald-400' : 'text-slate-500'}>
                {playerChoices.defense ? '✓ Блок выбран' : '✗ Блок не выбран'}
              </span>
            </div>
            
            <Button
              onClick={onSubmitTurn}
              disabled={!isTurnReady}
              fullWidth
              className="py-3 text-base flex justify-center items-center gap-2"
            >
              <Swords className="w-4 h-4" />
              УДАРИТЬ (ОТПРАВИТЬ ХОД)
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4 py-2">
            <p className="text-xs font-mono text-slate-400">Сражение завершено. Итог зафиксирован.</p>
            <Button onClick={onExitCombat} className="w-64 py-3">
              Вернуться в цитадель
            </Button>
          </div>
        )}
      </div>

      {/* Battle Log (bottom third) */}
      <div className="w-full">
        <CombatLog logs={combatLogs} />
      </div>

      {/* Game Over Modal Overlay */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="gothic-panel-gold max-w-md w-full p-8 text-center bg-obsidian-900 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-lg">
            
            {combatWinner === 'player' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-emerald-950/50 border border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Award className="w-16 h-16 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold font-gothic tracking-widest text-emerald-400 gold-text-shimmer">ПОБЕДА!</h3>
                <p className="text-sm text-slate-300">
                  Вы одолели врага <strong className="text-slate-100">{bot.name}</strong> и вернулись с почетом! Ваша статистика побед обновлена в профиле.
                </p>
              </div>
            )}

            {combatWinner === 'bot' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-rose-950/50 border border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <SkullIcon className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold font-gothic tracking-widest text-rose-500">ПОРАЖЕНИЕ</h3>
                <p className="text-sm text-slate-300">
                  Вы пали под натиском бойца <strong className="text-slate-100">{bot.name}</strong>. Подлечите раны в хабе и попробуйте снова!
                </p>
              </div>
            )}

            {combatWinner === 'draw' && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-slate-900 border border-slate-500 text-slate-400">
                    <RefreshCw className="w-16 h-16" />
                  </div>
                </div>
                <h3 className="text-3xl font-extrabold font-gothic tracking-widest text-slate-400">НИЧЬЯ</h3>
                <p className="text-sm text-slate-300">
                  Взаимный нокаут! Вы и <strong className="text-slate-100">{bot.name}</strong> пали одновременно. Силы равны.
                </p>
              </div>
            )}

            <div className="pt-6 mt-6 border-t border-obsidian-800">
              <Button onClick={onExitCombat} fullWidth className="py-3">
                Вернуться в хаб
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Internal icon helper for skull
const SkullIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M12 2a8 8 0 0 0-8 8v1a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-1" />
    <path d="M12 2a8 8 0 0 1 8 8v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1" />
    <path d="M12 13v3" />
    <path d="M8 16h8" />
    <path d="m10 20 1-1h2l1 1v2H10z" />
  </svg>
);
