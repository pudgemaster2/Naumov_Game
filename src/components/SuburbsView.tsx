import React, { useState } from 'react';
import outdoorImage from '../assets/Outdoor.jpg';
import { Button } from './ui/Button';

interface DungeonData {
  key: string;
  name: string;
  description: string;
  style: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

const DUNGEONS: DungeonData[] = [
  {
    key: 'dungeon_1',
    name: 'Пещера Теней',
    description: 'Мрачная пещера, скрытая в скалах. Оттуда веет холодом и слышны жуткие стоны нежити. (Вход временно закрыт)',
    style: { top: '32%', left: '34%', width: '18%', height: '9%' }
  },
  {
    key: 'dungeon_2',
    name: 'Забытая Шахта',
    description: 'Древние рудники гномов, заброшенные много веков назад. Теперь здесь рыщут гоблины и кобольды. (Вход временно закрыт)',
    style: { top: '65%', left: '72%', width: '18%', height: '9%' }
  }
];

interface SuburbsViewProps {
  onBack: () => void;
}

export const SuburbsView: React.FC<SuburbsViewProps> = ({ onBack }) => {
  const [hoveredDungeon, setHoveredDungeon] = useState<DungeonData | null>(null);
  const [modalText, setModalText] = useState<string | null>(null);

  return (
    <div className="relative h-full aspect-[1.1/1] max-h-full bg-obsidian-950 border border-gold-600/50 rounded-lg overflow-hidden shadow-2xl mx-auto select-none">
      {/* Floating Return Button */}
      <button 
        onClick={onBack}
        type="button"
        className="absolute top-4 left-4 z-20 bg-slate-100/90 border border-slate-350 text-slate-800 font-bold font-sans text-xs px-4 py-2 rounded-md shadow-md hover:bg-slate-250 transition-all cursor-pointer"
        title="Вернуться в эльфийский город"
      >
        ← Вернуться в город
      </button>

      {/* Outdoor Background Image */}
      <img
        src={outdoorImage}
        alt="Outdoor Map"
        className="w-full h-full object-fill select-none pointer-events-none"
      />

      {/* Absolute positioned interactive transparent hot-zones */}
      {DUNGEONS.map((dung) => {
        return (
          <button
            key={dung.key}
            type="button"
            onClick={() => setModalText(`Вы подошли к входу: ${dung.name}. В данный момент проход завален камнями. Драконы и чудовища появятся здесь позже!`)}
            onMouseEnter={() => setHoveredDungeon(dung)}
            onMouseLeave={() => setHoveredDungeon(null)}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-md cursor-pointer select-none town-hotzone"
            style={{
              top: dung.style.top,
              left: dung.style.left,
              width: dung.style.width,
              height: dung.style.height,
            }}
            title={dung.name}
          >
            <span className="absolute opacity-0 pointer-events-none">{dung.name}</span>
          </button>
        );
      })}

      {/* Floating Hover Info Overlay at the bottom of the map */}
      <div className="absolute bottom-4 left-4 right-4 z-20 p-3.5 bg-slate-100/90 border border-slate-300 rounded-lg text-slate-800 text-xs shadow-lg backdrop-blur-sm">
        {hoveredDungeon ? (
          <div className="animate-fade-in">
            <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-1">
              🧭 {hoveredDungeon.name}
            </h4>
            <p className="text-slate-650 leading-relaxed font-sans font-medium">{hoveredDungeon.description}</p>
          </div>
        ) : (
          <div className="text-slate-650 text-center font-sans font-medium py-1">
            Наведите курсор мыши на входы в подземелья, чтобы прочесть их описание
          </div>
        )}
      </div>

      {/* Dungeon under development Modal */}
      {modalText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in select-none">
          <div className="bg-slate-100 border-2 border-amber-500 max-w-md w-full p-8 shadow-2xl rounded-lg space-y-6 text-slate-900 text-center">
            <h3 className="text-xl font-bold font-gothic text-amber-700 tracking-wider">
              ⛏️ ПОДЗЕМЕЛЬЕ В РАЗРАБОТКЕ
            </h3>
            <p className="text-sm font-sans font-medium leading-relaxed text-slate-700">
              {modalText}
            </p>
            <div className="flex justify-center pt-2">
              <Button onClick={() => setModalText(null)} className="px-6 py-2">
                Понятно
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
