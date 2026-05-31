export type CharacterClass = 'elf' | 'mage' | 'orc' | 'gnome';

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
  ring3?: Item;
  ring4?: Item;
  spellbook?: Item;
}

export interface Character {
  name: string;
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

export interface ClassTemplate {
  name: string;
  title: string;
  description: string;
  stats: CharacterStats;
}

export const CLASS_TEMPLATES: Record<CharacterClass, ClassTemplate> = {
  elf: {
    name: 'elf',
    title: 'Эльф',
    description: 'Быстрый и проворный боец. Высокая ловкость позволяет часто уворачиваться от ударов противника и наносить критические попадания.',
    stats: {
      strength: 8,
      agility: 18,
      endurance: 10,
      intellect: 6,
    },
  },
  mage: {
    name: 'mage',
    title: 'Маг',
    description: 'Мастер заклинаний. Наносит сокрушительный магический урон, расходуя ману, но уязвим физически.',
    stats: {
      strength: 4,
      agility: 8,
      endurance: 8,
      intellect: 20,
    },
  },
  orc: {
    name: 'orc',
    title: 'Орк',
    description: 'Могучий воин. Обладает огромной физической силой и большим запасом здоровья. Удары медленные, но очень тяжелые.',
    stats: {
      strength: 15,
      agility: 5,
      endurance: 16,
      intellect: 4,
    },
  },
  gnome: {
    name: 'gnome',
    title: 'Гном',
    description: 'Крепкий защитник. Чрезвычайно вынослив, имеет сбалансированную силу и высокий базовый запас здоровья.',
    stats: {
      strength: 11,
      agility: 7,
      endurance: 18,
      intellect: 6,
    },
  },
};

