export type CharacterClass = 'barbarian' | 'mage' | 'archer';

export interface CharacterStats {
  strength: number;
  agility: number;
  endurance: number;
  intellect: number;
}

export interface AvatarSettings {
  gender: 'male' | 'female';
  hairColor: string;
  skinColor: string;
  outfitColor: string;
  faceStyle: number;
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
  wins: number;
  losses: number;
  avatarSettings?: AvatarSettings;
  upgrades?: Record<string, number>;
  activeBuff?: {
    name: string;
    type: 'strength' | 'agility' | 'endurance' | 'intellect';
    value: number;
    fightsLeft: number;
  };
  lastDailyClaim?: string;
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
  barbarian: {
    name: 'barbarian',
    title: 'Силач (Воин)',
    description: 'Обладает сокрушительной физической силой и огромным запасом здоровья. Удары медленные, но сокрушительные.',
    stats: {
      strength: 14,
      agility: 6,
      endurance: 16,
      intellect: 4,
    },
  },
  mage: {
    name: 'mage',
    title: 'Маг',
    description: 'Мастер тайных искусств. Наносит колоссальный магический урон, но слаб в ближнем бою и уязвим физически.',
    stats: {
      strength: 4,
      agility: 8,
      endurance: 8,
      intellect: 20,
    },
  },
  archer: {
    name: 'archer',
    title: 'Эльф-лучник',
    description: 'Невероятно ловок и быстр. Имеет высокий шанс увернуться от вражеских ударов и нанести критический выстрел.',
    stats: {
      strength: 8,
      agility: 18,
      endurance: 10,
      intellect: 6,
    },
  },
};
