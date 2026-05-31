import React, { useState } from 'react';
import type { Character } from '../types';
import { CLASS_TEMPLATES, RACE_TEMPLATES } from '../types';
import { Button } from './ui/Button';
import { Heart, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

interface TempleViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const TempleView: React.FC<TempleViewProps> = ({ player, onSave, onBack }) => {
  const [templeLog, setTempleLog] = useState<string | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  // Heal player
  const handleHeal = async () => {
    if (player.currentHp >= player.maxHp) {
      setTempleLog('Священник: «Твоё тело здорово, воин. Благословение уже озаряет твой разум, нет нужды лечить раны.»');
      return;
    }

    const cost = 5;
    if (player.gold < cost) {
      setTempleLog('Священник: «Твой дух силен, но для обряда курений требуется хотя бы 5 золотых монет. Однако, поскольку у тебя совсем пусто в карманах, я исцелю тебя во имя Света!»');
    }

    setIsCasting(true);
    setTimeout(async () => {
      const goldCost = player.gold >= cost ? cost : 0;
      const updatedPlayer: Character = {
        ...player,
        gold: player.gold - goldCost,
        currentHp: player.maxHp,
      };

      await onSave(updatedPlayer);
      setIsCasting(false);
      setTempleLog('✨ Жрец омывает ваши раны святой водой из водопада. Теплый свет окутывает вас, затягивая порезы. Ваше здоровье полностью восстановлено!');
    }, 800);
  };

  // Get blessing of intellect
  const handleGetBlessing = async () => {
    const cost = 15;
    if (player.gold < cost) {
      setTempleLog('💰 У вас недостаточно золота для подношения алтарю (требуется 15 золотых монет).');
      return;
    }

    setIsCasting(true);
    setTimeout(async () => {
      const updatedPlayer: Character = {
        ...player,
        gold: player.gold - cost,
        activeBuff: {
          name: 'Святое благословение Храма',
          type: 'intellect',
          value: 5,
          fightsLeft: 3,
        },
      };

      await onSave(updatedPlayer);
      setIsCasting(false);
      setTempleLog('✨ Вы преклоняете колено перед алтарем Воды. Древняя мудрость наполняет ваш разум. Получено благословение: +5 к Интеллекту на 3 боя.');
    }, 800);
  };

  // Reset blacksmith upgrades and refund gold
  const handleResetUpgrades = async () => {
    const upgrades = player.upgrades || {};
    let totalRefund = 0;

    // Calculate how much was spent
    // e.g. for level X, costs were: 25 * 1 + 25 * 2 + ... + 25 * X = 25 * X * (X+1) / 2
    Object.keys(upgrades).forEach((key) => {
      const level = upgrades[key] || 0;
      if (level > 0) {
        totalRefund += 25 * (level * (level + 1)) / 2;
      }
    });

    if (totalRefund === 0) {
      setTempleLog('Священник: «Ты еще не совершал пожертвований в кузнице. У тебя нет улучшений для сброса!»');
      return;
    }

    const costToReset = 10;
    if (player.gold < costToReset) {
      setTempleLog('💰 У вас недостаточно золота для проведения ритуала очищения (требуется 10 золотых).');
      return;
    }

    setIsCasting(true);
    setTimeout(async () => {
      // Get base template stats
      const raceStats = RACE_TEMPLATES[player.race].baseStats;
      const classModifiers = CLASS_TEMPLATES[player.classType].statModifiers;
      const levelDiff = player.level - 1;
      
      const resetStats = {
        strength: raceStats.strength + classModifiers.strength + levelDiff,
        agility: raceStats.agility + classModifiers.agility + levelDiff,
        endurance: raceStats.endurance + classModifiers.endurance + levelDiff,
        intellect: raceStats.intellect + classModifiers.intellect + levelDiff,
      };

      const resetMaxHp = resetStats.endurance * 10;

      const updatedPlayer: Character = {
        ...player,
        gold: player.gold + totalRefund - costToReset,
        stats: resetStats,
        maxHp: resetMaxHp,
        currentHp: Math.min(player.currentHp, resetMaxHp),
        upgrades: {}, // clear upgrades object
      };

      await onSave(updatedPlayer);
      setIsCasting(false);
      setTempleLog(`✨ Алтарь Воды очистил ваше снаряжение от чар кузнеца. Характеристики сброшены к начальным. Вам возвращено 💰 ${totalRefund} золота (за вычетом 10 золотых за обряд)!`);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🏛️ ХРАМ ВОДЫ
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Очистите дух под струями целебного источника у Жреца Селестиана
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} className="text-xs">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Priest */}
        <div className="space-y-4">
          <div className="gothic-panel p-5 bg-obsidian-900/80 rounded-lg flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-obsidian-950 border border-gold-600/30 rounded-full flex items-center justify-center text-5xl mb-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
              🧝
              <div className="absolute -bottom-1 -right-1 bg-gold-600 text-obsidian-950 p-1 rounded-full text-xs font-bold">
                ✨
              </div>
            </div>
            
            <h3 className="text-base font-bold font-gothic text-slate-200">Жрец Селестиан</h3>
            <p className="text-xs text-slate-400 mt-2 italic">
              «Да пребудет с тобой благодать Воды, дитя моё. Если ранено твоё тело, я излечу его. Если запутался разум — благословение источника вернет ясность. А если хочешь изменить путь силы — купель очистит твой доспех.»
            </p>

            <div className="w-full mt-6 p-3 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-xs flex justify-between items-center text-slate-300">
              <span>Жертвенный мешочек:</span>
              <span className="text-amber-400 font-bold text-sm">💰 {player.gold} золота</span>
            </div>

            {player.activeBuff && (
              <div className="w-full mt-4 p-3 bg-gold-950/20 border border-gold-900/30 rounded text-left space-y-1">
                <span className="text-[10px] font-mono text-gold-400 uppercase tracking-widest block font-bold">Активный эффект:</span>
                <p className="text-xs text-slate-200 font-bold">{player.activeBuff.name}</p>
                <p className="text-[10px] text-slate-400">
                  {player.activeBuff.type === 'strength' ? 'Сила' : 'Интеллект'} +{player.activeBuff.value} (Осталось боев: {player.activeBuff.fightsLeft})
                </p>
              </div>
            )}
          </div>

          {/* Temple Dialogue log */}
          {templeLog && (
            <div className="p-4 border border-blue-900/30 rounded bg-blue-950/10 text-xs text-blue-300 font-serif leading-relaxed animate-fade-in flex gap-2">
              <MessageSquare className="w-4 h-4 flex-shrink-0 text-blue-400 mt-0.5" />
              <span>{templeLog}</span>
            </div>
          )}
        </div>

        {/* Right Column: Temple Altars */}
        <div className="md:col-span-2 space-y-6">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-base font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2">
              Священные Обряды
            </h3>

            <div className="space-y-4">
              {/* Heal Action */}
              <div className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 text-rose-500 rounded">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Омовение Целебным Источником</h4>
                    <p className="text-xs text-slate-400 mt-1">Очистите тело от ядов и исцелите раны. Полностью восстанавливает HP.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-amber-400">💰 5 золота</span>
                  <Button 
                    onClick={handleHeal} 
                    disabled={isCasting}
                    size="sm"
                  >
                    Излечиться
                  </Button>
                </div>
              </div>

              {/* Bless Action */}
              <div className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-950/30 border border-blue-900/40 text-blue-400 rounded">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Благословение Интеллекта</h4>
                    <p className="text-xs text-slate-400 mt-1">Жрец озаряет ваш ум священным песнопением. Наполняет разум силой магии.</p>
                    <span className="inline-block mt-1 text-[10px] text-sky-400 font-bold bg-sky-950/30 border border-sky-900/40 px-2 py-0.5 rounded">
                      Эффект: +5 Интеллекта (3 боя)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-amber-400">💰 15 золота</span>
                  <Button 
                    onClick={handleGetBlessing} 
                    disabled={isCasting || player.gold < 15}
                    size="sm"
                  >
                    Благословиться
                  </Button>
                </div>
              </div>

              {/* Reset Action */}
              <div className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-950/30 border border-amber-900/40 text-amber-500 rounded">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Сброс Улучшений (Ритуал Очищения)</h4>
                    <p className="text-xs text-slate-400 mt-1">Очистить снаряжение от улучшений кузнеца и вернуть потраченное на них золото.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-amber-400">💰 10 золота</span>
                  <Button 
                    onClick={handleResetUpgrades} 
                    disabled={isCasting || player.gold < 10}
                    size="sm"
                  >
                    Сбросить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
