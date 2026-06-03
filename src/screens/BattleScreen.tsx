import React, { useState, useEffect } from 'react';
import type { Character, CombatZone, CombatLogEntry } from '../types';
import { FighterCard } from '../components/FighterCard';
import { CombatLog } from '../components/CombatLog';
import { Button } from '../components/ui/Button';
import { Swords, Award, RefreshCw, Crosshair, ShieldAlert } from 'lucide-react';
import { getItemImage } from '../utils/itemHelper';

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
  combatSummary: {
    goldReward: number;
    expReward: number;
    damageDealt: number;
    damageReceived: number;
    damageBlocked: number;
    lastTurnDamageDealt: number;
    lastTurnDamageReceived: number;
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
  combatSummary,
}) => {
  const [isAutoBattle, setIsAutoBattle] = useState(false);
  const [isBeltOpen, setIsBeltOpen] = useState(false);

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
  const hasCombatBelt = !!player.equipment?.spellbook;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-6 animate-fade-in relative select-none">
      
      {/* Upper Navigation/Status Header */}
      <div className="flex justify-center items-center border-b border-slate-350 pb-4">
        <div className="text-center">
          <span className="text-lg md:text-xl font-black font-gothic tracking-widest text-rose-955 uppercase">Поединок на арене</span>
        </div>
      </div>

      {/* 3-Column Battle Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Column 1: Player Card & Combat Belt */}
        <div className={`flex flex-col gap-4 ${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard fighter={player} />
          
          {/* Боевой пояс (Combat Belt) */}
          {hasCombatBelt ? (
            <div className="gothic-panel p-4 bg-obsidian-950/85 border-gold-700/40 rounded-xl shadow-lg space-y-3">
              <button
                onClick={() => setIsBeltOpen(!isBeltOpen)}
                disabled={isGameOver}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-obsidian-700 bg-obsidian-900/60 hover:bg-obsidian-800/80 transition-all duration-200 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-950/40 rounded border border-amber-600/30 text-amber-500 group-hover:text-amber-400 transition-colors">
                    🎒
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold uppercase tracking-wider text-slate-200 group-hover:text-gold-300 font-gothic transition-colors">Боевой пояс</div>
                    <div className="text-[10px] text-slate-400 font-mono">Зелья за бой: {potionsUsedCount}/3</div>
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-gold-400 transition-colors font-mono text-xs">
                  {isBeltOpen ? '▼ Свернуть' : '▲ Открыть'}
                </span>
              </button>

              {isBeltOpen && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-obsidian-800/60 animate-fade-in">
                  {/* Health Potion */}
                  <button
                    onClick={() => onUsePotion('hp')}
                    disabled={hpPotionsCount === 0 || potionsUsedCount >= 3 || player.currentHp >= player.maxHp}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Восстановить 50 HP (Максимум 3 зелья за бой)"
                  >
                    <img src={getItemImage('potion_hp')} alt="HP Potion" className="w-4 h-4 object-contain inline-block" />
                    <span>Здоровье ({hpPotionsCount})</span>
                  </button>

                  {/* Mana Potion */}
                  <button
                    onClick={() => onUsePotion('mp')}
                    disabled={mpPotionsCount === 0 || potionsUsedCount >= 3 || player.currentMana >= player.maxMana}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Восстановить 50 MP (Максимум 3 зелья за бой)"
                  >
                    <img src={getItemImage('potion_mp')} alt="MP Potion" className="w-4 h-4 object-contain inline-block" />
                    <span>Мана ({mpPotionsCount})</span>
                  </button>

                  {/* Scroll Attack */}
                  <button
                    onClick={() => onUseScroll('atk')}
                    disabled={scrollAtkCount === 0 || activeScrollsState.atk}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Свиток Ярости (+10 к урону)"
                  >
                    <img src={getItemImage('scroll_atk')} alt="Scroll Atk" className="w-4 h-4 object-contain inline-block" />
                    <span>Урон ({scrollAtkCount})</span>
                  </button>

                  {/* Scroll Defense */}
                  <button
                    onClick={() => onUseScroll('def')}
                    disabled={scrollDefCount === 0 || activeScrollsState.def}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    title="Свиток Каменной Кожи (-5 к получаемому урону)"
                  >
                    <img src={getItemImage('scroll_def')} alt="Scroll Def" className="w-4 h-4 object-contain inline-block" />
                    <span>Блок ({scrollDefCount})</span>
                  </button>

                  {/* Scroll Dodge */}
                  <button
                    onClick={() => onUseScroll('dodge')}
                    disabled={scrollDodgeCount === 0 || activeScrollsState.dodge}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed col-span-2"
                    title="Свиток Ветра (+15% уклонения)"
                  >
                    <img src={getItemImage('scroll_dodge')} alt="Scroll Dodge" className="w-4 h-4 object-contain inline-block" />
                    <span>Уклонение ({scrollDodgeCount})</span>
                  </button>

                  {/* Scroll Crit */}
                  <button
                    onClick={() => onUseScroll('crit')}
                    disabled={scrollCritCount === 0 || activeScrollsState.crit}
                    className="p-2.5 rounded border border-obsidian-750 bg-obsidian-900/40 hover:bg-obsidian-800/60 text-xs font-bold text-slate-200 font-mono text-left truncate flex items-center gap-1.5 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed col-span-2"
                    title="Свиток Гнева (+15% крита)"
                  >
                    <img src={getItemImage('scroll_crit')} alt="Scroll Crit" className="w-4 h-4 object-contain inline-block" />
                    <span>Крит. удар ({scrollCritCount})</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="gothic-panel p-4 bg-obsidian-950/40 border-rose-950/30 rounded-xl shadow-md text-center text-rose-500/80 text-xs font-mono py-6">
              🎒 Боевой пояс не надет.<br/>Использование зелий и свитков в бою заблокировано.
            </div>
          )}
        </div>

        {/* Column 2: Combat Choices, Auto-battle, Strike Button, and raised Combat Log (Center) */}
        <div className="flex flex-col gap-4 h-full">
          
          {/* Top Panel: Selections and Action buttons */}
          <div className="gothic-panel p-5 bg-obsidian-900/80 rounded-lg border-gold-700/30 flex flex-col justify-center space-y-4">
            {/* Battle Controls Toggles */}
            <div className="flex gap-3 border-b border-obsidian-800 pb-4">
              <button
                onClick={() => setIsAutoBattle(!isAutoBattle)}
                disabled={isGameOver}
                className={`flex-1 py-3 rounded border text-xs md:text-sm font-bold font-gothic tracking-wider uppercase cursor-pointer transition-all duration-250 ${
                  isAutoBattle
                    ? 'bg-amber-500 border-amber-400 text-slate-955 shadow-[0_0_12px_rgba(245,158,11,0.35)] animate-pulse'
                    : 'bg-slate-800 border-slate-700 text-amber-500 hover:bg-slate-750 hover:border-amber-500/40'
                }`}
              >
                {isAutoBattle ? '⏸️ Автобой вкл' : '▶️ Автобой'}
              </button>
              <button
                onClick={onSurrender}
                disabled={isGameOver}
                className="flex-1 py-3 rounded border border-slate-700 bg-slate-800 text-rose-500 hover:bg-slate-750 hover:border-rose-500/40 text-xs md:text-sm font-bold font-gothic tracking-wider uppercase cursor-pointer transition-all duration-250"
              >
                🏳️ Сдаться
              </button>
            </div>

            {/* Active Scroll Buffs Row */}
            {(activeScrollsState.atk || activeScrollsState.def || activeScrollsState.dodge || activeScrollsState.crit) && (
              <div className="flex gap-2 justify-center flex-wrap">
                {activeScrollsState.atk && <span className="bg-rose-100 text-rose-800 border border-rose-300 text-xs px-2.5 py-1 rounded font-mono font-bold shadow-sm">Урон +10</span>}
                {activeScrollsState.def && <span className="bg-sky-100 text-sky-850 border border-sky-300 text-xs px-2.5 py-1 rounded font-mono font-bold shadow-sm">Защита +5</span>}
                {activeScrollsState.dodge && <span className="bg-emerald-100 text-emerald-850 border border-emerald-300 text-xs px-2.5 py-1 rounded font-mono font-bold shadow-sm">Уворот +15%</span>}
                {activeScrollsState.crit && <span className="bg-amber-100 text-amber-850 border border-amber-300 text-xs px-2.5 py-1 rounded font-mono font-bold shadow-sm">Крит +15%</span>}
              </div>
            )}

            {/* Combat Choices (Attacks / Blocks) */}
            {!isGameOver ? (
              <div className="space-y-4">
                {/* Attack Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span className="text-xs font-bold tracking-widest uppercase text-rose-500 font-gothic">Атака (Куда бить)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((zone) => (
                      <button
                        key={`attack-${zone.key}`}
                        onClick={() => !isAutoBattle && onSelectChoice('attack', zone.key)}
                        disabled={isAutoBattle}
                        className={`py-2 px-2 text-xs font-bold rounded border transition-all duration-200 uppercase tracking-widest font-gothic select-none ${
                          playerChoices.attack === zone.key
                            ? 'bg-gradient-to-r from-rose-600 to-rose-700 border-2 border-rose-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.45)] scale-[1.02]'
                            : 'bg-slate-800 border border-slate-750 text-slate-100 hover:bg-slate-750 hover:border-rose-800 hover:text-rose-400'
                        } ${isAutoBattle ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {zone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Block Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold tracking-widest uppercase text-sky-500 font-gothic">Блок (Что защищать)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {zones.map((zone) => (
                      <button
                        key={`defense-${zone.key}`}
                        onClick={() => !isAutoBattle && onSelectChoice('defense', zone.key)}
                        disabled={isAutoBattle}
                        className={`py-2 px-2 text-xs font-bold rounded border transition-all duration-200 uppercase tracking-widest font-gothic select-none ${
                          playerChoices.defense === zone.key
                            ? 'bg-gradient-to-r from-sky-600 to-sky-700 border-2 border-sky-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.45)] scale-[1.02]'
                            : 'bg-slate-800 border border-slate-750 text-slate-100 hover:bg-slate-750 hover:border-sky-850 hover:text-sky-400'
                        } ${isAutoBattle ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {zone.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ready check & Submit */}
                <div className="pt-3 border-t border-obsidian-800 space-y-2">
                  <div className="flex justify-center gap-4 text-[11px] font-bold font-mono">
                    <span className={playerChoices.attack ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                      {playerChoices.attack ? '✓ Атака выбрана' : '✗ Атака не выбрана'}
                    </span>
                    <span className={playerChoices.defense ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                      {playerChoices.defense ? '✓ Блок выбран' : '✗ Блок не выбран'}
                    </span>
                  </div>

                  <button
                    onClick={onSubmitTurn}
                    disabled={!isTurnReady || isAutoBattle}
                    className={`w-full py-3.5 rounded-lg text-sm font-bold font-gothic tracking-widest flex justify-center items-center gap-2 transition-all duration-300 shadow-md ${
                      !isTurnReady || isAutoBattle
                        ? 'bg-slate-200 border border-slate-350 text-slate-450 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 border border-gold-600 text-slate-950 hover:from-amber-600 hover:to-amber-700 hover:shadow-[0_0_15px_rgba(217,119,6,0.4)] cursor-pointer active:scale-95'
                    }`}
                  >
                    <Swords className="w-5 h-5" />
                    УДАРИТЬ (ХОД)
                  </button>
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

          {/* Bottom Panel: Raised Combat Log */}
          <div className="flex-1 min-h-[220px] h-0 flex flex-col">
            <CombatLog logs={combatLogs} playerName={player.name} botName={bot.name} />
          </div>
        </div>

        {/* Column 3: Bot Card */}
        <div className={`flex flex-col h-full ${isGameOver ? 'opacity-70' : ''}`}>
          <FighterCard
            fighter={bot}
          />
        </div>
      </div>

      {/* Game Over Modal Overlay */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="gothic-panel-gold max-w-md w-full p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-lg">
            
            {combatWinner === 'player' && (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="p-4 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Award className="w-14 h-14 animate-bounce" />
                  </div>
                </div>
                <h3 className="text-3xl font-black font-gothic tracking-widest text-emerald-900">ПОБЕДА!</h3>
                <p className="text-sm font-sans font-medium text-slate-900 leading-relaxed">
                  Вы одолели врага <strong className="text-slate-950 font-bold">{bot.name}</strong> и вернулись с почетом! Ваша статистика побед обновлена в профиле.
                </p>
              </div>
            )}

            {combatWinner === 'bot' && (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="p-4 rounded-full bg-rose-100 border-2 border-rose-400 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                    <SkullIcon className="w-14 h-14" />
                  </div>
                </div>
                <h3 className="text-3xl font-black font-gothic tracking-widest text-rose-900">ПОРАЖЕНИЕ</h3>
                <p className="text-sm font-sans font-medium text-slate-900 leading-relaxed">
                  Вы пали под натиском бойца <strong className="text-slate-950 font-bold">{bot.name}</strong>. Подлечите раны в хабе и попробуйте снова!
                </p>
              </div>
            )}

            {combatWinner === 'draw' && (
              <div className="space-y-4">
                <div className="flex justify-center mb-2">
                  <div className="p-4 rounded-full bg-slate-200 border-2 border-slate-455 text-slate-600">
                    <RefreshCw className="w-14 h-14" />
                  </div>
                </div>
                <h3 className="text-3xl font-black font-gothic tracking-widest text-slate-900">НИЧЬЯ</h3>
                <p className="text-sm font-sans font-medium text-slate-900 leading-relaxed">
                  Взаимный нокаут! Вы и <strong className="text-slate-950 font-bold">{bot.name}</strong> пали одновременно. Силы равны.
                </p>
              </div>
            )}

            {/* Battle Stats Summary Table */}
            <div className="mt-6 p-4.5 border border-gold-700/30 rounded bg-obsidian-950/90 text-left space-y-3.5 select-none">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-500 font-gothic border-b border-obsidian-850 pb-2 flex justify-between items-center">
                <span>Итоги сражения</span>
                <span className="text-[10px] font-mono font-normal text-slate-400 capitalize">
                  {combatWinner === 'player' ? 'победа' : combatWinner === 'bot' ? 'поражение' : 'ничья'}
                </span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1.5">
                  <span className="text-slate-400">Получено золота:</span>
                  <span className="text-amber-400 font-bold">+{combatSummary.goldReward} 🪙</span>
                </div>
                <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1.5">
                  <span className="text-slate-400">Получено опыта:</span>
                  <span className="text-purple-400 font-bold">+{combatSummary.expReward} XP</span>
                </div>
                <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1.5">
                  <span className="text-slate-400">Нанесено урона:</span>
                  <span className="text-emerald-400 font-bold">{combatSummary.damageDealt}</span>
                </div>
                <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1.5">
                  <span className="text-slate-400">Получено урона:</span>
                  <span className="text-rose-400 font-bold">{combatSummary.damageReceived}</span>
                </div>
                <div className="flex justify-between items-center border-b border-obsidian-850/50 pb-1.5">
                  <span className="text-slate-400">Заблокировано урона:</span>
                  <span className="text-sky-400 font-bold">{combatSummary.damageBlocked}</span>
                </div>
                <div className="flex justify-between items-center pb-0.5">
                  <span className="text-slate-400">Последний ход:</span>
                  <span className="text-slate-200">
                    <span className="text-emerald-400 font-bold">+{combatSummary.lastTurnDamageDealt}</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-rose-455 font-bold">-{combatSummary.lastTurnDamageReceived}</span>
                  </span>
                </div>
              </div>
            </div>

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
