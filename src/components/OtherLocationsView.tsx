import React, { useState, useEffect } from 'react';
import type { Character } from '../types';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import { Button } from './ui/Button';
import { Shield, Sparkles, Timer, Target, HelpCircle } from 'lucide-react';

interface OtherLocationsViewProps {
  locationKey: 'gates' | 'siege' | 'post' | 'upper_tier';
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
}

export const OtherLocationsView: React.FC<OtherLocationsViewProps> = ({
  locationKey,
  player,
  onSave,
  onBack,
}) => {
  const [log, setLog] = useState<string | null>(null);

  // States for Gates (Guard Patrol)
  const [patrolTimeLeft, setPatrolTimeLeft] = useState<number>(0);
  const [isPatrolling, setIsPatrolling] = useState(false);

  // States for Catapult
  const [isCatapultLoading, setIsCatapultLoading] = useState(false);

  // Effect for guard patrol timer
  useEffect(() => {
    if (!isPatrolling) return;
    if (patrolTimeLeft <= 0) {
      setIsPatrolling(false);
      handleFinishPatrol();
      return;
    }

    const timer = setTimeout(() => {
      setPatrolTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isPatrolling, patrolTimeLeft]);

  // Start patrol
  const handleStartPatrol = () => {
    setIsPatrolling(true);
    setPatrolTimeLeft(5);
    setLog('⚔️ Вы заступили в караул. Вы патрулируете стены цитадели, зорко осматривая окрестные леса...');
  };

  const handleFinishPatrol = async () => {
    const rewardGold = 15;
    const updatedPlayer: Character = {
      ...player,
      gold: player.gold + rewardGold,
    };
    await onSave(updatedPlayer);
    setLog(`✅ Караул завершен успешно! Нарушителей не обнаружено. Капитан стражи выплатил вам жалованье: 💰 ${rewardGold} золота.`);
  };

  // Fire Catapult mini-game
  const handleFireCatapult = () => {
    setIsCatapultLoading(true);
    setLog('⚙️ Натяжение тетивы... Снаряд уложен... Цель захвачена!');

    setTimeout(async () => {
      const roll = Math.random();
      let outcome = '';
      let rewardGold = 0;
      let rewardXp = 0;

      if (roll < 0.25) {
        outcome = '🎯 Прямое попадание! Огромный валун обрушился на отряд диких троллей, скрывавшихся в кустах! Капитан стражи благодарит вас.';
        rewardXp = 30;
        rewardGold = 10;
      } else if (roll < 0.5) {
        outcome = '💥 Дерево пополам! Валун врезался в вековой дуб, и с его кроны на землю свалился старый разбойничий мешок с монетами!';
        rewardGold = 20;
      } else if (roll < 0.75) {
        outcome = '🎯 Отличный выстрел! Вы попали точно в тренировочную мишень на дальнем холме. Наводчики делают пометки в картах.';
        rewardXp = 15;
      } else {
        outcome = '💨 Мимо! Камень улетел далеко в лесную чащу, напугав лишь стаю птиц. Попробуйте прицелиться лучше в следующий раз!';
      }

      let updatedLevel = player.level;
      let updatedExperience = player.experience + rewardXp;
      let updatedStats = { ...player.stats };
      let updatedMaxHp = player.maxHp;
      let updatedCurrentHp = player.currentHp;
      const levelUpNotifications: string[] = [];

      while (updatedExperience >= updatedLevel * 100) {
        updatedExperience -= updatedLevel * 100;
        updatedLevel += 1;
        updatedStats.strength += 1;
        updatedStats.agility += 1;
        updatedStats.endurance += 1;
        updatedStats.intellect += 1;
        levelUpNotifications.push(`🎉 Вы получили новый уровень: ${updatedLevel}! Все характеристики +1!`);
      }
      updatedMaxHp = updatedStats.endurance * 10;
      if (rewardXp > 0 && updatedLevel > player.level) {
        updatedCurrentHp = updatedMaxHp;
      }

      const updatedPlayer: Character = {
        ...player,
        gold: player.gold + rewardGold,
        experience: updatedExperience,
        level: updatedLevel,
        stats: updatedStats,
        maxHp: updatedMaxHp,
        currentHp: updatedCurrentHp,
      };

      await onSave(updatedPlayer);
      setIsCatapultLoading(false);
      setLog(`☄️ ВЫСТРЕЛ! Снаряд с грохотом летит за стены...\n\n${outcome}${rewardGold > 0 ? ` (+💰 ${rewardGold} золота)` : ''}${rewardXp > 0 ? ` (+⭐ ${rewardXp} опыта)` : ''}\n\n${levelUpNotifications.join('\n')}`);
    }, 1200);
  };

  // Guard Training ground
  const handleTrain = async () => {
    const cost = 10;
    if (player.gold < cost) {
      setLog('💰 Недостаточно золота для спарринга со стражниками (требуется 10 золотых).');
      return;
    }

    const rewardXp = 25;
    let updatedLevel = player.level;
    let updatedExperience = player.experience + rewardXp;
    let updatedStats = { ...player.stats };
    let updatedMaxHp = player.maxHp;
    let updatedCurrentHp = player.currentHp;
    const levelUpNotifications: string[] = [];

    while (updatedExperience >= updatedLevel * 100) {
      updatedExperience -= updatedLevel * 100;
      updatedLevel += 1;
      updatedStats.strength += 1;
      updatedStats.agility += 1;
      updatedStats.endurance += 1;
      updatedStats.intellect += 1;
      levelUpNotifications.push(`🎉 Вы получили новый уровень: ${updatedLevel}! Характеристики возросли!`);
    }
    updatedMaxHp = updatedStats.endurance * 10;
    if (updatedLevel > player.level) {
      updatedCurrentHp = updatedMaxHp;
    }

    const updatedPlayer: Character = {
      ...player,
      gold: player.gold - cost,
      experience: updatedExperience,
      level: updatedLevel,
      stats: updatedStats,
      maxHp: updatedMaxHp,
      currentHp: updatedCurrentHp,
    };

    await onSave(updatedPlayer);
    setLog(`⚔️ Вы провели часовой спарринг на тренировочных мечах с опытным сержантом. Тело ломит от усталости, но боевые навыки улучшились! Получено +25 XP.\n\n${levelUpNotifications.join('\n')}`);
  };

  // Render locations
  const renderContent = () => {
    switch (locationKey) {
      case 'gates':
        return (
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg space-y-6 text-slate-800">
            <h3 className="text-xl font-bold font-gothic text-slate-900 border-b border-slate-250 pb-3 flex items-center gap-3">
              <Shield className="w-6 h-6 text-gold-650" /> Караульный пост у Ворот
            </h3>
            
            <p className="text-sm text-slate-650 leading-relaxed font-sans">
              Главные ворота — оплот безопасности эльфийского города. Стражники неустанно следят за рубежами. Вы можете помочь им и заступить в караульный патруль на стены, чтобы заработать жалование.
            </p>

            <div className="flex flex-col items-center p-8 border border-slate-250 rounded bg-slate-50/50 text-center space-y-5">
              {isPatrolling ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-amber-50 text-gold-700 border border-amber-300 rounded-full flex items-center justify-center text-2xl font-bold animate-pulse mx-auto">
                    {patrolTimeLeft}с
                  </div>
                  <div className="text-sm text-slate-650 font-mono">Обход периметра стен...</div>
                  <div className="w-64 h-2.5 bg-slate-200 rounded overflow-hidden">
                    <div 
                      className="h-full bg-gold-600 transition-all duration-1000"
                      style={{ width: `${(5 - patrolTimeLeft) * 20}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-5xl select-none">💂</div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Дозор на Стенах</h4>
                    <p className="text-xs text-slate-650 mt-1">Время дозора: 5 секунд. Награда: 💰 15 золота.</p>
                  </div>
                  <Button 
                    onClick={handleStartPatrol}
                    disabled={isPatrolling}
                  >
                    Заступить на патруль
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'siege':
        return (
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg space-y-6 text-slate-800">
            <h3 className="text-xl font-bold font-gothic text-slate-900 border-b border-slate-250 pb-3 flex items-center gap-3">
              <Target className="w-6 h-6 text-gold-650" /> Осадный Расчет Катапульты
            </h3>
            
            <p className="text-sm text-slate-650 leading-relaxed font-sans">
              На вершине южной стены установлены мощные катапульты и баллисты, способные пробивать доспехи великанов. Испытайте свою удачу и глазомер: зарядите снаряд и произведите выстрел по вражескому лагерю в лесу!
            </p>

            <div className="flex flex-col items-center p-8 border border-slate-250 rounded bg-slate-50/50 text-center space-y-5">
              <div className="text-6xl select-none">☄️</div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Произвести Выстрел по Окрестностям</h4>
                <p className="text-xs text-slate-650 mt-1">Испытайте удачу. Случайная награда: золото или боевой опыт.</p>
              </div>
              <Button 
                onClick={handleFireCatapult}
                disabled={isCatapultLoading}
              >
                {isCatapultLoading ? 'Снаряд летит...' : 'Выстрелить из катапульты'}
              </Button>
            </div>
          </div>
        );

      case 'post':
        return (
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg space-y-6 text-slate-800">
            <h3 className="text-xl font-bold font-gothic text-slate-900 border-b border-slate-250 pb-3 flex items-center gap-3">
              <Timer className="w-6 h-6 text-gold-650" /> Плац Оборонительного Поста
            </h3>
            
            <p className="text-sm text-slate-650 leading-relaxed font-sans">
              Оборонительный пост стражи кипит жизнью. Новобранцы и элитные лучники отрабатывают боевые стойки под бдительным взором сержанта. Здесь вы можете потренироваться в искусстве фехтования, пожертвовав золото на амуницию.
            </p>

            <div className="flex flex-col items-center p-8 border border-slate-250 rounded bg-slate-50/50 text-center space-y-5">
              <div className="text-5xl select-none">⚔️</div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Боевой Тренировочный Спарринг</h4>
                <p className="text-xs text-slate-650 mt-1">Стоимость: 💰 10 золота. Награда: ⭐ +25 Опыта (XP).</p>
              </div>
              <Button 
                onClick={handleTrain}
                disabled={player.gold < 10}
              >
                Тренироваться со стражей
              </Button>
            </div>
          </div>
        );

      case 'upper_tier':
        return (
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg space-y-6 text-slate-800">
            <h3 className="text-xl font-bold font-gothic text-slate-900 border-b border-slate-250 pb-3 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-gold-650" /> Дерево Старейшин (Верхний Ярус)
            </h3>
            
            <p className="text-sm text-slate-650 leading-relaxed font-sans">
              Верхний ярус утопает в листве гигантского дуба. Здесь, среди веревочных переходов, живет верховный Старейшина эльфов по имени Элронд. Он помнит времена основания города и готов побеседовать о судьбе мира.
            </p>

            <div className="border border-slate-250 p-6 rounded bg-slate-50/50 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center text-4xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.1)] select-none">
                  👴
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-gothic">Архивариус Элронд</h4>
                  <p className="text-xs text-slate-650 uppercase tracking-widest font-mono">Старейшина города</p>
                </div>
              </div>
              
              <div className="p-5 border-l-2 border-gold-500 bg-amber-50 rounded-r text-sm text-slate-800 italic font-serif leading-relaxed space-y-3">
                <p>«Приветствую тебя, молодой боец {player.name}. Твой путь ведет на славную Арену, где куется дух бойцов.»</p>
                <p>«Помни эльфийскую мудрость: Сила дает мощный замах меча, Ловкость защищает от ударов врага и позволяет поразить уязвимое место, а Выносливость дает стойкость пережить самую свирепую атаку.»</p>
                <p>«Зарабатывай золото в боях и у кузнеца, трать его с умом на усиление духа. Пусть твой клинок никогда не затупится!»</p>
              </div>

              <div className="flex justify-end font-mono text-xs text-slate-500">
                Уровень вашего героя: {player.level} | Раса: {RACE_TEMPLATES[player.race]?.title || player.race} | Класс: {CLASS_TEMPLATES[player.classType]?.title || player.classType}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (locationKey) {
      case 'gates': return 'ГЛАВНЫЕ ВРАТА ЦИТАДЕЛИ';
      case 'siege': return 'ОСАДНЫЙ ПОСТ';
      case 'post': return 'ОБОРОНИТЕЛЬНЫЙ ПОСТ';
      case 'upper_tier': return 'ВЕРХНИЙ ЯРУС СТАРЕЙШИН';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-300 pb-5">
        <div>
          <h2 className="text-3xl font-bold font-gothic text-slate-900 tracking-widest flex items-center gap-3">
            🧭 {getTitle()}
          </h2>
          <p className="text-sm font-mono text-slate-650 mt-2 uppercase tracking-wider">
            Эльфийский Город-Государство и его рубежи
          </p>
        </div>
        <Button variant="secondary" onClick={onBack} size="md">
          Вернуться в город
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info panel */}
        <div className="space-y-4">
          <div className="gothic-panel p-6 bg-slate-100/90 border-slate-300 rounded-lg flex flex-col items-center text-center text-slate-800">
            <h3 className="text-lg font-bold font-gothic text-slate-900">Эльфийская Цитадель</h3>
            <p className="text-sm text-slate-650 mt-3 leading-relaxed">
              Древний форпост в лесах, защищающий жителей от диких лесных чудовищ.
            </p>

            <div className="w-full mt-6 p-4 bg-slate-200 border border-slate-300 rounded font-mono text-sm flex justify-between items-center text-slate-750">
              <span>Золото:</span>
              <span className="text-amber-700 font-extrabold text-base">💰 {player.gold}</span>
            </div>

            <div className="w-full mt-3 p-4 bg-slate-200 border border-slate-300 rounded font-mono text-sm flex justify-between items-center text-slate-750">
              <span>Опыт (XP):</span>
              <span className="text-amber-700 font-extrabold text-base">⭐ {player.experience}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="md:col-span-2 space-y-4">
          {renderContent()}

          {/* Activity log */}
          {log && (
            <div className="p-5 border border-gold-300 rounded bg-amber-50 text-sm text-amber-900 font-serif leading-relaxed whitespace-pre-line animate-fade-in flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-gold-700 mt-0.5" />
              <span>{log}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
