import bedImg from '../assets/items/bed.png';
import chestImg from '../assets/items/chest.png';
import potionHpImg from '../assets/items/potion_hp.png';
import potionMpImg from '../assets/items/potion_mp.png';
import combatBeltImg from '../assets/items/combat_belt.png';
import helmetImg from '../assets/items/helmet.png';
import armorImg from '../assets/items/armor.png';
import glovesImg from '../assets/items/gloves.png';
import bootsImg from '../assets/items/boots.png';
import weaponImg from '../assets/items/weapon.png';
import shieldImg from '../assets/items/shield.png';
import leggingsImg from '../assets/items/leggings.png';
import ringImg from '../assets/items/ring.png';
import amuletImg from '../assets/items/amulet.png';
import scrollImg from '../assets/items/scroll.png';

export const getItemImage = (type: string, fallbackIcon?: string): string => {
  switch (type) {
    case 'helmet': return helmetImg;
    case 'armor': return armorImg;
    case 'gloves': return glovesImg;
    case 'boots': return bootsImg;
    case 'weapon': return weaponImg;
    case 'shield': return shieldImg;
    case 'belt':
    case 'leggings':
      return leggingsImg;
    case 'ring':
    case 'ring1':
    case 'ring2':
      return ringImg;
    case 'amulet': return amuletImg;
    case 'spellbook': return combatBeltImg;
    case 'potion_hp': return potionHpImg;
    case 'potion_mp': return potionMpImg;
    case 'scroll':
    case 'scroll_atk':
    case 'scroll_def':
    case 'scroll_dodge':
    case 'scroll_crit':
      return scrollImg;
    default:
      return fallbackIcon || '';
  }
};

export const getBedImage = (): string => bedImg;
export const getChestImage = (): string => chestImg;
