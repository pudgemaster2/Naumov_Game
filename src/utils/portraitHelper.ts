import type { CharacterRace, CharacterClass } from '../types';

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

export const getPortrait = (race: CharacterRace, classType: CharacterClass): string => {
  switch (race) {
    case 'elf':
      if (classType === 'warrior') return newElfWarrior;
      if (classType === 'archer') return newElfArcher;
      return newElfMage;
    case 'gnome':
      if (classType === 'warrior') return newGnomeWarrior;
      if (classType === 'archer') return newGnomeArcher;
      return newGnomeMage;
    case 'human':
      if (classType === 'warrior') return newHumanWarrior;
      if (classType === 'archer') return newHumanArcher;
      return newHumanMage;
    case 'orc':
      if (classType === 'warrior') return newOrcWarrior;
      if (classType === 'archer') return newOrcArcher;
      return newOrcMage;
    default:
      return newHumanWarrior;
  }
};
