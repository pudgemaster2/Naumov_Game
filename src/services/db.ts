import type { Character } from '../types';

class MockDatabase {
  // Mimics: doc(db, 'users', uid) getDoc()
  async loadCharacter(uid: string): Promise<Character | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const charJson = localStorage.getItem(`rpg_char_${uid}`);
        if (!charJson) {
          resolve(null);
          return;
        }

        try {
          const char = JSON.parse(charJson) as Character;
          resolve(char);
        } catch {
          resolve(null);
        }
      }, 300); // Simulate network load
    });
  }

  // Mimics: setDoc(doc(db, 'users', uid), characterData)
  async saveCharacter(uid: string, character: Character): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(`rpg_char_${uid}`, JSON.stringify(character));
        resolve();
      }, 300); // Simulate network write
    });
  }
}

export const db = new MockDatabase();
