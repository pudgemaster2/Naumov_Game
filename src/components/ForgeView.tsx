import React, { useState } from 'react';
import type { Character } from '../types';
import { Button } from './ui/Button';
import { Hammer, Sparkles, Swords, Shield, Heart, Zap } from 'lucide-react';

interface ForgeViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const ForgeView: React.FC<ForgeViewProps> = ({ player, onSave, onBack }) => {
  const [upgradingAttr, setUpgradingAttr] = useState<string | null>(null);
  const [forgeLog, setForgeLog] = useState<string | null>(null);

  const getUpgradeLevel = (attr: string) => {
    return player.upgrades?.[attr] || 0;
  };

  const getUpgradeCost = (attr: string) => {
    const level = getUpgradeLevel(attr);
    return (level + 1) * 25; // 25, 50, 75, 100 gold...
  };

  const handleUpgrade = async (attr: 'strength' | 'agility' | 'endurance' | 'intellect') => {
    const cost = getUpgradeCost(attr);
    if (player.gold < cost) {
      setForgeLog('Недостаточно золота в кошельке для этого улучшения!');
      return;
    }

    setUpgradingAttr(attr);
    setForgeLog(null);

    // Simulate blacksmith hammering
    setTimeout(async () => {
      const upgrades = { ...player.upgrades };
      upgrades[attr] = (upgrades[attr] || 0) + 1;

      const stats = { ...player.stats };
      stats[attr] = stats[attr] + 1;

      let maxHp = player.maxHp;
      let currentHp = player.currentHp;
      
      if (attr === 'endurance') {
        maxHp = stats.endurance * 10;
        // Heal by the amount of HP gained
        currentHp = currentHp + 10;
      }

      const updatedPlayer: Character = {
        ...player,
        gold: player.gold - cost,
        stats,
        maxHp,
        currentHp,
        upgrades,
      };

      const attrNames: Record<string, string> = {
        strength: 'Сила',
        agility: 'Ловкость',
        endurance: 'Выносливость',
        intellect: 'Интеллект',
      };

      await onSave(updatedPlayer);
      setUpgradingAttr(null);
      setForgeLog(`🔨 БУМ! КЛАЦ! Кузнец перековал снаряжение. Ваша характеристика «${attrNames[attr]}» навсегда увеличена на +1!`);
    }, 800);
  };

  const attributes = [
    { key: 'strength', name: 'Сила', icon: <Swords className="w-5 h-5 text-rose-500" />, desc: 'Увеличивает урон воинов в бою.' },
    { key: 'agility', name: 'Ловкость', icon: <Shield className="w-5 h-5 text-emerald-500" />, desc: 'Увеличивает шанс уворота и крита.' },
    { key: 'endurance', name: 'Выносливость', icon: <Heart className="w-5 h-5 text-red-500" />, desc: 'Увеличивает максимальное здоровье (+10 HP за единицу).' },
    { key: 'intellect', name: 'Интеллект', icon: <Zap className="w-5 h-5 text-sky-500" />, desc: 'Увеличивает магический урон магов.' },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🔥 КУЗНИЦА ПЛАМЕНИ
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Закалите свое снаряжение в жарком горне кузнеца Торвальда
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} className="text-xs">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Blacksmith dialogue and log */}
        <div className="md:col-span-1 space-y-4">
          <div className="gothic-panel p-5 bg-obsidian-900/80 rounded-lg flex flex-col items-center text-center">
            {/* Blacksmith graphic */}
            <div className="w-24 h-24 bg-obsidian-950 border border-gold-600/30 rounded-full flex items-center justify-center text-5xl mb-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
              🧔
              <div className="absolute -bottom-1 -right-1 bg-gold-600 text-obsidian-950 p-1 rounded-full text-xs font-bold">
                <Hammer className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <h3 className="text-base font-bold font-gothic text-slate-200">Кузнец Торвальд</h3>
            <p className="text-xs text-slate-400 mt-2 italic">
              «Здорово, боец! Принёс золото? Молот готов раздуть угли. Твоё оружие станет острее, а доспех — прочнее!»
            </p>
            
            {/* Player's Wallet */}
            <div className="w-full mt-6 p-3 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-xs flex justify-between items-center text-slate-300">
              <span>Ваше золото:</span>
              <span className="text-amber-400 font-bold text-sm">💰 {player.gold} золота</span>
            </div>
          </div>

          {/* Activity log */}
          {forgeLog && (
            <div className="p-4 border border-gold-900/30 rounded bg-gold-950/10 text-xs text-gold-300 font-serif leading-relaxed animate-fade-in flex items-start gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-gold-500 animate-pulse mt-0.5" />
              <span>{forgeLog}</span>
            </div>
          )}
        </div>

        {/* Right column: Upgrades sheet */}
        <div className="md:col-span-2 space-y-4">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-base font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2">
              Доступные Улучшения Снаряжения
            </h3>

            <div className="space-y-4">
              {attributes.map((attr) => {
                const level = getUpgradeLevel(attr.key);
                const cost = getUpgradeCost(attr.key);
                const canAfford = player.gold >= cost;
                const isHammering = upgradingAttr === attr.key;

                return (
                  <div 
                    key={attr.key}
                    className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-gold-800/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-obsidian-900 border border-obsidian-800 rounded-lg mt-0.5">
                        {attr.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-200">{attr.name}</h4>
                          <span className="text-[10px] font-mono bg-gold-900/20 border border-gold-600/30 text-gold-400 px-2 py-0.5 rounded-full font-bold">
                            Уровень улучш.: +{level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{attr.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-obsidian-800/40 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Стоимость:</span>
                        <span className={`font-mono text-xs font-bold ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                          💰 {cost} золота
                        </span>
                      </div>
                      <Button
                        onClick={() => handleUpgrade(attr.key)}
                        disabled={!canAfford || upgradingAttr !== null}
                        size="sm"
                        className="min-w-28 relative overflow-hidden"
                      >
                        {isHammering ? (
                          <span className="flex items-center gap-1">
                            <span className="animate-spin inline-block">🔨</span> Ковка...
                          </span>
                        ) : (
                          'Улучшить +1'
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-obsidian-950/60 border border-obsidian-800 rounded text-[10px] font-sans text-slate-500 leading-relaxed">
              * Внимание: Каждое улучшение навсегда прибавляет +1 к характеристике персонажа. Стоимость каждого последующего улучшения одной характеристики увеличивается на 25 золота.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
