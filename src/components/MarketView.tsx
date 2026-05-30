import React, { useState } from 'react';
import type { Character } from '../types';
import { Button } from './ui/Button';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface MarketViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const MarketView: React.FC<MarketViewProps> = ({ player, onSave, onBack }) => {
  const [marketLog, setMarketLog] = useState<string | null>(null);

  const handleBuyItem = async (itemKey: 'amulet' | 'ring' | 'elixir') => {
    const prices = { amulet: 45, ring: 45, elixir: 30 };
    const cost = prices[itemKey];

    if (player.gold < cost) {
      setMarketLog('💰 Недостаточно золота для покупки этого предмета!');
      return;
    }

    let updatedStats = { ...player.stats };
    let updatedExperience = player.experience;
    let updatedLevel = player.level;
    let updatedMaxHp = player.maxHp;
    let updatedCurrentHp = player.currentHp;
    const levelUpNotifications: string[] = [];

    const upgrades = { ...player.upgrades };

    if (itemKey === 'amulet') {
      updatedStats.strength += 1;
      upgrades.strength = (upgrades.strength || 0) + 1;
      setMarketLog('📿 Вы купили «Древний Амулет Силы». Надев его, вы чувствуете прилив богатырской мощи! Характеристика «Сила» повышена на +1.');
    } else if (itemKey === 'ring') {
      updatedStats.agility += 1;
      upgrades.agility = (upgrades.agility || 0) + 1;
      setMarketLog('💍 Вы купили «Кольцо Кошачьей Ловкости». Ваши движения стали неуловимо плавными! Характеристика «Ловкость» повышена на +1.');
    } else if (itemKey === 'elixir') {
      updatedExperience += 75;
      setMarketLog('🧪 Вы выпили «Эликсир Мудрости». Магическое варево расширяет сознание! Получено +75 опыта.');

      // Check level ups
      while (updatedExperience >= updatedLevel * 100) {
        updatedExperience -= updatedLevel * 100;
        updatedLevel += 1;
        updatedStats.strength += 1;
        updatedStats.agility += 1;
        updatedStats.endurance += 1;
        updatedStats.intellect += 1;
        levelUpNotifications.push(`🎉 Новый уровень: ${updatedLevel}! Все характеристики +1!`);
      }
      updatedMaxHp = updatedStats.endurance * 10;
      updatedCurrentHp = updatedMaxHp; // heal on level up
    }

    const updatedPlayer: Character = {
      ...player,
      gold: player.gold - cost,
      level: updatedLevel,
      experience: updatedExperience,
      stats: updatedStats,
      maxHp: updatedMaxHp,
      currentHp: updatedCurrentHp,
      upgrades,
    };

    await onSave(updatedPlayer);

    if (levelUpNotifications.length > 0) {
      setMarketLog((prev) => `${prev}\n${levelUpNotifications.join('\n')}`);
    }
  };

  const marketItems = [
    {
      key: 'amulet',
      name: 'Древний Амулет Силы',
      desc: 'Таинственный амулет с рельефным орнаментом медведя. Навсегда прибавляет +1 к Силе.',
      cost: 45,
      icon: '📿',
    },
    {
      key: 'ring',
      name: 'Кольцо Кошачьей Ловкости',
      desc: 'Тонкое кольцо, украшенное зеленым самоцветом. Навсегда прибавляет +1 к Ловкости.',
      cost: 45,
      icon: '💍',
    },
    {
      key: 'elixir',
      name: 'Эликсир Опыта и Мудрости',
      desc: 'Колба с переливающейся золотой жидкостью. Мгновенно дарует +75 очков опыта (XP).',
      cost: 30,
      icon: '🧪',
    },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🛒 ТОРГОВАЯ ПЛОЩАДЬ
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Купите диковинки у заморского торговца редкостями Аластора
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} className="text-xs">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Merchant Dialogue */}
        <div className="space-y-4">
          <div className="gothic-panel p-5 bg-obsidian-900/80 rounded-lg flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-obsidian-950 border border-gold-600/30 rounded-full flex items-center justify-center text-5xl mb-4 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
              👳
              <div className="absolute -bottom-1 -right-1 bg-gold-600 text-obsidian-950 p-1 rounded-full text-xs font-bold">
                💎
              </div>
            </div>
            
            <h3 className="text-base font-bold font-gothic text-slate-200">Купец Аластор</h3>
            <p className="text-xs text-slate-400 mt-2 italic">
              «Приветствую, почтенный путник! У меня есть амулеты с востока и эликсиры из самой столицы. Повысь свои боевые качества прямо сейчас за горсть золотых монет!»
            </p>

            <div className="w-full mt-6 p-3 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-xs flex justify-between items-center text-slate-300">
              <span>Золотые монеты:</span>
              <span className="text-amber-400 font-bold text-sm">💰 {player.gold} золота</span>
            </div>
          </div>

          {/* Market logs */}
          {marketLog && (
            <div className="p-4 border border-gold-900/30 rounded bg-gold-950/10 text-xs text-gold-300 font-serif leading-relaxed whitespace-pre-line animate-fade-in flex gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-gold-400 mt-0.5" />
              <span>{marketLog}</span>
            </div>
          )}
        </div>

        {/* Store Shelf */}
        <div className="md:col-span-2 space-y-4">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-base font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-500" /> Прилавок Магазина
            </h3>

            <div className="space-y-4">
              {marketItems.map((item) => {
                const canAfford = player.gold >= item.cost;
                return (
                  <div 
                    key={item.key}
                    className="border border-obsidian-800 p-4 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-gold-800/20 transition-all"
                  >
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="text-4xl p-2 bg-obsidian-900 border border-obsidian-800 rounded-lg select-none">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-t sm:border-0 border-obsidian-800/40 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">Цена:</span>
                        <span className={`font-mono text-xs font-bold ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                          💰 {item.cost} золота
                        </span>
                      </div>
                      <Button
                        onClick={() => handleBuyItem(item.key)}
                        disabled={!canAfford}
                        size="sm"
                        className="min-w-24"
                      >
                        Купить
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
