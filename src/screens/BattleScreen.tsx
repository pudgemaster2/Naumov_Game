import React, { useState, useEffect } from 'react';
import type { Character, CombatZone, CombatLogEntry } from '../types';
import { FighterCard } from '../components/FighterCard';
import { CombatLog } from '../components/CombatLog';
import { Button } from '../components/ui/Button';
import { Swords, Award, RefreshCw, ChevronLeft, Crosshair, ShieldAlert, Zap } from 'lucide-react';

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
  onUsePotion: (type: 'hp' | 'mp') => void;
  onUseScroll: (type: 'atk' | 'def' | 'dodge' | 'crit') => void;
  onSurrender: () => void;
  potionsUsedCount: number;
  activeScrollsState: {
    atk: boolean;
    def: boolean;
    dodge: boolean;
    crit: boolean;
  };
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
  onUsePotion,
  onUseScroll,
  onSurrender,
  potionsUsedCount,
  activeScrollsState,
}) => {
  const [isAutoBattle, setIsAutoBattle] = useState(false);

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

  // Turn off auto-battle when game is over
  useEffect(() => {
    if (isGameOver) {
      setIsAutoBattle(false);
    }
  }, [isGameOver]);

  // Auto-battle timer logic
  useEffect(() => {
    if (!isAutoBattle || isGameOver) return;

    let timer: any;

    if (playerChoices.attack === null || playerChoices.defense === null) {
      // Phase 1: Wait 1 second, then make selections
      timer = setTimeout(() => {
        const zones: CombatZone[] = ['head', 'chest', 'stomach', 'legs'];
        const randomAtk = zones[Math.floor(Math.random() * zones.length)];
        const randomDef = zones[Math.floor(Math.random() * zones.length)];
        onSelectChoice('attack', randomAtk);
        onSelectChoice('defense', randomDef);
      }, 1000);
    } else {
      // Phase 2: Wait 1 second (total 2s), then submit the turn
      timer = setTimeout(() => {
        onSubmitTurn();
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [isAutoBattle, playerChoices.attack, playerChoices.defense, isGameOver]);

  const zones: { key: CombatZone; label: string }[] = [
    { key: 'head', label: 'Голова' },
    { key: 'chest', label: 'Грудь' },
    { key: 'stomach', label: 'Живот' },
    { key: 'legs', label: 'Ноги' },
  ];

  const getInventoryCount = (type: string) => {
    return (player.inventory || []).filter(item => item.type === type).length;
  };

  const hpPotionsCount = getInventoryCount('potion_hp');
  const mpPotionsCount = getInventoryCount('potion_mp');
  const scrollAtkCount = getInventoryCount('scroll_atk');
  const scrollDefCount = getInventoryCount('scroll_def');
  const scrollDodgeCount = getInventoryCount('scroll_dodge');
  const scrollCritCount = getInventoryCount('scroll_crit');

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-6 animate-fade-in relative select-none">
      
      {/* Upper Navigation/Status Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <button
          onClick={onExitCombat}
          className="text-sm font-semibold text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5 font-mono uppercase cursor-pointer"
          disabled={!isGameOver && player.currentHp > 0 && bot.currentHp > 0}
          title={isGameOver ? 'Выйти в хаб' : 'Нельзя покинуть поле боя во время сражения!'}
        >
          <ChevronLeft className="w-5 h-5" /> Сбежать с арены
        </button>
        <div className="text-center">
          <span className="text-base md:text-lg font-bold font-gothic tracking-widest text-gold-400 uppercase">Поединок на арене</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* 3-Column Battle Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Column 1: Player Card */}
        <div className={`flex flex-col justify-between h-full ${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard
            fighter={player}
            isPlayer={true}
          />
        </div>

        {/* Column 2: Combat Choices, Auto-battle, Supplies (Center) */}
        <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg border-gold-700/30 flex flex-col justify-center space-y-6 h-full">
          
          {/* Battle Controls Toggles */}
          <div className="flex gap-3 border-b border-obsidian-800 pb-4">
            <button
              onClick={() => setIsAutoBattle(!isAutoBattle)}
              disabled={isGameOver}
              className={`flex-1 py-3 rounded border text-xs md:text-sm font-bold font-gothic tracking-wider uppercase cursor-pointer transition-all duration-200 ${
                isAutoBattle
                  ? 'bg-amber-600 border-amber-400 text-obsidian-950 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-obsidian-950 border-obsidian-800 text-amber-500 hover:border-amber-900/50 hover:bg-obsidian-900/40'
              }`}
            >
              {isAutoBattle ? '⏸️ Автобой вкл' : '▶️ Автобой'}
            </button>
            <button
              onClick={onSurrender}
              disabled={isGameOver}
              className="flex-1 py-3 rounded border border-rose-950 bg-obsidian-950 text-rose-500 hover:bg-rose-950/20 text-xs md:text-sm font-bold font-gothic tracking-wider uppercase cursor-pointer transition-colors"
            >
              🏳️ Сдаться
            </button>
          </div>

          {/* Active Scroll Buffs Row */}
          {(activeScrollsState.atk || activeScrollsState.def || activeScrollsState.dodge || activeScrollsState.crit) && (
            <div className="flex gap-2 justify-center flex-wrap">
              {activeScrollsState.atk && <span className="bg-rose-950/40 text-rose-455 border border-rose-500/30 text-xs px-2.5 py-1 rounded font-mono uppercase font-bold">Урон +10</span>}
              {activeScrollsState.def && <span className="bg-sky-950/40 text-sky-455 border border-sky-500/30 text-xs px-2.5 py-1 rounded font-mono uppercase font-bold">Защита +5</span>}
              {activeScrollsState.dodge && <span className="bg-emerald-950/40 text-emerald-455 border border-emerald-500/30 text-xs px-2.5 py-1 rounded font-mono uppercase font-bold">Уворот +15%</span>}
              {activeScrollsState.crit && <span className="bg-amber-950/40 text-amber-455 border border-amber-500/30 text-xs px-2.5 py-1 rounded font-mono uppercase font-bold">Крит +15%</span>}
            </div>
          )}

          {/* Combat Choices (Attacks / Blocks) */}
          {!isGameOver ? (
            <div className="space-y-5">
              {/* Attack Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Crosshair className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                  <span className="text-sm font-bold tracking-widest uppercase text-rose-400 font-gothic">Атака (Куда бить)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {zones.map((zone) => (
                    <button
                      key={`attack-${zone.key}`}
                      onClick={() => !isAutoBattle && onSelectChoice('attack', zone.key)}
                      disabled={isAutoBattle}
                      className={`py-3.5 px-2 text-sm font-semibold rounded border transition-all duration-150 uppercase tracking-widest font-gothic select-none ${
                        playerChoices.attack === zone.key
                          ? 'bg-rose-950/40 text-rose-300 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                          : 'bg-obsidian-950/80 text-slate-400 border-obsidian-800 hover:border-rose-900/60 hover:text-rose-400'
                      } ${isAutoBattle ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-sky-400" />
                  <span className="text-sm font-bold tracking-widest uppercase text-sky-400 font-gothic">Блок (Что защищать)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {zones.map((zone) => (
                    <button
                      key={`defense-${zone.key}`}
                      onClick={() => !isAutoBattle && onSelectChoice('defense', zone.key)}
                      disabled={isAutoBattle}
                      className={`py-3.5 px-2 text-sm font-semibold rounded border transition-all duration-150 uppercase tracking-widest font-gothic select-none ${
                        playerChoices.defense === zone.key
                          ? 'bg-sky-950/40 text-sky-300 border-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                          : 'bg-obsidian-950/80 text-slate-400 border-obsidian-800 hover:border-sky-900/60 hover:text-sky-400'
                      } ${isAutoBattle ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplies Inventory Panel */}
              <div className="border-t border-obsidian-800 pt-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-mono text-slate-455 uppercase font-bold">
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-gold-500" /> Боевые припасы</span>
                  <span className={potionsUsedCount >= 3 ? 'text-rose-455 font-bold' : 'text-slate-455'}>Зелья за бой: {potionsUsedCount}/3</span>
                </div>
                
                {/* Consumables Inventory List */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Health Potion */}
                  <button
                    onClick={() => onUsePotion('hp')}
                    disabled={hpPotionsCount === 0 || potionsUsedCount >= 3 || player.currentHp >= player.maxHp}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed"
                    title="Восстановить 50 HP (Максимум 3 зелья за бой)"
                  >
                    <span>🧪 Здоровье ({hpPotionsCount})</span>
                  </button>

                  {/* Mana Potion */}
                  <button
                    onClick={() => onUsePotion('mp')}
                    disabled={mpPotionsCount === 0 || potionsUsedCount >= 3 || player.currentMana >= player.maxMana}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed"
                    title="Восстановить 50 MP (Максимум 3 зелья за бой)"
                  >
                    <span>🧪 Мана ({mpPotionsCount})</span>
                  </button>

                  {/* Scroll Attack */}
                  <button
                    onClick={() => onUseScroll('atk')}
                    disabled={scrollAtkCount === 0 || activeScrollsState.atk}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed"
                    title="Свиток Ярости (+10 к урону)"
                  >
                    <span>📜 Свиток Урона ({scrollAtkCount})</span>
                  </button>

                  {/* Scroll Defense */}
                  <button
                    onClick={() => onUseScroll('def')}
                    disabled={scrollDefCount === 0 || activeScrollsState.def}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed"
                    title="Свиток Каменной Кожи (-5 к получаемому урону)"
                  >
                    <span>📜 Свиток Блока ({scrollDefCount})</span>
                  </button>

                  {/* Scroll Dodge */}
                  <button
                    onClick={() => onUseScroll('dodge')}
                    disabled={scrollDodgeCount === 0 || activeScrollsState.dodge}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate col-span-2 flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed mb-1"
                    title="Свиток Ветра (+15% уклонения)"
                  >
                    <span>📜 Свиток Уклонения ({scrollDodgeCount})</span>
                  </button>

                  {/* Scroll Crit */}
                  <button
                    onClick={() => onUseScroll('crit')}
                    disabled={scrollCritCount === 0 || activeScrollsState.crit}
                    className="p-3 rounded border border-obsidian-800 bg-obsidian-950 hover:bg-obsidian-900/40 text-xs font-bold text-slate-350 font-mono text-left truncate col-span-2 flex items-center justify-between gap-1 disabled:opacity-40 disabled:hover:bg-obsidian-950 cursor-pointer disabled:cursor-not-allowed"
                    title="Свиток Гнева (+15% крита)"
                  >
                    <span>📜 Свиток Крит. удара ({scrollCritCount})</span>
                  </button>
                </div>
              </div>

              {/* Ready check & Submit */}
              <div className="pt-4 border-t border-obsidian-800 space-y-3">
                <div className="flex justify-center gap-4 text-xs font-bold font-mono">
                  <span className={playerChoices.attack ? 'text-emerald-400' : 'text-slate-500'}>
                    {playerChoices.attack ? '✓ Атака выбрана' : '✗ Атака не выбрана'}
                  </span>
                  <span className={playerChoices.defense ? 'text-emerald-400' : 'text-slate-500'}>
                    {playerChoices.defense ? '✓ Блок выбран' : '✗ Блок не выбран'}
                  </span>
                </div>

                <Button
                  onClick={onSubmitTurn}
                  disabled={!isTurnReady || isAutoBattle}
                  fullWidth
                  className="py-4.5 text-base flex justify-center items-center gap-2"
                >
                  <Swords className="w-5.5 h-5.5" />
                  УДАРИТЬ (ХОД)
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <p className="text-sm font-mono text-slate-400">Сражение завершено.</p>
              <Button onClick={onExitCombat} fullWidth size="md">
                Вернуться в хаб
              </Button>
            </div>
          )}
        </div>

        {/* Column 3: Bot Card */}
        <div className={`flex flex-col justify-between h-full ${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard
            fighter={bot}
            isPlayer={false}
          />
        </div>

      </div>

      {/* Battle Log (bottom third) */}
      <div className="w-full">
        <CombatLog logs={combatLogs} playerName={player.name} botName={bot.name} />
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
