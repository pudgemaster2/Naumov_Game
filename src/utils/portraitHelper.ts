import type { CharacterRace, CharacterClass } from '../types';

// Male Portraits
import newElfWarrior from '../assets/new_races/new_elf_warrior.jpg';
import newElfArcher from '../assets/new_races/new_elf_archer.jpg';
import newElfMage from '../assets/new_races/new_elf_mage.jpg';

import newGnomeWarrior from '../assets/new_races/new_gnome_warrior.jpg';
import newGnomeArcher from '../assets/new_races/new_gnome_archer.jpg';
import newGnomeMage from '../assets/new_races/new_gnome_mage.jpg';

import newHumanWarrior from '../assets/new_races/new_human_warrior.jpg';
import newHumanArcher from '../assets/new_races/new_human_archer.jpg';
import newHumanMage from '../assets/new_races/new_human_mage.jpg';

import newOrcWarrior from '../assets/new_races/new_orc_warrior.jpg';
import newOrcArcher from '../assets/new_races/new_orc_archer.jpg';
import newOrcMage from '../assets/new_races/new_orc_mage.jpg';

// Female Portraits
import womanElfWarrior from '../assets/new_races/Women/woman_new_elf_warrior.jpg';
import womanElfArcher from '../assets/new_races/Women/woman_new_elf_archer.jpg';
import womanElfMage from '../assets/new_races/Women/woman_new_elf_mage.jpg';

import womanGnomeWarrior from '../assets/new_races/Women/woman_new_gnome_warrior.jpg';
import womanGnomeArcher from '../assets/new_races/Women/woman_new_gnome_archer.jpg';
import womanGnomeMage from '../assets/new_races/Women/woman_new_gnome_mage.jpg';

import womanHumanWarrior from '../assets/new_races/Women/woman_new_human_warrior.jpg';
import womanHumanArcher from '../assets/new_races/Women/woman_new_human_archer.jpg';
import womanHumanMage from '../assets/new_races/Women/woman_new_human_mage.jpg';

import womanOrcWarrior from '../assets/new_races/Women/woman_new_orc_warrior.jpg';
import womanOrcArcher from '../assets/new_races/Women/woman_new_orc_archer.jpg';
import womanOrcMage from '../assets/new_races/Women/woman_new_orc_mage.jpg';

export const getPortrait = (
  race: CharacterRace,
  classType: CharacterClass,
  gender: 'male' | 'female' = 'male'
): string => {
  const isFemale = gender === 'female';

  switch (race) {
    case 'elf':
      if (classType === 'warrior') return isFemale ? womanElfWarrior : newElfWarrior;
      if (classType === 'archer') return isFemale ? womanElfArcher : newElfArcher;
      return isFemale ? womanElfMage : newElfMage;
    case 'gnome':
      if (classType === 'warrior') return isFemale ? womanGnomeWarrior : newGnomeWarrior;
      if (classType === 'archer') return isFemale ? womanGnomeArcher : newGnomeArcher;
      return isFemale ? womanGnomeMage : newGnomeMage;
    case 'human':
      if (classType === 'warrior') return isFemale ? womanHumanWarrior : newHumanWarrior;
      if (classType === 'archer') return isFemale ? womanHumanArcher : newHumanArcher;
      return isFemale ? womanHumanMage : newHumanMage;
    case 'orc':
      if (classType === 'warrior') return isFemale ? womanOrcWarrior : newOrcWarrior;
      if (classType === 'archer') return isFemale ? womanOrcArcher : newOrcArcher;
      return isFemale ? womanOrcMage : newOrcMage;
    default:
      return isFemale ? womanHumanWarrior : newHumanWarrior;
  }
};

