import type { CharacterRace, CharacterClass, CharacterStats } from '../types';

export interface DungeonMonster {
  id: string; // coordinate key e.g. "x,y"
  name: string;
  race: CharacterRace;
  classType: CharacterClass;
  level: number;
  maxHp: number;
  currentHp: number;
  maxMana: number;
  currentMana: number;
  stats: CharacterStats;
  sprite: string;
  isBoss?: boolean;
}

export interface DungeonChest {
  id: string; // coordinate key "x,y"
  type: 'gold' | 'item' | 'key';
  rewardAmount?: number; // for gold
  rewardItemType?: string; // e.g. 'potion_hp', 'potion_mp', 'weapon', etc.
  rewardItemName?: string; // name displayed in logs
  keyId?: string; // key identifier (e.g. 'sewer_key')
}

export interface DungeonDoor {
  id: string; // coordinate key "x,y"
  locked: boolean;
  keyId?: string; // key required to open
  name: string;
}

export interface DungeonFloor {
  key: string;
  name: string;
  grid: string[][];
  startPos: { x: number; y: number };
  startDir: 'N' | 'E' | 'S' | 'W';
  monsters: Record<string, DungeonMonster>;
  chests: Record<string, DungeonChest>;
  doors: Record<string, DungeonDoor>;
}

export const DUNGEON_MAPS: Record<string, DungeonFloor> = {
  dungeon_1: {
    key: 'dungeon_1',
    name: 'Заброшенная Канализация',
    grid: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', 'C', '.', '.', '#', '.', '.', 'C', '.', '#'],
      ['#', '#', '#', '.', '#', '.', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '.', '.', '.', 'M', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '#', '#', 'D', '#'],
      ['#', 'M', '#', '.', '.', '.', '.', '#', 'M', '#'],
      ['#', '.', '#', '#', '#', '.', '#', '#', '#', '#'],
      ['#', '.', '.', '.', '#', '.', '#', '.', '.', '#'],
      ['#', '#', '#', '.', '.', 'M', '.', '.', 'E', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    ],
    startPos: { x: 3, y: 8 },
    startDir: 'N',
    monsters: {
      '7,3': {
        id: '7,3',
        name: 'Канализационная Крыса',
        race: 'orc',
        classType: 'warrior',
        level: 1,
        maxHp: 50,
        currentHp: 50,
        maxMana: 10,
        currentMana: 10,
        stats: { strength: 6, agility: 5, endurance: 5, intellect: 1 },
        sprite: 'rat'
      },
      '1,5': {
        id: '1,5',
        name: 'Чумная Крыса',
        race: 'orc',
        classType: 'warrior',
        level: 1,
        maxHp: 60,
        currentHp: 60,
        maxMana: 10,
        currentMana: 10,
        stats: { strength: 7, agility: 6, endurance: 6, intellect: 1 },
        sprite: 'rat'
      },
      '8,5': {
        id: '8,5',
        name: 'Мутировавший Слизень',
        race: 'gnome',
        classType: 'mage',
        level: 2,
        maxHp: 80,
        currentHp: 80,
        maxMana: 120,
        currentMana: 120,
        stats: { strength: 5, agility: 8, endurance: 8, intellect: 12 },
        sprite: 'skeleton' // falls back to skeleton or other standard assets
      },
      '5,8': {
        id: '5,8',
        name: 'Сточный Мутант',
        race: 'orc',
        classType: 'warrior',
        level: 3,
        maxHp: 150,
        currentHp: 150,
        maxMana: 30,
        currentMana: 30,
        stats: { strength: 15, agility: 10, endurance: 15, intellect: 3 },
        sprite: 'boss',
        isBoss: true
      }
    },
    chests: {
      '1,1': {
        id: '1,1',
        type: 'key',
        keyId: 'sewer_key',
        rewardItemName: 'Ключ от стоков канализации'
      },
      '7,1': {
        id: '7,1',
        type: 'item',
        rewardItemType: 'potion_hp',
        rewardItemName: 'Зелье здоровья'
      }
    },
    doors: {
      '8,4': {
        id: '8,4',
        locked: true,
        keyId: 'sewer_key',
        name: 'Решетчатая Дверь Стоков'
      }
    }
  },
  dungeon_2: {
    key: 'dungeon_2',
    name: 'Катакомбы Мучений',
    grid: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', 'C', '.', '.', '.', '#', '.', '.', '.', '.', 'M', '#'],
      ['#', '#', '#', '#', '.', '#', '.', '#', '#', '#', 'D', '#'],
      ['#', '.', '.', '.', '.', '.', '.', '#', '.', '.', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '.', '#', '.', '#', '#', '#'],
      ['#', 'M', '#', '.', '.', '#', 'M', '#', '.', '.', '.', '#'],
      ['#', '.', '#', '.', '#', '#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '#', 'C', '.', '.', '.', '#', '.', '#'],
      ['#', '#', '#', '.', '#', '#', '#', '#', '.', '#', 'M', '#'],
      ['#', '.', '.', '.', '.', '.', '.', 'M', '.', '#', '.', '#'],
      ['#', 'S', '#', '#', '#', '#', '#', '#', '.', '.', 'E', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    ],
    startPos: { x: 1, y: 10 },
    startDir: 'N',
    monsters: {
      '10,1': {
        id: '10,1',
        name: 'Проклятый Скелет',
        race: 'elf',
        classType: 'archer',
        level: 3,
        maxHp: 110,
        currentHp: 110,
        maxMana: 50,
        currentMana: 50,
        stats: { strength: 10, agility: 15, endurance: 11, intellect: 5 },
        sprite: 'skeleton'
      },
      '1,5': {
        id: '1,5',
        name: 'Гниющий Зомби',
        race: 'orc',
        classType: 'warrior',
        level: 3,
        maxHp: 160,
        currentHp: 160,
        maxMana: 10,
        currentMana: 10,
        stats: { strength: 14, agility: 5, endurance: 16, intellect: 1 },
        sprite: 'skeleton'
      },
      '6,5': {
        id: '6,5',
        name: 'Скелет-Воин',
        race: 'human',
        classType: 'warrior',
        level: 3,
        maxHp: 120,
        currentHp: 120,
        maxMana: 20,
        currentMana: 20,
        stats: { strength: 12, agility: 10, endurance: 12, intellect: 2 },
        sprite: 'skeleton'
      },
      '10,8': {
        id: '10,8',
        name: 'Восставший Страж',
        race: 'orc',
        classType: 'warrior',
        level: 4,
        maxHp: 180,
        currentHp: 180,
        maxMana: 20,
        currentMana: 20,
        stats: { strength: 16, agility: 12, endurance: 18, intellect: 2 },
        sprite: 'skeleton'
      },
      '7,9': {
        id: '7,9',
        name: 'Лорд Лич',
        race: 'elf',
        classType: 'mage',
        level: 5,
        maxHp: 240,
        currentHp: 240,
        maxMana: 350,
        currentMana: 350,
        stats: { strength: 10, agility: 15, endurance: 24, intellect: 35 },
        sprite: 'boss',
        isBoss: true
      }
    },
    chests: {
      '1,1': {
        id: '1,1',
        type: 'key',
        keyId: 'catacomb_key',
        rewardItemName: 'Древний Ключ Склепа'
      },
      '5,7': {
        id: '5,7',
        type: 'gold',
        rewardAmount: 150,
        rewardItemName: 'Сундук с золотом'
      }
    },
    doors: {
      '10,2': {
        id: '10,2',
        locked: true,
        keyId: 'catacomb_key',
        name: 'Тяжелые Кованые Врата'
      }
    }
  },
  secret_lair: {
    key: 'secret_lair',
    name: 'Тайное Логово',
    grid: [
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#'],
      ['#', 'C', '.', '#', '.', '.', '.', 'M', '.', '#'],
      ['#', '#', 'D', '#', '.', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', '#', 'C', '#', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '.', '#', '.', '#'],
      ['#', 'M', '#', 'C', '.', 'M', '.', '#', '.', '#'],
      ['#', '.', '#', '#', '#', '#', '#', '#', '.', '#'],
      ['#', '.', '.', '.', '.', 'M', '.', '.', '.', '#'],
      ['#', '#', '#', '.', '#', '#', '#', '.', 'E', '#'],
      ['#', '#', '#', '#', '#', '#', '#', '#', '#', '#']
    ],
    startPos: { x: 3, y: 8 },
    startDir: 'N',
    monsters: {
      '7,1': {
        id: '7,1',
        name: 'Разбойник',
        race: 'elf',
        classType: 'archer',
        level: 2,
        maxHp: 80,
        currentHp: 80,
        maxMana: 50,
        currentMana: 50,
        stats: { strength: 8, agility: 12, endurance: 8, intellect: 5 },
        sprite: 'rat'
      },
      '1,5': {
        id: '1,5',
        name: 'Наемник банды',
        race: 'orc',
        classType: 'warrior',
        level: 2,
        maxHp: 100,
        currentHp: 100,
        maxMana: 10,
        currentMana: 10,
        stats: { strength: 11, agility: 7, endurance: 10, intellect: 1 },
        sprite: 'rat'
      },
      '5,5': {
        id: '5,5',
        name: 'Главарь Налетчиков',
        race: 'human',
        classType: 'warrior',
        level: 3,
        maxHp: 130,
        currentHp: 130,
        maxMana: 20,
        currentMana: 20,
        stats: { strength: 14, agility: 10, endurance: 13, intellect: 2 },
        sprite: 'boss',
        isBoss: true
      },
      '5,7': {
        id: '5,7',
        name: 'Контрабандист',
        race: 'gnome',
        classType: 'warrior',
        level: 2,
        maxHp: 90,
        currentHp: 90,
        maxMana: 20,
        currentMana: 20,
        stats: { strength: 10, agility: 9, endurance: 9, intellect: 2 },
        sprite: 'rat'
      }
    },
    chests: {
      '1,1': {
        id: '1,1',
        type: 'item',
        rewardItemType: 'scroll_atk',
        rewardItemName: 'Свиток разрушения'
      },
      '6,3': {
        id: '6,3',
        type: 'key',
        keyId: 'lair_key',
        rewardItemName: 'Ржавый Ключ Логова'
      },
      '3,5': {
        id: '3,5',
        type: 'gold',
        rewardAmount: 80,
        rewardItemName: 'Кошель с монетами'
      }
    },
    doors: {
      '2,2': {
        id: '2,2',
        locked: true,
        keyId: 'lair_key',
        name: 'Деревянная Заслонка'
      }
    }
  }
};
