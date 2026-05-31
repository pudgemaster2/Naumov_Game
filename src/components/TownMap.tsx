import React, { useState } from 'react';
import townImage from '../assets/town.jpg';

export type TownLocationKey =
  | 'upper_tier'
  | 'temple'
  | 'arena'
  | 'market'
  | 'tavern'
  | 'forge'
  | 'my_house'
  | 'gates'
  | 'siege'
  | 'post';

interface TownLocationData {
  key: TownLocationKey;
  name: string;
  description: string;
  style: { top: string; left: string };
}

const TOWN_LOCATIONS: TownLocationData[] = [
  {
    key: 'upper_tier',
    name: 'Верхний Ярус',
    description: 'Веревочные мосты и дома старейшин в кронах священных деревьев.',
    style: { top: '7%', left: '50%' }
  },
  {
    key: 'temple',
    name: 'Храм',
    description: 'Величественное святилище у водопада, где эльфы молят о благословении.',
    style: { top: '25%', left: '54%' }
  },
  {
    key: 'arena',
    name: 'Арена',
    description: 'Круглая каменная платформа, на которой бойцы доказывают свою силу.',
    style: { top: '35%', left: '35%' }
  },
  {
    key: 'market',
    name: 'Рынок',
    description: 'Шумный рынок с редкими снадобьями, амулетами и экипировкой.',
    style: { top: '38%', left: '77%' }
  },
  {
    key: 'tavern',
    name: 'Таверна',
    description: 'Место сбора путешественников. Здесь наливают эль и играют в кости.',
    style: { top: '42%', left: '90%' }
  },
  {
    key: 'forge',
    name: 'Кузница',
    description: 'Каменный горн кузнеца Торвальда. Здесь куются мечи и доспехи.',
    style: { top: '53%', left: '24%' }
  },
  {
    key: 'my_house',
    name: 'Мой Дом',
    description: 'Ваш личный уютный уголок. Здесь находится кровать, сундук и снаряжение.',
    style: { top: '58%', left: '68%' }
  },
  {
    key: 'gates',
    name: 'Главные Врата',
    description: 'Оборонительные врата города. Отсюда воины уходят патрулировать стены.',
    style: { top: '74%', left: '36%' }
  },
  {
    key: 'siege',
    name: 'Катапульта',
    description: 'Мощная баллиста и катапульта для обороны города. Можно сделать выстрел.',
    style: { top: '71%', left: '77%' }
  },
  {
    key: 'post',
    name: 'Оборонительный Пост',
    description: 'Башня стражи, где новобранцы тренируются и изучают военное ремесло.',
    style: { top: '92%', left: '84%' }
  },
];

interface TownMapProps {
  onSelectLocation: (locationKey: TownLocationKey) => void;
}

export const TownMap: React.FC<TownMapProps> = ({ onSelectLocation }) => {
  const [hoveredLoc, setHoveredLoc] = useState<TownLocationData | null>(null);

  return (
    <div className="flex flex-col items-center w-full max-w-[1100px] mx-auto space-y-4">
      {/* City Banner Header */}
      <div className="w-full text-center h-28 flex flex-col justify-center bg-obsidian-950/80 border border-gold-900/30 rounded p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-950/10 via-transparent to-gold-950/10" />
        {hoveredLoc ? (
          <div className="animate-fade-in">
            <h3 className="text-2xl md:text-3xl font-bold font-gothic tracking-widest text-gold-400">
              {hoveredLoc.name}
            </h3>
            <p className="text-sm md:text-base text-slate-400 font-sans tracking-wide mt-1">
              {hoveredLoc.description}
            </p>
          </div>
        ) : (
          <div className="opacity-60 text-slate-500 font-gothic tracking-widest text-base uppercase">
            Выберите локацию для перемещения
          </div>
        )}
      </div>

      {/* Town Map Wrapper */}
      <div className="relative w-full aspect-square bg-obsidian-950 border border-gold-600/50 rounded-lg overflow-hidden shadow-2xl">
        {/* Background Map Image */}
        <img
          src={townImage}
          alt="Town Map"
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Absolute positioned interactive text buttons */}
        {TOWN_LOCATIONS.map((loc) => {
          const isHovered = hoveredLoc?.key === loc.key;
          return (
            <button
              key={loc.key}
              onClick={() => onSelectLocation(loc.key)}
              onMouseEnter={() => setHoveredLoc(loc)}
              onMouseLeave={() => setHoveredLoc(null)}
              className={`absolute z-10 px-4 py-2.5 -translate-x-1/2 -translate-y-1/2 font-gothic text-xs md:text-sm lg:text-[15px] rounded font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer shadow-lg select-none border ${
                isHovered
                  ? 'bg-obsidian-900 text-gold-300 border-gold-400 scale-105 shadow-[0_0_15px_rgba(197,160,40,0.6)]'
                  : 'bg-obsidian-950/90 text-gold-400/80 border-gold-900/50 hover:bg-obsidian-900 hover:text-gold-300'
              }`}
              style={{ top: loc.style.top, left: loc.style.left }}
            >
              {loc.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
