import React, { useState } from 'react';
import type { Character, Item, Equipment, CharacterStats } from '../types';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import { Button } from './ui/Button';
import { Package } from 'lucide-react';
import { getPortrait } from '../utils/portraitHelper';
import { getItemImage, getBedImage, getChestImage } from '../utils/itemHelper';

interface MyHouseViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const MyHouseView: React.FC<MyHouseViewProps> = ({ player, onSave, onBack }) => {
  const [activeTab, setActiveTab] = useState<'bedroom' | 'inventory'>('inventory');

  // Interaction States
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepProgress, setSleepProgress] = useState(0);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [chestMessage, setChestMessage] = useState<string | null>(null);

  const todayDateString = new Date().toISOString().split('T')[0];
  const isDailyAvailable = player.lastDailyClaim !== todayDateString;

  // getPortrait is now imported from portraitHelper

  // Helpers for equipment stats calculation
  const getEquippedStats = (): Record<keyof CharacterStats, number> => {
    const gearStats: Record<keyof CharacterStats, number> = {
      strength: 0,
      agility: 0,
      endurance: 0,
      intellect: 0,
    };

    if (player.equipment) {
      Object.values(player.equipment).forEach((item) => {
        if (item && item.stats) {
          Object.keys(item.stats).forEach((statKey) => {
            const key = statKey as keyof CharacterStats;
            gearStats[key] += item.stats[key] || 0;
          });
        }
      });
    }

    return gearStats;
  };

  const gearStats = getEquippedStats();

  const getEffectiveStatValue = (statKey: keyof CharacterStats) => {
    return player.stats[statKey] + gearStats[statKey];
  };

  // Recalculates stats and Max HP when gear is modified
  const applyGearAdjustment = (newEquipment: Equipment): { currentHp: number; maxHp: number; maxMana: number } => {
    let equipEndurance = 0;
    let equipIntellect = 0;
    Object.values(newEquipment).forEach((item) => {
      if (item && item.stats) {
        if (item.stats.endurance) equipEndurance += item.stats.endurance;
        if (item.stats.intellect) equipIntellect += item.stats.intellect;
      }
    });

    const totalEndurance = player.stats.endurance + equipEndurance;
    const totalIntellect = player.stats.intellect + equipIntellect;
    const nextMaxHp = totalEndurance * 10;
    const nextMaxMana = totalIntellect * 10;

    const hpDiff = nextMaxHp - player.maxHp;
    const nextCurrentHp = Math.max(1, Math.min(player.currentHp + hpDiff, nextMaxHp));

    return { currentHp: nextCurrentHp, maxHp: nextMaxHp, maxMana: nextMaxMana };
  };

  // Equip Item from Backpack
  const handleEquipItem = async (item: Item) => {
    const inventory = [...(player.inventory || [])];
    const equipment: Equipment = { ...(player.equipment || {}) };

    let slotKey: keyof Equipment = item.type as keyof Equipment;
    let oldItem: Item | undefined = undefined;

    if (item.type === 'ring') {
      // Find first empty ring slot
      if (!equipment.ring1) slotKey = 'ring1';
      else if (!equipment.ring2) slotKey = 'ring2';
      else slotKey = 'ring1'; // overwrite ring1 if all full
    }

    // Capture old item if present
    oldItem = equipment[slotKey];

    // Equip new item
    equipment[slotKey] = item;

    // Remove from inventory
    const itemIndex = inventory.findIndex((invItem) => invItem.id === item.id);
    if (itemIndex > -1) {
      inventory.splice(itemIndex, 1);
    }

    // Add old item back to inventory
    if (oldItem) {
      inventory.push(oldItem);
    }

    // Adjust HP and Max HP/Mana
    const { currentHp, maxHp, maxMana } = applyGearAdjustment(equipment);

    const updatedPlayer: Character = {
      ...player,
      inventory,
      equipment,
      currentHp,
      maxHp,
      maxMana,
      currentMana: Math.min(player.currentMana, maxMana)
    };

    await onSave(updatedPlayer);
  };

  // Unequip Item back to Backpack
  const handleUnequipItem = async (slotKey: keyof Equipment) => {
    const equipment = { ...(player.equipment || {}) };
    const itemToUnequip = equipment[slotKey];

    if (!itemToUnequip) return;

    // Remove from slot
    delete equipment[slotKey];

    // Add back to inventory
    const inventory = [...(player.inventory || [])];
    inventory.push(itemToUnequip);

    // Adjust HP and Max HP/Mana
    const { currentHp, maxHp, maxMana } = applyGearAdjustment(equipment);

    const updatedPlayer: Character = {
      ...player,
      inventory,
      equipment,
      currentHp,
      maxHp,
      maxMana,
      currentMana: Math.min(player.currentMana, maxMana)
    };

    await onSave(updatedPlayer);
  };

  // Sleep Interaction
  const handleSleep = () => {
    setIsSleeping(true);
    setSleepProgress(0);

    const interval = setInterval(() => {
      setSleepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const healedPlayer = {
              ...player,
              currentHp: player.maxHp,
              currentMana: player.maxMana,
            };
            onSave(healedPlayer).then(() => {
              setIsSleeping(false);
            });
          }, 100);
          return 100;
        }
        return prev + 1;
      });
    }, 80);
  };

  // Open Chest Interaction
  const handleOpenChest = async () => {
    if (!isDailyAvailable) {
      setChestMessage('Вы уже забирали сегодняшнюю добычу из сундука. Возвращайтесь завтра!');
      setIsChestOpen(true);
      return;
    }

    setIsChestOpen(true);
    const updatedPlayer = {
      ...player,
      gold: player.gold + 25,
      lastDailyClaim: todayDateString,
    };

    setChestMessage('Скрипучая крышка открывается... Вы нашли 💰 25 золота на дне сундука!');
    await onSave(updatedPlayer);
  };

  // Drink HP Potion in House
  const handleDrinkPotion = async (item: Item) => {
    if (player.currentHp >= player.maxHp) return;

    const inventory = [...(player.inventory || [])];
    const idx = inventory.findIndex(i => i.id === item.id);
    if (idx === -1) return;

    inventory.splice(idx, 1);
    const nextHp = Math.min(player.maxHp, player.currentHp + 50);

    const updatedPlayer = {
      ...player,
      inventory,
      currentHp: nextHp
    };

    await onSave(updatedPlayer);
  };

  const renderItemIcon = (icon: string, className: string = "w-12 h-12 object-contain group-hover:scale-105 transition-transform select-none") => {
    if (icon.includes('/') || icon.includes('.') || icon.startsWith('data:')) {
      return <img src={icon} alt="item" className={className} />;
    }
    return <span className="text-4xl leading-none select-none group-hover:scale-105 transition-transform">{icon}</span>;
  };

  const getSlotBackgroundIcon = (slotKey: string) => {
    if (slotKey === 'ring1' || slotKey === 'ring2') {
      return getItemImage('ring');
    }
    return getItemImage(slotKey);
  };

  const ItemHtmlTooltip: React.FC<{ item: Item }> = ({ item }) => {
    const stats = Object.entries(item.stats);
    
    const getItemTypeName = (type: string) => {
      switch (type) {
        case 'helmet': return 'Шлем';
        case 'armor': return 'Нагрудник';
        case 'gloves': return 'Перчатки';
        case 'boots': return 'Сапоги';
        case 'weapon': return 'Оружие';
        case 'shield': return 'Вторая рука';
        case 'spellbook': return 'Боевой пояс';
        case 'ring': return 'Кольцо';
        case 'potion_hp': return 'Зелье здоровья';
        case 'potion_mp': return 'Зелье маны';
        case 'scroll_atk': return 'Свиток Ярости';
        case 'scroll_def': return 'Свиток Каменной Кожи';
        case 'scroll_dodge': return 'Свиток Ветра';
        case 'scroll_crit': return 'Свиток Гнева';
        default: return 'Предмет';
      }
    };

    return (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-60 p-3.5 bg-obsidian-950/95 border border-gold-600/40 rounded-xl text-center shadow-2xl pointer-events-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-150 font-sans backdrop-blur-sm">
        <div className="text-sm font-bold text-gold-300 font-gothic tracking-wide border-b border-obsidian-800 pb-1.5">{item.name}</div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-1.5 px-0.5">
          <span>{getItemTypeName(item.type)}</span>
          <span className="text-amber-500 font-bold">Уровень: 1</span>
        </div>
        {item.description && (
          <div className="text-[10px] text-slate-300 italic mt-1.5 text-left border-t border-obsidian-900/60 pt-1.5 leading-relaxed">
            {item.description}
          </div>
        )}
        {stats.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-obsidian-900/60 flex flex-col gap-1 text-[11px] font-mono font-bold text-left px-0.5">
            {stats.map(([key, val]) => {
              let colorClass = 'text-slate-300';
              let label = key;
              if (key === 'strength') { colorClass = 'text-rose-400'; label = 'Сила'; }
              if (key === 'agility') { colorClass = 'text-emerald-400'; label = 'Ловкость'; }
              if (key === 'endurance') { colorClass = 'text-red-400'; label = 'Выносливость'; }
              if (key === 'intellect') { colorClass = 'text-sky-400'; label = 'Интеллект'; }
              return (
                <div key={key} className={`${colorClass} flex justify-between`}>
                  <span>{label}:</span>
                  <span>+{val}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Slot Renderer
  const renderSlot = (slotKey: keyof Equipment, label: string, name: string) => {
    const equippedItem = player.equipment?.[slotKey];
    return (
      <div 
        onClick={() => equippedItem && handleUnequipItem(slotKey as keyof Equipment)}
        className={`w-24 h-24 border rounded flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none relative group ${
          equippedItem
            ? 'border-gold-500 bg-gold-500/10 hover:bg-rose-500/10 hover:border-rose-500 shadow-[0_0_12px_rgba(197,160,40,0.3)]'
            : 'border-slate-300 bg-slate-100 hover:border-gold-500/50 hover:bg-gold-500/5'
        }`}
        title={equippedItem ? undefined : `Ячейка: ${name}`}
      >
        {equippedItem ? (
          <>
            {renderItemIcon(equippedItem.icon)}
            <span className="text-[10px] text-slate-800 font-mono mt-1.5 text-center truncate w-full px-1.5">{equippedItem.name}</span>
            <ItemHtmlTooltip item={equippedItem} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-30 select-none pointer-events-none w-full h-full p-2 text-center">
            {getSlotBackgroundIcon(slotKey).includes('/') ? (
              <img src={getSlotBackgroundIcon(slotKey)} alt={label} className="w-10 h-10 object-contain grayscale" />
            ) : (
              <span className="text-3xl leading-none">{getSlotBackgroundIcon(slotKey)}</span>
            )}
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider mt-1.5 text-slate-700">
              {label}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-2 space-y-6 relative select-none">
      {/* Sleeping Overlay */}
      {isSleeping && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center transition-all duration-500">
          <div className="text-center space-y-6 max-w-md p-6">
            <div className="relative w-20 h-20 mx-auto">
              <span className="text-6xl animate-bounce inline-block">💤</span>
            </div>
            <h2 className="text-2xl font-bold font-gothic text-blue-400 tracking-widest">
              Сладкий Сон...
            </h2>
            <p className="text-sm text-slate-400">
              Вы погружаетесь в глубокий сон под тихий шелест листьев гигантского дерева. Раны затягиваются, а силы восстанавливаются...
            </p>
            {/* Health Bar Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-emerald-400 font-bold">
                <span>Восстановление сил...</span>
                <span>{sleepProgress}%</span>
              </div>
              <div className="h-3 bg-obsidian-950 rounded overflow-hidden p-[1px] border border-emerald-900/30">
                <div 
                  className="h-full bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-150"
                  style={{ width: `${sleepProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* House Title Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-300 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold font-gothic text-slate-900 tracking-widest flex items-center gap-2">
            МОЙ ДОМ
          </h2>
          <p className="text-sm font-mono text-slate-600 mt-0.5 uppercase tracking-wider">
            Ваше личное убежище в кроне Великого Древа
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 font-gothic text-sm tracking-widest rounded border uppercase transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300/50'
            }`}
          >
            Снаряжение и Инвентарь
          </button>
          <button
            onClick={() => setActiveTab('bedroom')}
            className={`px-5 py-3 font-gothic text-sm tracking-widest rounded border uppercase transition-colors cursor-pointer ${
              activeTab === 'bedroom'
                ? 'bg-amber-600 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10'
                : 'bg-slate-200 border-slate-300 text-slate-700 hover:bg-slate-300/50'
            }`}
          >
            Комната отдыха
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="secondary" onClick={onBack} size="md">
            Выйти на улицу
          </Button>
        </div>
      </div>

      {/* Main Tab Rendering */}
      {activeTab === 'bedroom' ? (
        <div className="max-w-md mx-auto space-y-6">
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg space-y-6 text-slate-800 shadow-md">
            <h3 className="text-lg font-bold font-gothic text-slate-900 border-b border-slate-250 pb-2 flex items-center gap-2">
              Комната отдыха
            </h3>
            
            {/* Bed Section */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50/50 border border-slate-250 rounded-lg">
              <div 
                onClick={!(player.currentHp >= player.maxHp && player.currentMana >= player.maxMana) ? handleSleep : undefined}
                className={`relative w-48 h-32 flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden border border-slate-300 transition-all ${
                  player.currentHp >= player.maxHp && player.currentMana >= player.maxMana
                    ? 'opacity-85 cursor-default'
                    : 'cursor-pointer hover:border-amber-500 hover:scale-[1.02] shadow-sm'
                }`}
                title={player.currentHp >= player.maxHp && player.currentMana >= player.maxMana ? "Вы полностью здоровы" : "Кликните на кровать, чтобы отдохнуть (8 сек)"}
              >
                <img src={getBedImage()} alt="Кровать" className="w-full h-full object-cover" />
                {!(player.currentHp >= player.maxHp && player.currentMana >= player.maxMana) && (
                  <div className="absolute inset-0 bg-black/15 hover:bg-transparent flex items-center justify-center text-white font-gothic text-xs tracking-wider uppercase font-bold">
                    🛌 Отдохнуть (8с)
                  </div>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-3">Кровать</h4>
              <p className="text-xs text-slate-650 text-center mt-1.5 max-w-xs">
                {player.currentHp >= player.maxHp && player.currentMana >= player.maxMana 
                  ? 'Вы полностью здоровы и полны сил.' 
                  : 'Нажмите на изображение кровати, чтобы лечь спать и восстановиться.'}
              </p>
            </div>

            {/* Chest Section */}
            <div className="border border-slate-250 p-5 rounded-lg bg-slate-50/50 flex items-center gap-5">
              <div 
                onClick={handleOpenChest}
                className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-amber-100 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-200/50 hover:border-amber-500 hover:scale-105 active:scale-95 transition-all shadow-sm"
                title="Кликните на сундук, чтобы открыть"
              >
                <img src={getChestImage()} alt="Сундук" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Сундук</h4>
                <p className="text-xs text-slate-650 mt-1">
                  {isDailyAvailable 
                    ? 'Нажмите на иконку сундука, чтобы забрать золото!' 
                    : 'Сундук пуст. Возвращайтесь завтра!'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-200 border border-slate-300 rounded font-mono text-sm text-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span>Текущее Здоровье:</span>
                <span className={`font-bold ${player.currentHp < player.maxHp ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {player.currentHp} / {player.maxHp} HP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Текущая Мана:</span>
                <span className={`font-bold ${player.currentMana < player.maxMana ? 'text-rose-700' : 'text-sky-700'}`}>
                  {player.currentMana} / {player.maxMana} MP
                </span>
              </div>
            </div>
          </div>

          {/* Daily loot dialog */}
          {isChestOpen && (
            <div className="gothic-panel-gold p-6 bg-slate-50 border-amber-500 rounded-lg space-y-4 text-center animate-fade-in text-slate-900">
              <h3 className="text-base font-bold font-gothic text-amber-800">Старинный Сундук</h3>
              <div className="py-2 flex justify-center">
                <img src={getChestImage()} alt="Сундук" className="w-20 h-20 object-contain animate-bounce" />
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {chestMessage}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setIsChestOpen(false)}>
                Закрыть
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Combats Split Column Layout: Slots - Portrait - Slots */
        <div className="space-y-6">
          <div className="gothic-panel-gold p-6 bg-obsidian-900/90 rounded-lg shadow-2xl">
            <h3 className="text-xs font-bold font-gothic text-gold-400 text-center tracking-widest uppercase border-b border-obsidian-800 pb-3 mb-6">
              Снаряжение Персонажа
            </h3>

            {/* Symmetrical Layout */}
            <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
              <div className="flex flex-row items-center justify-center gap-1 sm:gap-1.5 md:gap-2.5">
                
                {/* Left Column: 4 Slots */}
                <div className="flex flex-col gap-1 items-end">
                  {renderSlot('helmet', 'Шлем', 'Шлем')}
                  {renderSlot('armor', 'Доспех', 'Нагрудный доспех')}
                  {renderSlot('belt', 'Поножи', 'Поножи')}
                  {renderSlot(
                    'weapon',
                    player.classType === 'mage' ? 'Посох' : player.classType === 'archer' ? 'Лук' : 'Меч',
                    player.classType === 'mage' ? 'Посох' : player.classType === 'archer' ? 'Лук' : 'Меч'
                  )}
                </div>

                {/* Center Portrait */}
                <div className="flex flex-col items-center">
                  <div className="border border-gold-500/30 rounded-lg overflow-hidden bg-obsidian-950 p-2 shadow-[0_0_20px_rgba(0,0,0,0.1)]">
                    <img 
                      src={getPortrait(player.race, player.classType, player.gender)} 
                      alt={`${player.race} ${player.classType}`} 
                      className="w-[320px] h-[460px] object-contain rounded border border-slate-700 bg-obsidian-900" 
                    />
                  </div>
                </div>

                {/* Right Column: 4 Slots */}
                <div className="flex flex-col gap-1 items-start">
                  {renderSlot(
                    'shield',
                    player.classType === 'mage' ? 'Книга' : player.classType === 'archer' ? 'Колчан' : 'Щит',
                    player.classType === 'mage' ? 'Книга заклинаний' : player.classType === 'archer' ? 'Колчан стрел' : 'Щит'
                  )}
                  {renderSlot('gloves', 'Руки', 'Перчатки')}
                  {renderSlot('boots', 'Ноги', 'Сапоги')}
                  {renderSlot('spellbook', 'Боевой пояс', 'Боевой пояс')}
                </div>

              </div>

              {/* Rings Row below the portrait & vertical grids */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-1.5">
                {renderSlot('ring1', 'Кольцо', 'Кольцо 1')}
                {renderSlot('ring2', 'Кольцо', 'Кольцо 2')}
              </div>

              <div className="mt-1.5 text-center space-y-1">
                <div className="font-gothic text-gold-400 font-bold uppercase tracking-widest text-sm">
                  {player.name}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {RACE_TEMPLATES[player.race]?.title || player.race} • {CLASS_TEMPLATES[player.classType]?.title || player.classType}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sheet & Backpack */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Attribute sheet */}
            <div className="md:col-span-5 gothic-panel p-5 bg-slate-100/90 rounded-lg space-y-4 text-slate-800 border-slate-300">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 font-gothic border-b border-slate-300 pb-2">
                Характеристики персонажа
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center py-2 font-mono">
                <div className="p-3.5 bg-slate-50 border border-slate-300">
                  <div className="text-xs font-semibold text-slate-600 uppercase">Сила</div>
                  <div className="text-xl font-bold text-rose-700 mt-1">{getEffectiveStatValue('strength')}</div>
                  {gearStats.strength > 0 && <div className="text-xs text-emerald-600 font-bold mt-0.5">+{gearStats.strength} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-300">
                  <div className="text-xs font-semibold text-slate-600 uppercase">Ловкость</div>
                  <div className="text-xl font-bold text-amber-700 mt-1">{getEffectiveStatValue('agility')}</div>
                  {gearStats.agility > 0 && <div className="text-xs text-emerald-600 font-bold mt-0.5">+{gearStats.agility} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-300">
                  <div className="text-xs font-semibold text-slate-600 uppercase">Выносл.</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{getEffectiveStatValue('endurance')}</div>
                  {gearStats.endurance > 0 && <div className="text-xs text-emerald-600 font-bold mt-0.5">+{gearStats.endurance} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-300">
                  <div className="text-xs font-semibold text-slate-600 uppercase">Интеллект</div>
                  <div className="text-xl font-bold text-sky-700 mt-1">{getEffectiveStatValue('intellect')}</div>
                  {gearStats.intellect > 0 && <div className="text-xs text-emerald-600 font-bold mt-0.5">+{gearStats.intellect} от вещ.</div>}
                </div>
              </div>
            </div>

            {/* Inventory Backpack */}
            <div className="md:col-span-7 gothic-panel p-5 bg-slate-100/90 rounded-lg space-y-4 text-slate-800 border-slate-300">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 font-gothic border-b border-slate-300 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-555" /> Рюкзак (Инвентарь)
              </h3>

              {!player.inventory || player.inventory.length === 0 ? (
                <div className="text-center p-8 bg-slate-200 border border-slate-300 rounded text-slate-650 font-mono text-sm">
                  Рюкзак пуст. Все вещи надеты или у вас нет предметов в инвентаре.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[450px] overflow-y-auto rpg-scrollbar pr-1">
                  {player.inventory.map((item) => {
                    const isCombatOnly = item.type.startsWith('scroll') || (item.type.startsWith('potion') && item.type !== 'potion_hp');
                    const isHpPotion = item.type === 'potion_hp';
                    const isHpFull = player.currentHp >= player.maxHp;

                    const handleItemClick = () => {
                      if (isHpPotion) {
                        if (!isHpFull) {
                          handleDrinkPotion(item);
                        }
                      } else if (!isCombatOnly) {
                        handleEquipItem(item);
                      }
                    };

                    return (
                      <div 
                        key={item.id}
                        onClick={handleItemClick}
                        className={`border p-4 rounded flex items-center justify-between gap-3.5 transition-all select-none relative group ${
                          isCombatOnly
                            ? 'border-slate-200 bg-slate-150/40 opacity-60 cursor-default text-slate-700'
                            : isHpPotion && isHpFull
                            ? 'border-slate-200 bg-slate-150/50 opacity-70 cursor-not-allowed text-slate-700'
                            : 'border-slate-300 bg-slate-50/70 hover:border-gold-500/50 hover:bg-gold-500/5 cursor-pointer shadow-sm hover:shadow-[0_0_8px_rgba(197,160,40,0.15)] text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-slate-100 border border-slate-250 rounded select-none flex-shrink-0 flex items-center justify-center">
                            {renderItemIcon(item.icon, "w-9 h-9 object-contain group-hover:scale-105 transition-transform")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                              {isCombatOnly && (
                                <span className="text-[9px] font-mono text-amber-700 border border-amber-300 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Боевой
                                </span>
                              )}
                              {isHpPotion && (
                                <span className="text-[9px] font-mono text-emerald-700 border border-emerald-300 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Зелье HP
                                </span>
                              )}
                            </div>
                            
                            {/* Colored stats display directly on card */}
                            {Object.entries(item.stats).length > 0 && (
                              <div className="mt-1 flex flex-row gap-2 flex-wrap">
                                {Object.entries(item.stats).map(([key, val]) => {
                                  let colorClass = 'text-slate-600';
                                  let label = key;
                                  if (key === 'strength') { colorClass = 'text-rose-700'; label = 'Сила'; }
                                  if (key === 'agility') { colorClass = 'text-amber-700'; label = 'Ловк.'; }
                                  if (key === 'endurance') { colorClass = 'text-emerald-700'; label = 'Выносл.'; }
                                  if (key === 'intellect') { colorClass = 'text-sky-700'; label = 'Инт.'; }
                                  return (
                                    <span key={key} className={`text-xs font-mono font-bold ${colorClass}`}>
                                      +{val} {label}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Custom HTML Tooltip */}
                        <ItemHtmlTooltip item={item} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};