import React, { useState } from 'react';
import type { Character, Item, Equipment, CharacterStats } from '../types';
import { Button } from './ui/Button';
import { Bed, Inbox, Package, User2 } from 'lucide-react';

import elfImg from '../assets/ELF.jpg';
import gnomeImg from '../assets/GNOME.jpg';
import mageImg from '../assets/MAGE.jpg';
import orcImg from '../assets/ORC.jpg';

interface MyHouseViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const MyHouseView: React.FC<MyHouseViewProps> = ({ player, onSave, onBack }) => {
  const [activeTab, setActiveTab] = useState<'bedroom' | 'inventory'>('inventory');
  
  // Settings States
  const [name, setName] = useState(player.name);

  // Interaction States
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepProgress, setSleepProgress] = useState(0);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [chestMessage, setChestMessage] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const todayDateString = new Date().toISOString().split('T')[0];
  const isDailyAvailable = player.lastDailyClaim !== todayDateString;

  const getPortrait = (cType: string) => {
    switch (cType) {
      case 'elf': return elfImg;
      case 'gnome': return gnomeImg;
      case 'mage': return mageImg;
      case 'orc': return orcImg;
      default: return elfImg;
    }
  };

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
      else if (!equipment.ring3) slotKey = 'ring3';
      else if (!equipment.ring4) slotKey = 'ring4';
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

  // Save Character Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);

    const updatedPlayer: Character = {
      ...player,
      name: name.trim() || player.name,
    };

    await onSave(updatedPlayer);
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const getSlotBackgroundIcon = (slotKey: string) => {
    switch (slotKey) {
      case 'helmet': return '⛑️';
      case 'armor': return '🧥';
      case 'belt': return '🎗️';
      case 'weapon': return '🗡️';
      case 'shield': return '🛡️';
      case 'gloves': return '🧤';
      case 'boots': return '🥾';
      case 'spellbook': return '📖';
      case 'ring1':
      case 'ring2':
      case 'ring3':
      case 'ring4':
        return '💍';
      default: return '📦';
    }
  };

  const ItemHtmlTooltip: React.FC<{ item: Item }> = ({ item }) => {
    const stats = Object.entries(item.stats);
    return (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-56 p-3 bg-obsidian-950/95 border border-gold-900/40 rounded text-center shadow-2xl pointer-events-none invisible group-hover:visible group-hover\/item:visible opacity-0 group-hover:opacity-100 group-hover\/item:opacity-100 transition-all duration-150 font-sans">
        <div className="text-sm font-bold text-slate-200">{item.name}</div>
        {stats.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1 text-xs font-mono font-bold">
            {stats.map(([key, val]) => {
              let colorClass = 'text-slate-350';
              let label = key;
              if (key === 'strength') { colorClass = 'text-rose-450'; label = 'Сила'; }
              if (key === 'agility') { colorClass = 'text-emerald-450'; label = 'Ловкость'; }
              if (key === 'endurance') { colorClass = 'text-red-450'; label = 'Выносливость'; }
              if (key === 'intellect') { colorClass = 'text-sky-450'; label = 'Интеллект'; }
              return (
                <div key={key} className={colorClass}>
                  +{val} {label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Slot Renderer
  const renderSlot = (slotKey: keyof Equipment | 'ring1' | 'ring2' | 'ring3' | 'ring4', label: string, name: string) => {
    const equippedItem = player.equipment?.[slotKey];
    return (
      <div 
        onClick={() => equippedItem && handleUnequipItem(slotKey as keyof Equipment)}
        className={`w-24 h-24 border rounded flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none relative group ${
          equippedItem
            ? 'border-gold-500 bg-gold-950/40 hover:bg-rose-950/40 hover:border-rose-500 shadow-[0_0_12px_rgba(197,160,40,0.4)]'
            : 'border-obsidian-800 bg-obsidian-950/60 hover:border-gold-700/50 hover:bg-obsidian-900/50'
        }`}
        title={equippedItem ? undefined : `Ячейка: ${name}`}
      >
        {equippedItem ? (
          <>
            <span className="text-4xl group-hover:scale-105 transition-transform">{equippedItem.icon}</span>
            <span className="text-[10px] text-slate-300 font-mono mt-1.5 text-center truncate w-full px-1.5">{equippedItem.name}</span>
            <ItemHtmlTooltip item={equippedItem} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
            <span className="text-3xl leading-none">{getSlotBackgroundIcon(slotKey)}</span>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider mt-1 text-slate-400">
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-obsidian-800 pb-4 gap-4">
        <div>
          <h2 className="text-3xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🏡 МОЙ УЮТНЫЙ ДОМ
          </h2>
          <p className="text-sm font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
            Ваше личное убежище в кроне Великого Древа
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-3 font-gothic text-sm tracking-widest rounded border uppercase transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-gold-500 border-gold-400 text-obsidian-950 font-bold shadow-md shadow-gold-500/10'
                : 'bg-obsidian-900 border-obsidian-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Снаряжение и Инвентарь
          </button>
          <button
            onClick={() => setActiveTab('bedroom')}
            className={`px-5 py-3 font-gothic text-sm tracking-widest rounded border uppercase transition-colors cursor-pointer ${
              activeTab === 'bedroom'
                ? 'bg-gold-500 border-gold-400 text-obsidian-950 font-bold shadow-md shadow-gold-500/10'
                : 'bg-obsidian-900 border-obsidian-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Комната отдыха
          </button>
          <Button variant="secondary" onClick={onBack} size="md" className="hidden sm:inline-flex">
            Выйти на улицу
          </Button>
        </div>
      </div>

      {/* Main Tab Rendering */}
      {activeTab === 'bedroom' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Bedroom actions */}
          <div className="md:col-span-5 space-y-6">
            <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-6">
              <h3 className="text-lg font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2 flex items-center gap-2">
                Комната отдыха
              </h3>
              
              {/* Bed Section */}
              <div className="border border-obsidian-800 p-5 rounded-lg bg-obsidian-950/50 flex items-center gap-5">
                <div 
                  onClick={!(player.currentHp >= player.maxHp && player.currentMana >= player.maxMana) ? handleSleep : undefined}
                  className={`p-4 bg-blue-950/50 text-blue-400 border border-blue-900/30 rounded-lg transition-all duration-200 select-none ${
                    player.currentHp >= player.maxHp && player.currentMana >= player.maxMana
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-blue-900/30 hover:border-blue-500 hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  }`}
                  title={player.currentHp >= player.maxHp && player.currentMana >= player.maxMana ? "Вы полностью здоровы" : "Кликните на кровать, чтобы отдохнуть (8 сек)"}
                >
                  <Bed className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200">Дубовая Кровать</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {player.currentHp >= player.maxHp && player.currentMana >= player.maxMana 
                      ? 'Вы полностью здоровы и полны сил.' 
                      : 'Нажмите на иконку кровати, чтобы лечь спать и восстановиться.'}
                  </p>
                </div>
              </div>

              {/* Chest Section */}
              <div className="border border-obsidian-800 p-5 rounded-lg bg-obsidian-950/50 flex items-center gap-5">
                <div 
                  onClick={handleOpenChest}
                  className="p-4 bg-amber-950/50 text-amber-400 border border-amber-900/30 rounded-lg cursor-pointer hover:bg-amber-900/30 hover:border-amber-500 hover:scale-105 active:scale-95 transition-all duration-200 select-none shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  title="Кликните на сундук, чтобы открыть"
                >
                  <Inbox className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-200">Резной Сундук</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {isDailyAvailable 
                      ? 'Нажмите на иконку сундука, чтобы забрать золото!' 
                      : 'Сундук пуст. Возвращайтесь завтра!'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-sm text-slate-400 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>Текущее Здоровье:</span>
                  <span className={`font-bold ${player.currentHp < player.maxHp ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {player.currentHp} / {player.maxHp} HP
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Текущая Мана:</span>
                  <span className={`font-bold ${player.currentMana < player.maxMana ? 'text-rose-400' : 'text-sky-400'}`}>
                    {player.currentMana} / {player.maxMana} MP
                  </span>
                </div>
              </div>
            </div>

            {/* Daily loot dialog */}
            {isChestOpen && (
              <div className="gothic-panel-gold p-6 bg-obsidian-900/95 rounded-lg space-y-4 text-center animate-fade-in">
                <h3 className="text-base font-bold font-gothic text-gold-400">Старинный Сундук</h3>
                <div className="py-2 text-5xl">
                  {isDailyAvailable ? '🎁' : '🗝️'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {chestMessage}
                </p>
                <Button variant="secondary" size="sm" onClick={() => setIsChestOpen(false)}>
                  Закрыть
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Name & Class settings */}
          <div className="md:col-span-7">
            <div className="gothic-panel-gold p-6 bg-obsidian-900/80 rounded-lg space-y-6">
              <div className="flex justify-between items-center border-b border-obsidian-800 pb-2.5">
                <h3 className="text-lg font-bold font-gothic text-gold-400 flex items-center gap-2.5">
                  <User2 className="w-6 h-6 text-gold-500" /> Параметры Персонажа
                </h3>
                {showSaveSuccess && (
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/50 px-3 py-1 rounded animate-fade-in">
                    ✓ Сохранено
                  </span>
                )}
              </div>

              <div className="space-y-5 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-mono text-slate-400 block">Имя персонажа</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full gothic-input px-4 py-2.5 rounded text-sm focus:ring-1 focus:ring-gold-500"
                    maxLength={14}
                  />
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={isSaving}
                    fullWidth
                    size="md"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить имя'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
              <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5">
                
                {/* Left Column: 4 Slots */}
                <div className="flex flex-col gap-2.5 items-end">
                  {renderSlot('helmet', 'Шлем', 'Шлем')}
                  {renderSlot('armor', 'Доспех', 'Нагрудный доспех')}
                  {renderSlot('belt', 'Пояс', 'Пояс')}
                  {renderSlot('weapon', 'Меч', 'Оружие')}
                </div>

                {/* Center Portrait */}
                <div className="flex flex-col items-center">
                  <div className="border border-gold-900/40 rounded-lg overflow-hidden bg-obsidian-950 p-2 shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                    <img 
                      src={getPortrait(player.classType)} 
                      alt={player.classType} 
                      className="w-[320px] h-[460px] object-cover rounded border border-obsidian-800" 
                    />
                  </div>
                </div>

                {/* Right Column: 4 Slots */}
                <div className="flex flex-col gap-2.5 items-start">
                  {renderSlot('shield', 'Щит', 'Щит')}
                  {renderSlot('gloves', 'Руки', 'Перчатки')}
                  {renderSlot('boots', 'Ноги', 'Сапоги')}
                  {renderSlot('spellbook', 'Книга', 'Книга заклинаний')}
                </div>

              </div>

              {/* Rings Row below the portrait & vertical grids */}
              <div className="flex flex-wrap justify-center gap-3 mt-1.5">
                {renderSlot('ring1', 'Кольцо', 'Кольцо 1')}
                {renderSlot('ring2', 'Кольцо', 'Кольцо 2')}
                {renderSlot('ring3', 'Кольцо', 'Кольцо 3')}
                {renderSlot('ring4', 'Кольцо', 'Кольцо 4')}
              </div>

              <div className="mt-1.5 text-center">
                <span className="font-gothic text-gold-400 font-bold uppercase tracking-widest text-sm">
                  {player.name}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Sheet & Backpack */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Attribute sheet */}
            <div className="md:col-span-5 gothic-panel p-5 bg-obsidian-900/80 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic border-b border-obsidian-800 pb-2">
                Характеристики персонажа
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-center py-2 font-mono">
                <div className="p-3.5 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Сила</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{getEffectiveStatValue('strength')}</div>
                  {gearStats.strength > 0 && <div className="text-xs text-emerald-400 font-bold mt-0.5">+{gearStats.strength} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Ловкость</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{getEffectiveStatValue('agility')}</div>
                  {gearStats.agility > 0 && <div className="text-xs text-emerald-400 font-bold mt-0.5">+{gearStats.agility} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Выносл.</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{getEffectiveStatValue('endurance')}</div>
                  {gearStats.endurance > 0 && <div className="text-xs text-emerald-400 font-bold mt-0.5">+{gearStats.endurance} от вещ.</div>}
                </div>
                <div className="p-3.5 bg-obsidian-950 rounded border border-obsidian-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Интеллект</div>
                  <div className="text-xl font-bold text-slate-200 mt-1">{getEffectiveStatValue('intellect')}</div>
                  {gearStats.intellect > 0 && <div className="text-xs text-emerald-400 font-bold mt-0.5">+{gearStats.intellect} от вещ.</div>}
                </div>
              </div>
            </div>

            {/* Inventory Backpack */}
            <div className="md:col-span-7 gothic-panel p-5 bg-obsidian-900/80 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic border-b border-obsidian-800 pb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-500" /> Рюкзак (Инвентарь)
              </h3>

              {!player.inventory || player.inventory.length === 0 ? (
                <div className="text-center p-8 bg-obsidian-950/40 border border-obsidian-800 rounded text-slate-500 font-mono text-sm">
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
                            ? 'border-obsidian-850 bg-obsidian-950/20 opacity-60 cursor-default'
                            : isHpPotion && isHpFull
                            ? 'border-obsidian-800 bg-obsidian-950/35 opacity-70 cursor-not-allowed'
                            : 'border-obsidian-800 bg-obsidian-950/40 hover:border-gold-555/50 hover:bg-gold-950/10 cursor-pointer shadow-sm hover:shadow-[0_0_8px_rgba(197,160,40,0.15)]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="text-3xl p-2 bg-obsidian-900 border border-obsidian-800 rounded select-none flex-shrink-0">
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                              {isCombatOnly && (
                                <span className="text-[9px] font-mono text-amber-500/70 border border-amber-900/30 bg-amber-950/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Боевой
                                </span>
                              )}
                              {isHpPotion && (
                                <span className="text-[9px] font-mono text-emerald-555 border border-emerald-900/30 bg-emerald-950/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                  Зелье HP
                                </span>
                              )}
                            </div>
                            
                            {/* Colored stats display directly on card */}
                            {Object.entries(item.stats).length > 0 && (
                              <div className="mt-1 flex flex-row gap-2 flex-wrap">
                                {Object.entries(item.stats).map(([key, val]) => {
                                  let colorClass = 'text-slate-350';
                                  let label = key;
                                  if (key === 'strength') { colorClass = 'text-rose-455'; label = 'Сила'; }
                                  if (key === 'agility') { colorClass = 'text-emerald-455'; label = 'Ловк.'; }
                                  if (key === 'endurance') { colorClass = 'text-red-455'; label = 'Выносл.'; }
                                  if (key === 'intellect') { colorClass = 'text-sky-455'; label = 'Инт.'; }
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