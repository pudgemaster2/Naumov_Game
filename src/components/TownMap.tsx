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
  points: string;
}

const TOWN_LOCATIONS: TownLocationData[] = [
  {
    key: 'upper_tier',
    name: 'Верхний Ярус',
    description: 'Веревочные мосты и дома старейшин в кронах священных деревьев.',
    points: '50,10 950,10 930,200 780,210 500,165 220,210 70,200',
  },
  {
    key: 'temple',
    name: 'Храм Воды',
    description: 'Величественное святилище у водопада, где эльфы молят о благословении.',
    points: '440,215 560,215 620,290 560,405 480,410 380,290',
  },
  {
    key: 'arena',
    name: 'Арена Гладиаторов',
    description: 'Круглая каменная платформа, на которой бойцы доказывают свою силу.',
    points: '245,360 455,360 455,470 245,470',
  },
  {
    key: 'market',
    name: 'Торговая Площадь',
    description: 'Шумный рынок с редкими снадобьями, амулетами и экипировкой.',
    points: '625,400 775,400 775,560 625,560',
  },
  {
    key: 'tavern',
    name: 'Таверна «У Дерева»',
    description: 'Место сбора путешественников. Здесь наливают эль и играют в кости.',
    points: '815,430 955,430 955,580 815,580',
  },
  {
    key: 'forge',
    name: 'Кузница Пламени',
    description: 'Каменный горн кузнеца. Здесь куются мечи и улучшаются доспехи.',
    points: '105,520 275,520 275,680 105,680',
  },
  {
    key: 'my_house',
    name: 'Мой Дом',
    description: 'Ваш личный уютный уголок. Здесь можно отдохнуть, открыть сундук и сменить имя/внешность.',
    points: '575,600 725,600 725,750 575,750',
  },
  {
    key: 'gates',
    name: 'Главные Врата',
    description: 'Оборонительные врата города. Отсюда воины уходят патрулировать окрестности.',
    points: '245,760 465,760 465,970 245,970',
  },
  {
    key: 'siege',
    name: 'Осадные Орудия',
    description: 'Мощная баллиста и катапульта для обороны города. Можно сделать выстрел.',
    points: '675,750 915,750 915,900 675,900',
  },
  {
    key: 'post',
    name: 'Оборонительный Пост',
    description: 'Башня стражи, где новобранцы тренируются и изучают военное ремесло.',
    points: '685,880 965,880 965,990 685,990',
  },
];

interface TownMapProps {
  onSelectLocation: (locationKey: TownLocationKey) => void;
}

export const TownMap: React.FC<TownMapProps> = ({ onSelectLocation }) => {
  const [hoveredLoc, setHoveredLoc] = useState<TownLocationData | null>(null);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-4">
      {/* City Banner Header */}
      <div className="w-full text-center h-20 flex flex-col justify-center bg-obsidian-950/80 border border-gold-900/30 rounded p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-950/10 via-transparent to-gold-950/10" />
        {hoveredLoc ? (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold font-gothic tracking-widest text-gold-400">
              {hoveredLoc.name}
            </h3>
            <p className="text-xs text-slate-400 font-sans tracking-wide mt-1">
              {hoveredLoc.description}
            </p>
          </div>
        ) : (
          <div className="opacity-60 text-slate-500 font-gothic tracking-widest text-sm uppercase">
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

        {/* SVG Interactive Overlay */}
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          {TOWN_LOCATIONS.map((loc) => (
            <polygon
              key={loc.key}
              points={loc.points}
              className="fill-transparent stroke-transparent hover:fill-gold-500/10 hover:stroke-gold-400 hover:stroke-[3.5px] transition-all duration-200 cursor-pointer pointer-events-auto filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
              onMouseEnter={() => setHoveredLoc(loc)}
              onMouseLeave={() => setHoveredLoc(null)}
              onClick={() => onSelectLocation(loc.key)}
            />
          ))}
        </svg>
      </div>

      <div className="text-center font-mono text-[10px] text-slate-500 max-w-lg">
        Наведите курсор на интересующее здание города для подсветки контура. Нажмите для перехода.
      </div>
    </div>
  );
};
