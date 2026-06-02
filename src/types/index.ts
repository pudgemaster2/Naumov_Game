export type CharacterRace = 'human' | 'elf' | 'gnome' | 'orc';
export type CharacterClass = 'warrior' | 'archer' | 'mage';

export interface CharacterStats {
  strength: number;
  agility: number;
  endurance: number;
  intellect: number;
}

export interface Item {
  id: string;
  name: string;
  type: 
    | 'helmet' 
    | 'armor' 
    | 'gloves' 
    | 'boots' 
    | 'weapon' 
    | 'shield' 
    | 'belt' 
    | 'ring' 
    | 'spellbook'
    | 'potion_hp'
    | 'potion_mp'
    | 'scroll_atk'
    | 'scroll_def'
    | 'scroll_dodge'
    | 'scroll_crit';
  stats: Partial<CharacterStats>;
  description: string;
  icon: string;
}

export interface Equipment {
  helmet?: Item;
  armor?: Item;
  gloves?: Item;
  boots?: Item;
  weapon?: Item;
  shield?: Item;
  belt?: Item;
  ring1?: Item;
  ring2?: Item;
  spellbook?: Item;
}

export interface Character {
  name: string;
  race: CharacterRace;
  classType: CharacterClass;
  level: number;
  experience: number;
  gold: number;
  stats: CharacterStats;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  wins: number;
  losses: number;
  upgrades?: Record<string, number>;
  activeBuff?: {
    name: string;
    type: 'strength' | 'agility' | 'endurance' | 'intellect';
    value: number;
    fightsLeft: number;
  };
  lastDailyClaim?: string;
  inventory?: Item[];
  equipment?: Equipment;
}

export type CombatZone = 'head' | 'chest' | 'stomach' | 'legs';

export type LogEntryType = 'hit' | 'crit' | 'block' | 'dodge' | 'system' | 'victory' | 'defeat';

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  type: LogEntryType;
  message: string;
}

export type ScreenState = 'auth' | 'char_select' | 'hub' | 'battle';

export interface RaceTemplate {
  key: CharacterRace;
  title: string;
  description: string;
  baseStats: CharacterStats;
}

export interface ClassTemplate {
  key: CharacterClass;
  title: string;
  description: string;
  statModifiers: CharacterStats;
}

export const RACE_TEMPLATES: Record<CharacterRace, RaceTemplate> = {
  human: {
    key: 'human',
    title: 'Человек',
    description: 'Универсальная раса. Сбалансированные характеристики позволяют одинаково успешно развивать любой боевой путь.',
    baseStats: { strength: 8, agility: 8, endurance: 8, intellect: 8 }
  },
  elf: {
    key: 'elf',
    title: 'Эльф',
    description: 'Грациозные жители лесов. Обладают врожденной ловкостью и координацией, что делает их непревзойденными стрелками и верткими бойцами.',
    baseStats: { strength: 6, agility: 12, endurance: 8, intellect: 6 }
  },
  gnome: {
    key: 'gnome',
    title: 'Гном',
    description: 'Стойкие обитатели подземелий. Невероятное упорство и толстая кожа дают им огромную выживаемость под тяжелыми ударами.',
    baseStats: { strength: 9, agility: 5, endurance: 14, intellect: 4 }
  },
  orc: {
    key: 'orc',
    title: 'Орк',
    description: 'Яростные воины степей. Природа наделила их чудовищной мышечной массой и физической силой, сокрушающей любую защиту.',
    baseStats: { strength: 12, agility: 4, endurance: 12, intellect: 4 }
  }
};

export const CLASS_TEMPLATES: Record<CharacterClass, ClassTemplate> = {
  warrior: {
    key: 'warrior',
    title: 'Воин',
    description: 'Мастер ближнего боя. Специализируется на сокрушительных ударах оружием ближнего боя и превосходной физической защите.',
    statModifiers: { strength: 6, agility: 2, endurance: 4, intellect: 0 }
  },
  archer: {
    key: 'archer',
    title: 'Лучник',
    description: 'Опасный стрелок. Полагается на молниеносные маневры, увороты и высокоточные критические выстрелы с дистанции.',
    statModifiers: { strength: 3, agility: 7, endurance: 2, intellect: 0 }
  },
  mage: {
    key: 'mage',
    title: 'Маг',
    description: 'Повелитель стихий. Наносит колоссальный урон тайной магией, требующей высокой концентрации маны (MP).',
    statModifiers: { strength: 0, agility: 2, endurance: 1, intellect: 9 }
  }
};

