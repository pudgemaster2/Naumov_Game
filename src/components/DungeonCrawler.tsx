import React, { useState, useEffect, useRef } from 'react';
import type { Character, Item } from '../types';
import { DUNGEON_MAPS } from '../utils/dungeonMaps';
import type { DungeonFloor, DungeonChest } from '../utils/dungeonMaps';
import { Swords, Compass, LogOut, ArrowLeft, ArrowUp, ArrowRight, ArrowDown, RotateCcw, RotateCw, RefreshCw, Box } from 'lucide-react';
import { Button } from './ui/Button';

// Import dungeon viewport backgrounds
import dungeonStraight from '../assets/dungeon/dungeon_straight.png';
import dungeonDeadEnd from '../assets/dungeon/dungeon_dead_end.png';
import dungeonLeftTurn from '../assets/dungeon/dungeon_left_turn.png';
import dungeonRightTurn from '../assets/dungeon/dungeon_right_turn.png';
import dungeonTJunction from '../assets/dungeon/dungeon_t_junction.png';
import dungeonLeftOpen from '../assets/dungeon/dungeon_left_open.png';
import dungeonRightOpen from '../assets/dungeon/dungeon_right_open.png';
import dungeonCrossroads from '../assets/dungeon/dungeon_crossroads.png';
import dungeonChest from '../assets/dungeon/dungeon_chest.png';
import dungeonDoor from '../assets/dungeon/dungeon_door.png';
import dungeonMonsterRat from '../assets/dungeon/dungeon_monster_rat.png';
import dungeonMonsterSkeleton from '../assets/dungeon/dungeon_monster_skeleton.png';
import dungeonMonsterBoss from '../assets/dungeon/dungeon_monster_boss.png';

const viewImages: Record<string, string> = {
  straight: dungeonStraight,
  dead_end: dungeonDeadEnd,
  left_turn: dungeonLeftTurn,
  right_turn: dungeonRightTurn,
  t_junction: dungeonTJunction,
  left_open: dungeonLeftOpen,
  right_open: dungeonRightOpen,
  crossroads: dungeonCrossroads
};

const monsterSprites: Record<string, string> = {
  rat: dungeonMonsterRat,
  skeleton: dungeonMonsterSkeleton,
  boss: dungeonMonsterBoss
};

interface DungeonCrawlerProps {
  player: Character;
  onSave: (updatedPlayer: Character) => Promise<void>;
  onBack: () => void;
  dungeonKey: string;
  onStartCombat: (monster: Character & { isDungeonBoss?: boolean; dungeonId: string; monsterCoord: string }) => void;
  initialDungeonState?: any;
  onSaveDungeonState?: (state: any) => void;
}

export const DungeonCrawler: React.FC<DungeonCrawlerProps> = ({
  player,
  onSave,
  onBack,
  dungeonKey,
  onStartCombat,
  initialDungeonState,
  onSaveDungeonState,
}) => {
  const floor: DungeonFloor = DUNGEON_MAPS[dungeonKey] || DUNGEON_MAPS.dungeon_1;
  const grid = floor.grid;

  // Dungeon state variables
  const [posX, setPosX] = useState<number>(initialDungeonState?.x ?? floor.startPos.x);
  const [posY, setPosY] = useState<number>(initialDungeonState?.y ?? floor.startPos.y);
  const [dir, setDir] = useState<'N' | 'E' | 'S' | 'W'>(initialDungeonState?.dir ?? floor.startDir);
  
  // Sets to track progress
  const [visited, setVisited] = useState<string[]>(initialDungeonState?.visited ?? [`${floor.startPos.x},${floor.startPos.y}`]);
  const [defeatedMonsters] = useState<string[]>(initialDungeonState?.defeatedMonsters ?? []);
  const [openedChests, setOpenedChests] = useState<string[]>(initialDungeonState?.openedChests ?? []);
  const [unlockedDoors, setUnlockedDoors] = useState<string[]>(initialDungeonState?.unlockedDoors ?? []);
  const [keysCollected, setKeysCollected] = useState<string[]>(initialDungeonState?.keys ?? []);
  const [dungeonLog, setDungeonLog] = useState<string[]>(initialDungeonState?.log ?? [`Вы вошли в подземелье: ${floor.name}`]);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Direction logic helpers
  const dirOffsets: Record<'N' | 'E' | 'S' | 'W', { dx: number; dy: number }> = {
    N: { dx: 0, dy: -1 },
    E: { dx: 1, dy: 0 },
    S: { dx: 0, dy: 1 },
    W: { dx: -1, dy: 0 },
  };

  const dirNames: Record<'N' | 'E' | 'S' | 'W', string> = {
    N: 'Север',
    E: 'Восток',
    S: 'Юг',
    W: 'Запад',
  };

  const getLeftDir = (d: 'N' | 'E' | 'S' | 'W') => {
    const sequence: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'S', 'W'];
    const idx = (sequence.indexOf(d) + 3) % 4;
    return sequence[idx];
  };

  const getRightDir = (d: 'N' | 'E' | 'S' | 'W') => {
    const sequence: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'S', 'W'];
    const idx = (sequence.indexOf(d) + 1) % 4;
    return sequence[idx];
  };

  const getOppositeDir = (d: 'N' | 'E' | 'S' | 'W') => {
    const sequence: ('N' | 'E' | 'S' | 'W')[] = ['N', 'E', 'S', 'W'];
    const idx = (sequence.indexOf(d) + 2) % 4;
    return sequence[idx];
  };

  // Helper to add events to the dungeon console
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDungeonLog((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dungeonLog]);

  // Persist state updates back to player game controller
  useEffect(() => {
    if (onSaveDungeonState) {
      onSaveDungeonState({
        x: posX,
        y: posY,
        dir,
        visited,
        defeatedMonsters,
        openedChests,
        unlockedDoors,
        keys: keysCollected,
        log: dungeonLog,
        activeDungeonKey: dungeonKey,
      });
    }
  }, [posX, posY, dir, visited, defeatedMonsters, openedChests, unlockedDoors, keysCollected, dungeonLog]);

  // Mark surroundings as visited for Fog-of-War mapping
  const updateVisited = (cx: number, cy: number, currentDir: 'N' | 'E' | 'S' | 'W') => {
    const newlyVisited = new Set(visited);
    newlyVisited.add(`${cx},${cy}`);

    // Reveal adjacent tiles and tiles player can see ahead
    const offset = dirOffsets[currentDir];
    
    // Front tiles
    for (let steps = 1; steps <= 3; steps++) {
      const tx = cx + offset.dx * steps;
      const ty = cy + offset.dy * steps;
      if (ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[ty].length) {
        newlyVisited.add(`${tx},${ty}`);
        
        // Also reveal left and right diagonals
        const leftOffset = dirOffsets[getLeftDir(currentDir)];
        const lx = tx + leftOffset.dx;
        const ly = ty + leftOffset.dy;
        if (ly >= 0 && ly < grid.length && lx >= 0 && lx < grid[ly].length) {
          newlyVisited.add(`${lx},${ly}`);
        }
        
        const rightOffset = dirOffsets[getRightDir(currentDir)];
        const rx = tx + rightOffset.dx;
        const ry = ty + rightOffset.dy;
        if (ry >= 0 && ry < grid.length && rx >= 0 && rx < grid[ry].length) {
          newlyVisited.add(`${rx},${ry}`);
        }

        // If hits wall, stop revealing further ahead
        if (grid[ty][tx] === '#' || (grid[ty][tx] === 'D' && !unlockedDoors.includes(`${tx},${ty}`))) {
          break;
        }
      }
    }

    // Direct left and right tiles
    const leftOffset = dirOffsets[getLeftDir(currentDir)];
    const lx = cx + leftOffset.dx;
    const ly = cy + leftOffset.dy;
    if (ly >= 0 && ly < grid.length && lx >= 0 && lx < grid[ly].length) {
      newlyVisited.add(`${lx},${ly}`);
    }

    const rightOffset = dirOffsets[getRightDir(currentDir)];
    const rx = cx + rightOffset.dx;
    const ry = cy + rightOffset.dy;
    if (ry >= 0 && ry < grid.length && rx >= 0 && rx < grid[ry].length) {
      newlyVisited.add(`${rx},${ry}`);
    }

    setVisited(Array.from(newlyVisited));
  };

  // Helper to query map cell types at offsets
  const getTileAtOffset = (stepsForward: number, stepsRight: number = 0) => {
    // Determine target absolute direction offset
    const forwardOffset = dirOffsets[dir];
    const rightDir = getRightDir(dir);
    const rightOffset = dirOffsets[rightDir];

    const tx = posX + forwardOffset.dx * stepsForward + rightOffset.dx * stepsRight;
    const ty = posY + forwardOffset.dy * stepsForward + rightOffset.dy * stepsRight;

    if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[ty].length) {
      return '#'; // Out of bounds acts as wall
    }

    const raw = grid[ty][tx];

    // Override if monster was defeated or chest was opened
    if (raw === 'M' && defeatedMonsters.includes(`${tx},${ty}`)) {
      return '.';
    }
    if (raw === 'C' && openedChests.includes(`${tx},${ty}`)) {
      return '.';
    }
    if (raw === 'D' && unlockedDoors.includes(`${tx},${ty}`)) {
      return '.';
    }

    return raw;
  };

  const getTileCoordsAtOffset = (stepsForward: number, stepsRight: number = 0) => {
    const forwardOffset = dirOffsets[dir];
    const rightDir = getRightDir(dir);
    const rightOffset = dirOffsets[rightDir];
    return {
      x: posX + forwardOffset.dx * stepsForward + rightOffset.dx * stepsRight,
      y: posY + forwardOffset.dy * stepsForward + rightOffset.dy * stepsRight,
    };
  };

  // Motion Handlers
  const move = (steps: number) => {
    const offset = dirOffsets[dir];
    const tx = posX + offset.dx * steps;
    const ty = posY + offset.dy * steps;

    if (ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[ty].length) {
      const tile = grid[ty][tx];
      
      // Defeated check overrides
      const isMonsterDefeated = tile === 'M' && defeatedMonsters.includes(`${tx},${ty}`);
      const isChestOpened = tile === 'C' && openedChests.includes(`${tx},${ty}`);
      const isDoorOpen = tile === 'D' && unlockedDoors.includes(`${tx},${ty}`);

      const walkable = tile === '.' || tile === 'S' || tile === 'E' || isMonsterDefeated || isChestOpened || isDoorOpen;

      if (walkable) {
        setPosX(tx);
        setPosY(ty);
        updateVisited(tx, ty, dir);
        
        if (tile === 'E') {
          addLog('Вы нашли выход! Поднимитесь по лестнице, чтобы вернуться на карту пригорода.');
        }
      } else {
        if (tile === '#') addLog('⚠️ Путь прегражден стеной.');
        if (tile === 'M' && !isMonsterDefeated) addLog(`⚠️ Путь прегражден врагом! Начните бой с монстром.`);
        if (tile === 'C' && !isChestOpened) addLog('⚠️ Перед вами сундук. Откройте его, чтобы пройти дальше.');
        if (tile === 'D' && !isDoorOpen) addLog('⚠️ Перед вами закрытая дверь. Нужно отпереть ее.');
      }
    }
  };

  const strafe = (direction: 'left' | 'right') => {
    const strafeDir = direction === 'left' ? getLeftDir(dir) : getRightDir(dir);
    const offset = dirOffsets[strafeDir];
    const tx = posX + offset.dx;
    const ty = posY + offset.dy;

    if (ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[ty].length) {
      const tile = grid[ty][tx];
      const isMonsterDefeated = tile === 'M' && defeatedMonsters.includes(`${tx},${ty}`);
      const isChestOpened = tile === 'C' && openedChests.includes(`${tx},${ty}`);
      const isDoorOpen = tile === 'D' && unlockedDoors.includes(`${tx},${ty}`);

      const walkable = tile === '.' || tile === 'S' || tile === 'E' || isMonsterDefeated || isChestOpened || isDoorOpen;

      if (walkable) {
        setPosX(tx);
        setPosY(ty);
        updateVisited(tx, ty, dir);
      } else {
        addLog('⚠️ Боковое движение невозможно: преграда.');
      }
    }
  };

  const rotate = (turn: 'left' | 'right' | 'about') => {
    let nextDir = dir;
    if (turn === 'left') {
      nextDir = getLeftDir(dir);
      addLog(`Повернулись налево (${dirNames[nextDir]})`);
    } else if (turn === 'right') {
      nextDir = getRightDir(dir);
      addLog(`Повернулись направо (${dirNames[nextDir]})`);
    } else {
      nextDir = getOppositeDir(dir);
      addLog(`Развернулись назад (${dirNames[nextDir]})`);
    }
    setDir(nextDir);
    updateVisited(posX, posY, nextDir);
  };

  // Combat Trigger
  const handleAttack = () => {
    const coords = getTileCoordsAtOffset(1, 0);
    const coordKey = `${coords.x},${coords.y}`;
    const monsterData = floor.monsters[coordKey];
    
    if (monsterData && !defeatedMonsters.includes(coordKey)) {
      addLog(`⚔️ Вступаем в бой с монстром: ${monsterData.name} (ур. ${monsterData.level})!`);
      
      // Adapt statistics based on templates
      const statsObj: Character = {
        name: monsterData.name,
        race: monsterData.race,
        classType: monsterData.classType,
        level: monsterData.level,
        experience: 0,
        gold: 0,
        stats: monsterData.stats,
        currentHp: monsterData.maxHp,
        maxHp: monsterData.maxHp,
        currentMana: monsterData.maxMana,
        maxMana: monsterData.maxMana,
        wins: 0,
        losses: 0,
        sprite: monsterData.sprite
      };

      onStartCombat({
        ...statsObj,
        isDungeonBoss: monsterData.isBoss,
        dungeonId: dungeonKey,
        monsterCoord: coordKey
      });
    }
  };

  // Loot Trigger
  const handleOpenChest = async () => {
    const coords = getTileCoordsAtOffset(1, 0);
    const coordKey = `${coords.x},${coords.y}`;
    const chestData = floor.chests[coordKey];

    if (chestData && !openedChests.includes(coordKey)) {
      setOpenedChests((prev) => [...prev, coordKey]);
      addLog(`🗝️ Открываем сундук...`);

      if (chestData.type === 'key' && chestData.keyId) {
        setKeysCollected((prev) => [...prev, chestData.keyId!]);
        addLog(`🎉 Вы нашли: "${chestData.rewardItemName}"! Он пригодится для дверей.`);
      } 
      else if (chestData.type === 'gold' && chestData.rewardAmount) {
        const rewardGold = chestData.rewardAmount;
        const updated = {
          ...player,
          gold: player.gold + rewardGold
        };
        await onSave(updated);
        addLog(`💰 Золото в сундуке! Найдено: 💰 +${rewardGold} золотых монет.`);
      } 
      else if (chestData.type === 'item' && chestData.rewardItemType) {
        // Create an inventory item
        let rewardItem: Item;
        const isMp = chestData.rewardItemType === 'potion_mp';
        rewardItem = {
          id: `dungeon_item_${Date.now()}`,
          name: chestData.rewardItemName || 'Зелье',
          type: chestData.rewardItemType as any,
          stats: {},
          description: isMp ? 'Полностью восстанавливает ману' : 'Полностью восстанавливает здоровье',
          icon: isMp ? 'potion_mp' : 'potion_hp'
        };

        const updated = {
          ...player,
          inventory: [...(player.inventory || []), rewardItem]
        };
        await onSave(updated);
        addLog(`🧪 Вы нашли ценный предмет: "${rewardItem.name}" (добавлен в рюкзак).`);
      }
    }
  };

  // Door Unlock Trigger
  const handleOpenDoor = () => {
    const coords = getTileCoordsAtOffset(1, 0);
    const coordKey = `${coords.x},${coords.y}`;
    const doorData = floor.doors[coordKey];

    if (doorData && !unlockedDoors.includes(coordKey)) {
      if (doorData.keyId && !keysCollected.includes(doorData.keyId)) {
        addLog(`🔒 Дверь "${doorData.name}" заперта! Требуется специальный ключ.`);
        return;
      }

      setUnlockedDoors((prev) => [...prev, coordKey]);
      addLog(`🚪 Вы открыли дверь: "${doorData.name}"! Проход свободен.`);
    }
  };

  // Calculate first-person viewport view
  const getViewportView = () => {
    const f1 = getTileAtOffset(1, 0);
    const l0 = getTileAtOffset(0, -1);
    const r0 = getTileAtOffset(0, 1);
    const l1 = getTileAtOffset(1, -1);
    const r1 = getTileAtOffset(1, 1);

    if (f1 === '#') {
      if (l0 === '.' && r0 === '.') return 't_junction';
      if (l0 === '.' && r0 === '#') return 'left_turn';
      if (r0 === '.' && l0 === '#') return 'right_turn';
      return 'dead_end';
    } else {
      if (l1 === '.' && r1 === '.') return 'crossroads';
      if (l1 === '.' && r1 === '#') return 'left_open';
      if (r1 === '.' && l1 === '#') return 'right_open';
      return 'straight';
    }
  };

  const viewType = getViewportView();
  const currentBgImage = viewImages[viewType] || dungeonStraight;

  // Calculate sprites directly ahead at distance 1
  const frontCoords = getTileCoordsAtOffset(1, 0);
  const frontCoordKey = `${frontCoords.x},${frontCoords.y}`;
  
  const hasFrontMonster = grid[frontCoords.y]?.[frontCoords.x] === 'M' && !defeatedMonsters.includes(frontCoordKey);
  const hasFrontChest = grid[frontCoords.y]?.[frontCoords.x] === 'C' && !openedChests.includes(frontCoordKey);
  const hasFrontDoor = grid[frontCoords.y]?.[frontCoords.x] === 'D' && !unlockedDoors.includes(frontCoordKey);
  
  const activeMonster = hasFrontMonster ? floor.monsters[frontCoordKey] : null;
  const activeChest = hasFrontChest ? floor.chests[frontCoordKey] : null;
  const activeDoor = hasFrontDoor ? floor.doors[frontCoordKey] : null;

  const currentTileType = grid[posY]?.[posX];

  // Monster sprite selector
  const getMonsterSprite = (spriteKey: string) => {
    return monsterSprites[spriteKey] || dungeonMonsterRat;
  };

  // Helper to draw minimap on Canvas
  const drawMinimap = () => {
    const cellSize = 22;
    const viewRadius = 3; // Render a 7x7 grid centered around player
    const itemsList: React.ReactNode[] = [];

    for (let dy = -viewRadius; dy <= viewRadius; dy++) {
      for (let dx = -viewRadius; dx <= viewRadius; dx++) {
        const tx = posX + dx;
        const ty = posY + dy;
        
        const isPlayerCell = dx === 0 && dy === 0;
        const key = `cell-${tx}-${ty}`;

        if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[ty].length) {
          // Out of bounds - black void
          itemsList.push(
            <div 
              key={key} 
              className="bg-obsidian-950 border border-obsidian-900" 
              style={{ width: cellSize, height: cellSize }} 
            />
          );
          continue;
        }

        const isVisited = visited.includes(`${tx},${ty}`);
        if (!isVisited) {
          // Unrevealed - dark cover
          itemsList.push(
            <div 
              key={key} 
              className="bg-slate-900 border border-slate-950 flex items-center justify-center text-[10px] text-slate-700 font-mono" 
              style={{ width: cellSize, height: cellSize }}
            >
              ░
            </div>
          );
          continue;
        }

        const tile = grid[ty][tx];
        const isMonsterDefeated = tile === 'M' && defeatedMonsters.includes(`${tx},${ty}`);
        const isChestOpened = tile === 'C' && openedChests.includes(`${tx},${ty}`);
        const isDoorOpen = tile === 'D' && unlockedDoors.includes(`${tx},${ty}`);

        // Base cell colors
        let cellClass = 'bg-slate-100/80 border border-slate-300';
        let cellContent = null;

        if (tile === '#') {
          cellClass = 'bg-slate-700 border border-slate-800 shadow-inner';
        } else if (isPlayerCell) {
          cellClass = 'bg-emerald-200 border-2 border-emerald-500 shadow-sm flex items-center justify-center font-extrabold text-emerald-800';
          const arrowIcons = { N: '↑', E: '→', S: '↓', W: '←' };
          cellContent = <span>{arrowIcons[dir]}</span>;
        } else if (tile === 'E') {
          cellClass = 'bg-amber-100 border border-amber-400 animate-pulse flex items-center justify-center text-[10px] font-black text-amber-700';
          cellContent = <span>🏁</span>;
        } else if (tile === 'D') {
          cellClass = isDoorOpen ? 'bg-slate-50 border border-slate-350 flex items-center justify-center text-[10px]' : 'bg-amber-600 border border-amber-800 flex items-center justify-center text-[10px] font-bold text-slate-100';
          cellContent = isDoorOpen ? <span>🚪</span> : <span>🔒</span>;
        } else if (tile === 'C') {
          cellClass = isChestOpened ? 'bg-slate-50 border border-slate-350 flex items-center justify-center text-[10px]' : 'bg-yellow-400 border border-yellow-600 shadow flex items-center justify-center text-[10px] font-bold text-slate-900 animate-pulse';
          cellContent = isChestOpened ? <span>📦</span> : <span>👑</span>;
        } else if (tile === 'M') {
          cellClass = isMonsterDefeated ? 'bg-slate-50 border border-slate-350 flex items-center justify-center text-[9px]' : 'bg-rose-500 border border-rose-700 flex items-center justify-center text-[10px] font-bold text-white shadow-sm';
          cellContent = isMonsterDefeated ? <span>💀</span> : <span>💀</span>;
        }

        itemsList.push(
          <div 
            key={key} 
            className={`transition-all duration-200 flex items-center justify-center text-xs ${cellClass}`} 
            style={{ width: cellSize, height: cellSize }}
          >
            {cellContent}
          </div>
        );
      }
    }

    return (
      <div 
        className="grid border border-slate-350 p-1.5 bg-slate-200 shadow-inner rounded-md gap-0.5 justify-center" 
        style={{ gridTemplateColumns: `repeat(${viewRadius * 2 + 1}, ${cellSize}px)` }}
      >
        {itemsList}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-3 select-none">
      
      {/* Header and Quit */}
      <div className="gothic-panel-gold p-4 bg-slate-100 flex items-center justify-between rounded-lg shadow-md mb-5 border-amber-500">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-amber-700 animate-spin-slow" />
          <div>
            <h3 className="text-xl font-black font-gothic text-slate-900 tracking-wide">{floor.name}</h3>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              X: {posX}, Y: {posY} • Направление: {dirNames[dir]}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-1.5 px-4.5 py-2 bg-slate-800 text-rose-455 hover:bg-slate-750 hover:text-rose-400 border border-slate-700 rounded-md transition-all font-bold text-xs cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          Сбежать в город
        </button>
      </div>

      <div className="flex flex-col gap-6 items-center">
        
        {/* VIEWPORT COLUMN */}
        <div className="w-full flex flex-col items-center">
          
          {/* 3D Viewport Box */}
          <div className="relative w-full max-w-[800px] h-[450px] bg-obsidian-950 rounded-lg overflow-hidden border border-gold-600/50 shadow-2xl select-none mx-auto">
            {/* Base Corridor Graphics */}
            <img 
              src={currentBgImage} 
              alt={`Labyrinth viewport: ${viewType}`} 
              className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Depth vignette shadows */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/20 via-transparent to-obsidian-950/20 pointer-events-none" />

            {/* Overlay: Closed Door */}
            {activeDoor && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 animate-fade-in">
                <img 
                  src={dungeonDoor} 
                  alt="Dungeon locked door" 
                  className="w-56 h-80 object-contain pointer-events-auto"
                />
              </div>
            )}

            {/* Overlay: Chest */}
            {activeChest && (
              <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none select-none z-10 animate-fade-in">
                <img 
                  src={dungeonChest} 
                  alt="Treasure Chest" 
                  className="w-36 h-36 object-contain pointer-events-auto filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                />
              </div>
            )}

            {/* Overlay: Monster sprite */}
            {activeMonster && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 animate-fade-in">
                <img 
                  src={getMonsterSprite(activeMonster.sprite)} 
                  alt={activeMonster.name} 
                  className={`w-52 h-72 object-contain pointer-events-auto filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] ${
                    activeMonster.isBoss ? 'animate-bounce text-red-500 scale-105 filter hue-rotate-15 saturate-150' : ''
                  }`}
                />
                
                {/* Boss status overlay indicator */}
                {activeMonster.isBoss && (
                  <div className="absolute top-16 px-3 py-1 bg-red-650/90 border border-red-500 text-[10px] text-white rounded font-mono font-bold tracking-wide uppercase select-none shadow">
                    Главарь
                  </div>
                )}
              </div>
            )}

            {/* Subtitles Overlay */}
            <div className="absolute bottom-2 left-2 right-2 text-center pointer-events-none">
              <span className="px-2.5 py-1 rounded bg-black/75 border border-slate-700/60 text-[10px] font-mono tracking-widest text-slate-350 uppercase select-none">
                Смотрим на {dirNames[dir]}
              </span>
            </div>
          </div>

          {/* Interactive Trigger Control Cards directly below viewport */}
          <div className="w-full max-w-[500px] mt-4">
            {activeMonster && (
              <div className="gothic-panel-gold p-4 bg-rose-50 border-rose-500 rounded-lg flex flex-col items-center gap-3 animate-fade-in text-center select-none shadow-md">
                <div>
                  <h4 className="text-sm font-bold font-gothic text-rose-900 uppercase tracking-wider">{activeMonster.name}</h4>
                  <p className="text-xs text-slate-700 font-bold mt-1">
                    Уровень {activeMonster.level} • Здоровье: {activeMonster.maxHp} HP
                  </p>
                  {activeMonster.isBoss && (
                    <p className="text-[10px] text-red-600 font-bold uppercase mt-1">⚠️ ОПАСНОСТЬ: Властелин этого этажа!</p>
                  )}
                </div>
                <Button 
                  onClick={handleAttack}
                  variant="primary" 
                  size="md" 
                  fullWidth
                  className="bg-gradient-to-r from-red-600 to-rose-700 border-rose-500 text-white shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Swords className="w-4 h-4" />
                  Атаковать Монстра
                </Button>
              </div>
            )}

            {activeChest && (
              <div className="gothic-panel p-4 bg-yellow-50/70 border-yellow-500 rounded-lg flex flex-col items-center gap-3 animate-fade-in text-center select-none shadow-md">
                <div>
                  <h4 className="text-sm font-bold font-gothic text-yellow-900 uppercase tracking-wider">Сундук с Сокровищами</h4>
                  <p className="text-xs text-slate-700 font-bold mt-1">
                    {chestDataDescription(activeChest)}
                  </p>
                </div>
                <Button 
                  onClick={handleOpenChest}
                  variant="primary" 
                  size="md" 
                  fullWidth
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-500 text-slate-950 font-bold shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Box className="w-4 h-4" />
                  Открыть сундук
                </Button>
              </div>
            )}

            {activeDoor && (
              <div className="gothic-panel p-4 bg-amber-50/70 border-amber-600 rounded-lg flex flex-col items-center gap-3 animate-fade-in text-center select-none shadow-md">
                <div>
                  <h4 className="text-sm font-bold font-gothic text-amber-900 uppercase tracking-wider">{activeDoor.name}</h4>
                  <p className="text-xs text-slate-700 font-bold mt-1">
                    {activeDoor.keyId ? `Требуется Ключ: "${floor.chests[getKeyLocation(activeDoor.keyId)]?.rewardItemName || 'Особый ключ'}"` : 'Заперто на засов'}
                  </p>
                </div>
                <Button 
                  onClick={handleOpenDoor}
                  variant="primary" 
                  size="md" 
                  fullWidth
                  disabled={activeDoor.keyId ? !keysCollected.includes(activeDoor.keyId) : false}
                  className="bg-gradient-to-r from-amber-600 to-orange-700 border-amber-500 text-white font-bold shadow-sm flex items-center justify-center gap-1.5"
                >
                  Открыть дверь
                </Button>
              </div>
            )}

            {currentTileType === 'E' && (
              <div className="gothic-panel-gold p-4 bg-emerald-50 border-emerald-500 rounded-lg flex flex-col items-center gap-3 animate-fade-in text-center select-none shadow-md">
                <div>
                  <h4 className="text-sm font-bold font-gothic text-emerald-900 uppercase tracking-wider">Выход из подземелья</h4>
                  <p className="text-xs text-slate-700 font-bold mt-1">Поздравляем! Вы нашли спуск на следующий уровень или обратный портал.</p>
                </div>
                <Button 
                  onClick={onBack}
                  variant="primary" 
                  size="md" 
                  fullWidth
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-500 text-white shadow-sm flex items-center justify-center gap-1.5"
                >
                  Завершить поход
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MAP & CONTROLS & LOG (Row below Viewport) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Minimap panel */}
          <div className="gothic-panel p-4 bg-slate-100/90 border-slate-300 rounded-lg shadow flex flex-col items-center justify-between min-h-[300px]">
            <div className="w-full flex flex-col items-center">
              <h4 className="text-xs font-bold font-gothic text-slate-900 tracking-wider uppercase mb-3 text-center">Карта местности</h4>
              {drawMinimap()}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[9px] font-mono text-slate-500 justify-center">
              <span className="flex items-center gap-1">🟢 Игрок</span>
              <span className="flex items-center gap-1">🟥 Враг</span>
              <span className="flex items-center gap-1">🟧 Сундук</span>
              <span className="flex items-center gap-1">🚪 Дверь</span>
              <span className="flex items-center gap-1">🏁 Выход</span>
            </div>
          </div>

          {/* Controls panel */}
          <div className="gothic-panel p-4 bg-slate-100/90 border-slate-300 rounded-lg shadow flex flex-col items-center justify-between min-h-[300px]">
            <h4 className="text-xs font-bold font-gothic text-slate-900 tracking-wider uppercase mb-2 text-center">Навигация</h4>
            
            {/* D-Pad Layout */}
            <div className="grid grid-cols-3 gap-2 justify-center items-center w-full max-w-[170px] my-auto">
              {/* Row 1 */}
              <button 
                onClick={() => rotate('left')} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Повернуть налево"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => move(1)} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Шаг вперед"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button 
                onClick={() => rotate('right')} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Повернуть направо"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Row 2 */}
              <button 
                onClick={() => strafe('left')} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Шаг влево (стрейф)"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => rotate('about')} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Развернуться на 180"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={() => strafe('right')} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Шаг вправо (стрейф)"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Row 3 */}
              <div />
              <button 
                onClick={() => move(-1)} 
                type="button" 
                className="w-11 h-11 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded flex items-center justify-center text-amber-500 font-bold shadow-sm transition-all cursor-pointer"
                title="Шаг назад"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <div />
            </div>

            {/* Status Keys Count */}
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-700 font-bold">
              <span>🔑 Ключи в кармане:</span>
              <span className="font-mono text-slate-900 bg-slate-200 border border-slate-350 px-2 py-0.5 rounded font-black">
                {keysCollected.length}
              </span>
            </div>
          </div>

          {/* Dungeon Console Log */}
          <div className="gothic-panel p-4 bg-slate-900 border border-slate-750/90 rounded-lg flex flex-col min-h-[300px] shadow-lg relative overflow-hidden">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-gothic border-b border-slate-800 pb-1 mb-2">
              Летопись Похода
            </h4>
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 rpg-scrollbar text-xs font-mono text-slate-300">
              {dungeonLog.map((logLine, index) => (
                <div key={index} className="leading-normal">
                  {logLine}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

// Loot descriptions helper
const chestDataDescription = (chest: DungeonChest) => {
  if (chest.type === 'key') return 'Содержит ключ от запертой двери.';
  if (chest.type === 'gold') return `Содержит золото: 💰 примерно ${chest.rewardAmount} золотых.`;
  if (chest.type === 'item') return `Содержит ценный предмет: "${chest.rewardItemName || 'Эликсир'}".`;
  return 'Неизвестная награда.';
};

// Find matching key coordinate for label
const getKeyLocation = (keyId: string) => {
  if (keyId === 'sewer_key') return '1,1';
  if (keyId === 'catacomb_key') return '1,1';
  if (keyId === 'lair_key') return '6,3';
  return '';
};
