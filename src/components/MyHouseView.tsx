import React, { useState } from 'react';
import type { Character, CharacterClass, AvatarSettings } from '../types';
import { CLASS_TEMPLATES } from '../types';
import { CustomAvatar, DEFAULT_AVATAR_COLORS } from './CustomAvatar';
import { Button } from './ui/Button';
import { Check, Info, Bed, Inbox, User, Settings2 } from 'lucide-react';

interface MyHouseViewProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const MyHouseView: React.FC<MyHouseViewProps> = ({ player, onSave, onBack }) => {
  // Appearance Editor States
  const [name, setName] = useState(player.name);
  const [classType, setClassType] = useState<CharacterClass>(player.classType);
  const [gender, setGender] = useState<'male' | 'female'>(player.avatarSettings?.gender || 'male');
  const [hairColor, setHairColor] = useState(player.avatarSettings?.hairColor || DEFAULT_AVATAR_COLORS.hair[0].value);
  const [skinColor, setSkinColor] = useState(player.avatarSettings?.skinColor || DEFAULT_AVATAR_COLORS.skin[0].value);
  const [outfitColor, setOutfitColor] = useState(player.avatarSettings?.outfitColor || DEFAULT_AVATAR_COLORS.outfit[0].value);
  const [faceStyle, setFaceStyle] = useState(player.avatarSettings?.faceStyle || 0);

  // Interaction States
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepProgress, setSleepProgress] = useState(0);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [chestMessage, setChestMessage] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if daily claim is available
  const todayDateString = new Date().toISOString().split('T')[0];
  const isDailyAvailable = player.lastDailyClaim !== todayDateString;

  // Handle Bed Click (Rest / Sleep)
  const handleSleep = () => {
    setIsSleeping(true);
    setSleepProgress(0);

    // Sleep progress animation simulation
    const interval = setInterval(() => {
      setSleepProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Restore HP to full
            const healedPlayer = {
              ...player,
              currentHp: player.maxHp,
            };
            onSave(healedPlayer).then(() => {
              setIsSleeping(false);
            });
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Handle Chest Click (Daily Reward)
  const handleOpenChest = async () => {
    if (!isDailyAvailable) {
      setChestMessage('Вы уже забирали сегодняшнюю добычу из сундука. Возвращайтесь завтра!');
      setIsChestOpen(true);
      return;
    }

    setIsChestOpen(true);
    // Add 25 gold to player
    const updatedPlayer = {
      ...player,
      gold: player.gold + 25,
      lastDailyClaim: todayDateString,
    };

    setChestMessage('Скрипучая крышка открывается... Вы нашли 💰 25 золота на дне сундука!');
    await onSave(updatedPlayer);
  };

  // Handle Saving Appearance and Class Changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    
    // Check if class changed. If so, apply template base stats but keep upgrades if any
    let updatedStats = { ...player.stats };
    let updatedMaxHp = player.maxHp;
    
    if (classType !== player.classType) {
      const template = CLASS_TEMPLATES[classType];
      // Reset to class base template, plus any previous level stats increases
      const levelDiff = player.level - 1;
      
      // Blacksmith upgrades persist if player has them, or resets. Let's keep them if present.
      const upgrades = player.upgrades || {};
      updatedStats = {
        strength: template.stats.strength + levelDiff + (upgrades.strength || 0),
        agility: template.stats.agility + levelDiff + (upgrades.agility || 0),
        endurance: template.stats.endurance + levelDiff + (upgrades.endurance || 0),
        intellect: template.stats.intellect + levelDiff + (upgrades.intellect || 0),
      };
      updatedMaxHp = updatedStats.endurance * 10;
    }

    const updatedAvatar: AvatarSettings = {
      gender,
      hairColor,
      skinColor,
      outfitColor,
      faceStyle,
    };

    const updatedPlayer: Character = {
      ...player,
      name: name.trim() || player.name,
      classType,
      stats: updatedStats,
      maxHp: updatedMaxHp,
      currentHp: Math.min(player.currentHp, updatedMaxHp),
      avatarSettings: updatedAvatar,
    };

    await onSave(updatedPlayer);
    setIsSaving(false);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6 relative">
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

      {/* Header bar inside House */}
      <div className="flex justify-between items-center border-b border-obsidian-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-gothic text-gold-400 tracking-widest flex items-center gap-2">
            🏡 МОЙ УЮТНЫЙ ДОМ
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wider">
            Ваше личное убежище в кроне Великого Древа
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} className="text-xs">
          Выйти на улицу
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Room objects (Bed & Chest) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="gothic-panel p-6 bg-obsidian-900/80 rounded-lg space-y-6">
            <h3 className="text-lg font-bold font-gothic text-gold-400 border-b border-obsidian-800 pb-2 flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gold-500" /> Интерактивная Комната
            </h3>
            
            {/* Bed Section */}
            <div className="border border-obsidian-800 p-4 rounded-lg bg-obsidian-950/50 flex items-center justify-between gap-4 hover:border-gold-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-950/50 text-blue-400 border border-blue-900/30 rounded-lg">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-gothic text-slate-200">Дубовая Кровать</h4>
                  <p className="text-xs text-slate-400 mt-1">Отдохните, чтобы мгновенно восстановить всё здоровье.</p>
                </div>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleSleep}
                disabled={player.currentHp >= player.maxHp}
              >
                Лечь спать
              </Button>
            </div>

            {/* Chest Section */}
            <div className="border border-obsidian-800 p-4 rounded-lg bg-obsidian-950/50 flex items-center justify-between gap-4 hover:border-gold-800/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-950/50 text-amber-400 border border-amber-900/30 rounded-lg">
                  <Inbox className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-gothic text-slate-200">Резной Сундук</h4>
                  <p className="text-xs text-slate-400 mt-1">Содержит ежедневную награду в виде золотых монет.</p>
                </div>
              </div>
              <button 
                onClick={handleOpenChest}
                className="gothic-btn px-4 py-2 text-xs rounded"
              >
                Открыть
              </button>
            </div>
            
            {/* HP Status and info */}
            <div className="p-3 bg-obsidian-950 border border-obsidian-800 rounded font-mono text-xs text-slate-400 flex justify-between items-center">
              <span>Текущее Здоровье:</span>
              <span className={`font-bold ${player.currentHp < player.maxHp ? 'text-rose-400' : 'text-emerald-400'}`}>
                {player.currentHp} / {player.maxHp} HP
              </span>
            </div>
          </div>

          {/* Interactive Chest Modal */}
          {isChestOpen && (
            <div className="gothic-panel-gold p-6 bg-obsidian-900/95 rounded-lg space-y-4 text-center relative animate-fade-in">
              <h3 className="text-xl font-bold font-gothic text-gold-400">Старинный Сундук</h3>
              
              <div className="py-4 text-6xl animate-bounce">
                {isDailyAvailable ? '🎁' : '🗝️'}
              </div>

              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {chestMessage}
              </p>

              <div className="pt-2">
                <Button variant="secondary" size="sm" onClick={() => setIsChestOpen(false)}>
                  Закрыть сундук
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Appearance Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="gothic-panel-gold p-6 bg-obsidian-900/80 rounded-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center border-b border-obsidian-800 pb-4 gap-4">
              <h3 className="text-lg font-bold font-gothic text-gold-400 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" /> Настройка Героя
              </h3>
              {showSaveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-900/50 px-2.5 py-1 rounded">
                  <Check className="w-4 h-4" /> Изменения сохранены!
                </div>
              )}
            </div>

            {/* Real-time Custom SVG Avatar Preview */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-obsidian-800 rounded bg-obsidian-950/50">
              <div className="flex flex-col items-center">
                <CustomAvatar 
                  gender={gender} 
                  hairColor={hairColor} 
                  skinColor={skinColor} 
                  outfitColor={outfitColor} 
                  faceStyle={faceStyle}
                  className="w-32 h-32 md:w-36 md:h-36 drop-shadow-[0_0_15px_rgba(197,160,40,0.15)]"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-2">Вид в игре</span>
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {/* Character Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">Имя персонажа</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full gothic-input px-3 py-2 rounded font-sans text-sm focus:ring-1 focus:ring-gold-500"
                    maxLength={16}
                  />
                </div>

                {/* Class selector */}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-400 block">Класс (Специализация)</label>
                  <select 
                    value={classType}
                    onChange={(e) => setClassType(e.target.value as CharacterClass)}
                    className="w-full bg-obsidian-950 border border-obsidian-600 focus:border-gold-500 focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="barbarian">Силач (Воин)</option>
                    <option value="mage">Маг</option>
                    <option value="archer">Эльф-лучник</option>
                  </select>
                  {classType !== player.classType && (
                    <div className="flex items-start gap-1 text-[10px] text-amber-500 font-sans mt-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>При смене класса базовые характеристики будут пересчитаны под шаблон нового класса. Улучшения из кузницы сохранятся.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customization Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Gender selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Пол (Силуэт)</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${
                      gender === 'male' 
                        ? 'border-gold-500 bg-gold-900/10 text-gold-400 font-bold' 
                        : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                    }`}
                  >
                    Мужской
                  </button>
                  <button 
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${
                      gender === 'female' 
                        ? 'border-gold-500 bg-gold-900/10 text-gold-400 font-bold' 
                        : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                    }`}
                  >
                    Женский
                  </button>
                </div>
              </div>

              {/* Expression selector */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Выражение лица</label>
                <div className="flex gap-2">
                  {[0, 1, 2].map((style) => (
                    <button
                      key={style}
                      onClick={() => setFaceStyle(style)}
                      className={`flex-1 py-1.5 text-xs font-mono rounded border transition-colors ${
                        faceStyle === style
                          ? 'border-gold-500 bg-gold-900/10 text-gold-400 font-bold'
                          : 'border-obsidian-800 bg-obsidian-950 text-slate-400'
                      }`}
                    >
                      {style === 0 ? 'Решительный' : style === 1 ? 'Хитрый' : 'Мудрый'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color picker */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Цвет волос</label>
                <div className="grid grid-cols-6 gap-2">
                  {DEFAULT_AVATAR_COLORS.hair.map((hc) => (
                    <button
                      key={hc.value}
                      onClick={() => setHairColor(hc.value)}
                      title={hc.label}
                      className={`w-full aspect-square rounded-full border transition-all ${
                        hairColor === hc.value ? 'ring-2 ring-gold-500 scale-110 border-white' : 'border-obsidian-800'
                      }`}
                      style={{ backgroundColor: hc.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Skin color picker */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 block">Цвет кожи</label>
                <div className="grid grid-cols-5 gap-2">
                  {DEFAULT_AVATAR_COLORS.skin.map((sc) => (
                    <button
                      key={sc.value}
                      onClick={() => setSkinColor(sc.value)}
                      title={sc.label}
                      className={`w-full aspect-square rounded-full border transition-all ${
                        skinColor === sc.value ? 'ring-2 ring-gold-500 scale-110 border-white' : 'border-obsidian-800'
                      }`}
                      style={{ backgroundColor: sc.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Outfit color picker */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-mono text-slate-400 block">Цвет одеяния</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AVATAR_COLORS.outfit.map((oc) => (
                    <button
                      key={oc.value}
                      onClick={() => setOutfitColor(oc.value)}
                      title={oc.label}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded border transition-all ${
                        outfitColor === oc.value
                          ? 'border-gold-500 bg-gold-900/10 text-gold-400'
                          : 'border-obsidian-800 bg-obsidian-950 text-slate-500'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: oc.value }} />
                      {oc.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-obsidian-800">
              <Button 
                onClick={handleSaveChanges} 
                fullWidth 
                disabled={isSaving}
                className="py-3 flex items-center justify-center gap-2"
              >
                {isSaving ? 'Сохранение...' : 'Сохранить изменения персонажа'}
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
