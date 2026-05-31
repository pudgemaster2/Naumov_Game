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

  const handleBuyItem = async (itemKey: string) => {
    const prices: Record<string, number> = { 
      amulet: 45, 
      ring: 45, 
      elixir: 30,
      potion_hp: 10,
      potion_mp: 10,
      scroll_atk: 15,
      scroll_def: 15,
      scroll_dodge: 15,
      scroll_crit: 15
    };
    const cost = prices[itemKey] || 999;

    if (player.gold < cost) {
      setMarketLog('💰 Недостаточно золота для покупки этого предмета!');
      return;
    }

    let updatedStats = { ...player.stats };
    let updatedExperience = player.experience;
    let updatedLevel = player.level;
    let updatedMaxHp = player.maxHp;
    let updatedCurrentHp = player.currentHp;
    let updatedMaxMana = player.maxMana === undefined ? player.stats.intellect * 10 : player.maxMana;
    let updatedCurrentMana = player.currentMana === undefined ? updatedMaxMana : player.currentMana;
    const levelUpNotifications: string[] = [];

    const upgrades = { ...player.upgrades };
    const inventory = [...(player.inventory || [])];

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
      updatedMaxMana = updatedStats.intellect * 10;
      updatedCurrentHp = updatedMaxHp; // heal on level up
      updatedCurrentMana = updatedMaxMana;
    } else {
      // Consumables purchase
      const consumablesMap: Record<string, { name: string; type: any; desc: string; icon: string }> = {
        potion_hp: { name: 'Зелье здоровья', type: 'potion_hp', desc: 'Восстанавливает 50 HP.', icon: '🧪' },
        potion_mp: { name: 'Зелье маны', type: 'potion_mp', desc: 'Восстанавливает 50 MP.', icon: '🧪' },
        scroll_atk: { name: 'Свиток Ярости', type: 'scroll_atk', desc: 'Дарует +10 к урону до конца боя.', icon: '📜' },
        scroll_def: { name: 'Свиток Каменной Кожи', type: 'scroll_def', desc: 'Снижает получаемый урон на 5 до конца боя.', icon: '📜' },
        scroll_dodge: { name: 'Свиток Ветра', type: 'scroll_dodge', desc: 'Дарует +15% к увороту до конца боя.', icon: '📜' },
        scroll_crit: { name: 'Свиток Гнева', type: 'scroll_crit', desc: 'Дарует +15% к криту до конца боя.', icon: '📜' }
      };

      const c = consumablesMap[itemKey];
      if (c) {
        inventory.push({
          id: `${itemKey}_${Math.random().toString(36).substring(2, 9)}`,
          name: c.name,
          type: c.type,
          stats: {},
          description: c.desc,
          icon: c.icon
        });
        setMarketLog(`🛒 Вы купили расходник: "${c.name}" за 💰 ${cost} золота. Предмет добавлен в ваш рюкзак.`);
      }
    }

    const updatedPlayer: Character = {
      ...player,
      gold: player.gold - cost,
      level: updatedLevel,
      experience: updatedExperience,
      stats: updatedStats,
      maxHp: updatedMaxHp,
      maxMana: updatedMaxMana,
      currentHp: updatedCurrentHp,
      currentMana: updatedCurrentMana,
      upgrades,
      inventory,
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
    {
      key: 'potion_hp',
      name: 'Зелье здоровья',
      desc: 'Снадобье, восстанавливающее 50 HP при использовании в бою или дома.',
      cost: 10,
      icon: '🧪',
    },
    {
      key: 'potion_mp',
      name: 'Зелье маны',
      desc: 'Эликсир, восстанавливающий 50 MP маны при использовании в бою.',
      cost: 10,
      icon: '🧪',
    },
    {
      key: 'scroll_atk',
      name: 'Свиток Ярости',
      desc: 'Боевой свиток. Повышает ваш урон в бою на +10 до конца схватки.',
      cost: 15,
      icon: '📜',
    },
    {
      key: 'scroll_def',
      name: 'Свиток Каменной Кожи',
      desc: 'Боевой свиток. Поглощает 5 единиц любого входящего урона за удар.',
      cost: 15,
      icon: '📜',
    },
    {
      key: 'scroll_dodge',
      name: 'Свиток Ветра',
      desc: 'Боевой свиток. Повышает шанс уклонения от ударов врага на +15%.',
      cost: 15,
      icon: '📜',
    },
    {
      key: 'scroll_crit',
      name: 'Свиток Гнева',
      desc: 'Боевой свиток. Повышает вероятность критического удара на +15%.',
      cost: 15,
      icon: '📜',
    },
  ] as const;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-5">
        <div>
          <h2 className="text-3xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-3">
            🛒 ТОРГОВАЯ ПЛОЩАДЬ
          </h2>
          <p className="text-sm font-mono text-slate-500 mt-2 uppercase tracking-wider">
            Купите диковинки у заморского торговца редкостями Аластора
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} size="md">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Merchant Dialogue */}
        <div className="space-y-4">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-obsidian-950 border border-gold-600/30 rounded-full flex items-center justify-center text-6xl mb-5 relative shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]">
              👳
              <div className="absolute -bottom-1 -right-1 bg-gold-600 text-obsidian-950 p-1.5 rounded-full text-xs font-bold">
                💎
              </div>
            </div>
            
            <h3 className="text-lg font-bold font-gothic text-slate-200">Купец Аластор</h3>
            <p className="text-sm text-slate-400 mt-3 italic leading-relaxed">
              «Приветствую, почтенный путник! У меня есть амулеты с востока и эликсиры из самой столицы. Повысь свои боевые качества прямо сейчас за горсть золотых монет!»
            </p>

            <div className="w-full mt-6 p-4 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-sm flex justify-between items-center text-slate-300">
              <span>Золотые монеты:</span>
              <span className="text-amber-400 font-bold text-base">💰 {player.gold} золота</span>
            </div>
          </div>

          {/* Market logs */}
          {marketLog && (
            <div className="p-5 border border-gold-900/30 rounded bg-gold-950/10 text-sm text-gold-300 font-serif leading-relaxed whitespace-pre-line animate-fade-in flex gap-2.5">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-gold-400 mt-0.5" />
              <span>{marketLog}</span>
            </div>
          )}
        </div>

        {/* Store Shelf */}
        <div className="md:col-span-2 space-y-4">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-4">
            <h3 className="text-lg font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-3 flex items-center gap-3">
              <ShoppingBag className="w-6 h-6 text-gold-500" /> Прилавок Магазина
            </h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto rpg-scrollbar pr-1">
              {marketItems.map((item) => {
                const canAfford = player.gold >= item.cost;
                return (
                  <div 
                    key={item.key}
                    className="border border-obsidian-800 p-5 rounded bg-obsidian-950/40 flex flex-col sm:flex-row items-center justify-between gap-5 hover:border-gold-800/20 transition-all"
                  >
                    <div className="flex items-center gap-5 text-center sm:text-left">
                      <div className="text-5xl p-2.5 bg-obsidian-900 border border-obsidian-800 rounded-lg select-none">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-200">{item.name}</h4>
                        <p className="text-sm text-slate-400 mt-1 max-w-lg">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 border-t sm:border-0 border-obsidian-800/40 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-500 uppercase block">Цена:</span>
                        <span className={`font-mono text-sm font-bold ${canAfford ? 'text-amber-400' : 'text-rose-400'}`}>
                          💰 {item.cost} золота
                        </span>
                      </div>
                      <Button
                        onClick={() => handleBuyItem(item.key)}
                        disabled={!canAfford}
                        size="md"
                        className="min-w-28"
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
