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
    style: { top: '6.5%', left: '50%', width: '26.4%', height: '8.4%' }
  },
  {
    key: 'temple',
    name: 'Храм',
    description: 'Величественное святилище у водопада, где эльфы молят о благословении.',
    style: { top: '25.5%', left: '54%', width: '15.6%', height: '8.4%' }
  },
  {
    key: 'arena',
    name: 'Арена',
    description: 'Круглая каменная платформа, на которой бойцы доказывают свою силу.',
    style: { top: '34.5%', left: '33.5%', width: '15.6%', height: '8.4%' }
  },
  {
    key: 'market',
    name: 'Рынок',
    description: 'Шумный рынок с редкими снадобьями, амулетами и экипировкой.',
    style: { top: '37.5%', left: '76.5%', width: '16.8%', height: '8.4%' }
  },
  {
    key: 'tavern',
    name: 'Таверна',
    description: 'Место сбора путешественников. Здесь наливают эль и играют в кости.',
    style: { top: '41.5%', left: '90%', width: '19.2%', height: '8.4%' }
  },
  {
    key: 'forge',
    name: 'Кузница',
    description: 'Каменный горн кузнеца Торвальда. Здесь куются мечи и доспехи.',
    style: { top: '52.5%', left: '24%', width: '19.2%', height: '8.4%' }
  },
  {
    key: 'my_house',
    name: 'Мой Дом',
    description: 'Ваш личный уютный уголок. Здесь находится кровать, сундук и снаряжение.',
    style: { top: '57.5%', left: '68%', width: '19.2%', height: '8.4%' }
  },
  {
    key: 'gates',
    name: 'Главные Врата',
    description: 'Оборонительные врата города. Отсюда воины уходят патрулировать стены.',
    style: { top: '74%', left: '36%', width: '28.8%', height: '8.4%' }
  },
  {
    key: 'siege',
    name: 'Осадные Орудия',
    description: 'Мощная баллиста и катапульта для обороны города. Можно сделать выстрел.',
    style: { top: '73%', left: '76%', width: '33.6%', height: '8.4%' }
  },
  {
    key: 'post',
    name: 'Оборонительный Пост',
    description: 'Башня стражи, где новобранцы тренируются и изучают военное ремесло.',
    style: { top: '92.5%', left: '84%', width: '38.4%', height: '8.4%' }
  },
];

interface TownMapProps {
  onSelectLocation: (locationKey: TownLocationKey) => void;
}

export const TownMap: React.FC<TownMapProps> = ({ onSelectLocation }) => {
  const [hoveredLoc, setHoveredLoc] = useState<TownLocationData | null>(null);

  return (
    <div className="relative h-full aspect-[1.1/1] max-h-full bg-obsidian-950 border border-gold-600/50 rounded-lg overflow-hidden shadow-2xl mx-auto select-none">
      {/* Background Map Image */}
      <img
        src={townImage}
        alt="Town Map"
        className="w-full h-full object-fill select-none pointer-events-none"
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
  );
};
