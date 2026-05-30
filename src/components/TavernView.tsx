import React, { useState } from 'react';
import type { Character } from '../types';
import { Button } from './ui/Button';
import { CupSoda, Dices, Coins, MessageSquare } from 'lucide-react';

interface TavernViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const TavernView: React.FC<TavernViewProps> = ({ player, onSave, onBack }) => {
  const [tavernLog, setTavernLog] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlayingDice, setIsPlayingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<{
    playerDice: [number, number];
    dealerDice: [number, number];
    playerSum: number;
    dealerSum: number;
    outcome: 'win' | 'lose' | 'draw';
  } | null>(null);

  // Buy Mead Buff
  const handleBuyMead = async () => {
    const cost = 15;
    if (player.gold < cost) {
      setTavernLog('💰 У вас не хватает золота! Эль стоит 15 золотых монет.');
      return;
    }

    const updatedPlayer: Character = {
      ...player,
      gold: player.gold - cost,
      activeBuff: {
        name: 'Крепкий Эль Грэма',
        type: 'strength',
        value: 5,
        fightsLeft: 3,
      },
    };

    await onSave(updatedPlayer);
    setTavernLog('🍺 Буль-буль! Вы осушили кружку эля Грэма. Голова кружится, но мышцы наливаются силой! Получен бафф: +5 к Силе на 3 боя.');
  };

  // Play Dice Game
  const handlePlayDice = async () => {
    if (player.gold < betAmount) {
      setTavernLog('💰 Недостаточно золота для совершения такой ставки!');
      return;
    }

    setIsPlayingDice(true);
    setDiceResult(null);

    setTimeout(async () => {
      const p1 = Math.floor(Math.random() * 6) + 1;
      const p2 = Math.floor(Math.random() * 6) + 1;
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;

      const playerSum = p1 + p2;
      const dealerSum = d1 + d2;

      let outcome: 'win' | 'lose' | 'draw' = 'draw';
      let goldChange = 0;

      if (playerSum > dealerSum) {
        outcome = 'win';
        goldChange = betAmount; // win back double
      } else if (playerSum < dealerSum) {
        outcome = 'lose';
        goldChange = -betAmount;
      }

      const updatedPlayer: Character = {
        ...player,
        gold: player.gold + goldChange,
      };

      await onSave(updatedPlayer);
      setIsPlayingDice(false);
      setDiceResult({
        playerDice: [p1, p2],
        dealerDice: [d1, d2],
        playerSum,
        dealerSum,
        outcome,
      });

      if (outcome === 'win') {
        setTavernLog(`🎲 Вы выиграли! Ваши кости выпали лучше. Вы выиграли 💰 ${betAmount} золотых монет.`);
      } else if (outcome === 'lose') {
        setTavernLog(`🎲 Поражение! Трактирщик выбросил больше очков. Вы проиграли 💰 ${betAmount} золотых.`);
      } else {
        setTavernLog(`🎲 Ничья! Очки совпали. Ставка возвращена.`);
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🍺 ТАВЕРНА «У ДЕРЕВА»
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Отдохните у теплого камина и сыграйте в кости с трактирщиком Грэмом
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} className="text-xs">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Tavernkeeper and Beer shop */}
        <div className="space-y-4">
          <div className="gothic-panel p-5 bg-obsidian-900/80 rounded-lg flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-obsidian-950 border border-gold-600/30 rounded-full flex items-center justify-center text-5xl mb-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
              🍻
              <div className="absolute -bottom-1 -right-1 bg-gold-600 text-obsidian-950 p-1 rounded-full text-xs font-bold">
                🧑‍🍳
              </div>
            </div>
            
            <h3 className="text-base font-bold font-gothic text-slate-200">Трактирщик Грэм</h3>
            <p className="text-xs text-slate-400 mt-2 italic">
              «Добро пожаловать в приют путников! Устал от битв на Арене? Выпей кружку моего фирменного эля или сыграй в кости на золото! Мои кубики всегда честны!»
            </p>

            <div className="w-full mt-6 p-3 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-xs flex justify-between items-center text-slate-300">
              <span>Золото в кармане:</span>
              <span className="text-amber-400 font-bold text-sm">💰 {player.gold} золота</span>
            </div>

            {player.activeBuff && (
              <div className="w-full mt-4 p-3 bg-gold-950/20 border border-gold-900/30 rounded text-left space-y-1">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block font-bold">Активный эффект:</span>
                <p className="text-xs text-slate-200 font-bold">{player.activeBuff.name}</p>
                <p className="text-[10px] text-slate-400">Сила +{player.activeBuff.value} (Осталось боев: {player.activeBuff.fightsLeft})</p>
              </div>
            )}
          </div>

          {/* Action Logs */}
          {tavernLog && (
            <div className="p-4 border border-gold-900/20 rounded bg-obsidian-950/60 text-xs text-slate-300 leading-relaxed font-serif animate-fade-in flex gap-2">
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-gold-500 mt-0.5" />
              <span>{tavernLog}</span>
            </div>
          )}
        </div>

        {/* Center/Right Column: Tavern Services (Bar & Dice) */}
        <div className="md:col-span-2 space-y-6">
          {/* Bar Counter (Buy Buffs) */}
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-base font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2 flex items-center gap-2">
              <CupSoda className="w-5 h-5 text-gold-500" /> Барная Стойка
            </h3>
            
            <div className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200">Медовуха Грэма (Эль силы)</h4>
                <p className="text-xs text-slate-400 mt-1">Особый хмельной напиток, увеличивающий силу на 3 предстоящих боя.</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded">
                  Эффект: +5 Силы (3 боя)
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-amber-400">
                  💰 15 золота
                </span>
                <Button 
                  onClick={handleBuyMead} 
                  disabled={player.gold < 15}
                  size="sm"
                >
                  Купить кружку
                </Button>
              </div>
            </div>
          </div>

          {/* Dice Game Section */}
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-base font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2 flex items-center gap-2">
              <Dices className="w-5 h-5 text-gold-500" /> Игра в Кости (Азартный стол)
            </h3>
            
            <div className="p-4 border border-obsidian-800 rounded bg-obsidian-950/40 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Бросьте вызов Грэму</h4>
                  <p className="text-xs text-slate-400 mt-1">Угадайте, чья сумма на кубиках окажется больше. Победитель удваивает ставку!</p>
                </div>
                
                {/* Bet Selectors */}
                <div className="flex gap-2">
                  {[5, 10, 20].map((val) => (
                    <button
                      key={val}
                      onClick={() => setBetAmount(val)}
                      disabled={isPlayingDice}
                      className={`px-3 py-1.5 rounded font-mono text-xs border transition-colors ${
                        betAmount === val 
                          ? 'border-gold-500 bg-gold-900/20 text-gold-400 font-bold' 
                          : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                      }`}
                    >
                      💰 {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dice board */}
              {diceResult && (
                <div className="grid grid-cols-2 gap-4 text-center p-3 bg-obsidian-950/80 border border-obsidian-800 rounded animate-fade-in">
                  <div className="space-y-2 border-r border-obsidian-800/60 pr-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Вы бросили</div>
                    <div className="flex justify-center gap-3 text-3xl">
                      <span>{diceResult.playerDice[0] === 1 ? '⚀' : diceResult.playerDice[0] === 2 ? '⚁' : diceResult.playerDice[0] === 3 ? '⚂' : diceResult.playerDice[0] === 4 ? '⚃' : diceResult.playerDice[0] === 5 ? '⚄' : '⚅'}</span>
                      <span>{diceResult.playerDice[1] === 1 ? '⚀' : diceResult.playerDice[1] === 2 ? '⚁' : diceResult.playerDice[1] === 3 ? '⚂' : diceResult.playerDice[1] === 4 ? '⚃' : diceResult.playerDice[1] === 5 ? '⚄' : '⚅'}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200">Сумма: {diceResult.playerSum}</div>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Трактирщик бросил</div>
                    <div className="flex justify-center gap-3 text-3xl text-rose-400">
                      <span>{diceResult.dealerDice[0] === 1 ? '⚀' : diceResult.dealerDice[0] === 2 ? '⚁' : diceResult.dealerDice[0] === 3 ? '⚂' : diceResult.dealerDice[0] === 4 ? '⚃' : diceResult.dealerDice[0] === 5 ? '⚄' : '⚅'}</span>
                      <span>{diceResult.dealerDice[1] === 1 ? '⚀' : diceResult.dealerDice[1] === 2 ? '⚁' : diceResult.dealerDice[1] === 3 ? '⚂' : diceResult.dealerDice[1] === 4 ? '⚃' : diceResult.dealerDice[1] === 5 ? '⚄' : '⚅'}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-200">Сумма: {diceResult.dealerSum}</div>
                  </div>
                </div>
              )}

              {/* Game state buttons */}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handlePlayDice}
                  disabled={isPlayingDice || player.gold < betAmount}
                  fullWidth
                  className="py-3 flex justify-center items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  {isPlayingDice ? 'Кубики крутятся...' : `Поставить 💰 ${betAmount} золота и Бросить Кости`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
