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
  style: { 
    top: string; 
    left: string; 
    width: string; 
    height: string; 
  };
}

const TOWN_LOCATIONS: TownLocationData[] = [
  {
    key: 'upper_tier',
    name: 'Верхний Ярус',
    description: 'Веревочные мосты и дома старейшин в кронах священных деревьев.',
    style: { top: '6.5%', left: '50%', width: '22%', height: '7%' }
  },
  {
    key: 'temple',
    name: 'Храм',
    description: 'Величественное святилище у водопада, где эльфы молят о благословении.',
    style: { top: '25.5%', left: '54%', width: '13%', height: '7%' }
  },
  {
    key: 'arena',
    name: 'Арена',
    description: 'Круглая каменная платформа, на которой бойцы доказывают свою силу.',
    style: { top: '34.5%', left: '33.5%', width: '13%', height: '7%' }
  },
  {
    key: 'market',
    name: 'Рынок',
    description: 'Шумный рынок с редкими снадобьями, амулетами и экипировкой.',
    style: { top: '37.5%', left: '76.5%', width: '14%', height: '7%' }
  },
  {
    key: 'tavern',
    name: 'Таверна',
    description: 'Место сбора путешественников. Здесь наливают эль и играют в кости.',
    style: { top: '41.5%', left: '90%', width: '16%', height: '7%' }
  },
  {
    key: 'forge',
    name: 'Кузница',
    description: 'Каменный горн кузнеца Торвальда. Здесь куются мечи и доспехи.',
    style: { top: '52.5%', left: '24%', width: '16%', height: '7%' }
  },
  {
    key: 'my_house',
    name: 'Мой Дом',
    description: 'Ваш личный уютный уголок. Здесь находится кровать, сундук и снаряжение.',
    style: { top: '57.5%', left: '68%', width: '16%', height: '7%' }
  },
  {
    key: 'gates',
    name: 'Главные Врата',
    description: 'Оборонительные врата города. Отсюда воины уходят патрулировать стены.',
    style: { top: '74%', left: '36%', width: '24%', height: '7%' }
  },
  {
    key: 'siege',
    name: 'Осадные Орудия',
    description: 'Мощная баллиста и катапульта для обороны города. Можно сделать выстрел.',
    style: { top: '73%', left: '76%', width: '28%', height: '7%' }
  },
  {
    key: 'post',
    name: 'Оборонительный Пост',
    description: 'Башня стражи, где новобранцы тренируются и изучают военное ремесло.',
    style: { top: '92.5%', left: '84%', width: '32%', height: '7%' }
  },
];

interface TownMapProps {
  onSelectLocation: (locationKey: TownLocationKey) => void;
}

export const TownMap: React.FC<TownMapProps> = ({ onSelectLocation }) => {
  const [hoveredLoc, setHoveredLoc] = useState<TownLocationData | null>(null);

  return (
    <div className="flex flex-col items-center w-full max-w-[1100px] mx-auto space-y-4 select-none">
      {/* Town Map Wrapper */}
      <div className="relative w-full aspect-square bg-obsidian-950 border border-gold-600/50 rounded-lg overflow-hidden shadow-2xl">
        {/* Background Map Image */}
        <img
          src={townImage}
          alt="Town Map"
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Absolute positioned interactive transparent hot-zones */}
        {TOWN_LOCATIONS.map((loc) => {
          const isHovered = hoveredLoc?.key === loc.key;
          return (
            <button
              key={loc.key}
              onClick={() => onSelectLocation(loc.key)}
              onMouseEnter={() => setHoveredLoc(loc)}
              onMouseLeave={() => setHoveredLoc(null)}
              className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-md cursor-pointer select-none town-hotzone ${
                isHovered ? 'scale-[1.03]' : ''
              }`}
              style={{
                top: loc.style.top,
                left: loc.style.left,
                width: loc.style.width,
                height: loc.style.height,
              }}
              title={loc.name}
            >
              {/* Invisible name for screen readers */}
              <span className="absolute opacity-0 pointer-events-none">{loc.name}</span>
            </button>
          );
        })}
      </div>

      {/* Description banner */}
      <div className="w-full p-4 text-center border border-gold-900/20 bg-obsidian-900/60 rounded-lg backdrop-blur-sm min-h-[76px] flex flex-col justify-center">
        {hoveredLoc ? (
          <div className="animate-fade-in space-y-1">
            <h4 className="text-sm font-bold text-gold-400 uppercase tracking-widest font-gothic">{hoveredLoc.name}</h4>
            <p className="text-xs text-slate-350">{hoveredLoc.description}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Наведите курсор мыши на надписи на карте для перехода в локации
          </p>
        )}
      </div>
    </div>
  );
};
