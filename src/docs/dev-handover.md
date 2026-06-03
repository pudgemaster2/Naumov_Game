# Developer Handover & Architectural Log (Unified)

This document acts as a comprehensive developer handbook summarizing the architectural changes, code files, and features implemented during the session under Conversation ID `609d65f6-d7f9-4fe5-87d0-f2310040af65`.

## Quick Start for Next Session
When starting a new chat, point the AI assistant directly to this file. It contains the complete walkthrough and current state of the application.

* **Conversation ID**: `609d65f6-d7f9-4fe5-87d0-f2310040af65`
* **Local Repo Path**: `c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game`
* **Target Branch**: `dev`

---

## 1. Project Features & Architecture

We have successfully designed, built, and integrated a complete grid-based Dungeon Crawler system inspired by the classic RPG "Бойцовский Клуб". All components build cleanly.

### Visual Assets (Corridor Viewports & Sprites)
The assets are saved under `src/assets/dungeon/` and `src/assets/items/`:
- **Dungeon Corridor Viewports**: `dungeon_straight.png`, `dungeon_dead_end.png`, `dungeon_left_turn.png`, `dungeon_right_turn.png`, `dungeon_t_junction.png`, `dungeon_left_open.png`, `dungeon_right_open.png`, `dungeon_crossroads.png`.
- **Sprites**: `dungeon_chest.png`, `dungeon_door.png`.
- **Monsters**: `dungeon_monster_rat.png`, `dungeon_monster_skeleton.png`, `dungeon_monster_boss.png`.
- **New RPG Item Icons**: `staff.png` (Wizard Staff), `bow.png` (Recurve Bow), `quiver.png` (Quiver of Arrows).

### Map Layouts and Monster Data
Defined in [dungeonMaps.ts](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/utils/dungeonMaps.ts):
- **Заброшенная Канализация (`dungeon_1`)**: 10x10 sewage grids with Rat monsters, Slime, Sewage mutant boss, HP potion chest, and exit door requiring the Sewage Key.
- **Катакомбы Мучений (`dungeon_2`)**: 12x12 crypt grids with Skeletons, Zombie, Chests, a Locked Gate requiring the Catacomb Key, and the Lich Boss.
- **Тайное Логово (`secret_lair`)**: 10x10 bandit camp with rogue bandits and a Bandit Boss.

### Game State & Combat Redirection
Updated [useGameState.ts](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/hooks/useGameState.ts):
- **Preserved Location**: Sub-location routing state (`activeSubLoc`) is preserved globally so players return directly to the dungeon coordinate grid when a fight ends.
- **Custom Combatants**: Extended `startCombat` to accept custom dungeon monster stats/names.
- **Battle Exit**: Winning marks the monster coordinate as defeated in `dungeonState` and redirects the player to their exact position in the crawler grid.

### Hub & Suburbs Switch
- **Suburbs View ([SuburbsView.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/SuburbsView.tsx))**: Linked portal coordinates to the crawler. Clicking on any dungeon portal opens the dungeon crawler map grid instead of a placeholder.
- **Hub Screen ([HubScreen.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/screens/HubScreen.tsx))**: Renders the crawler component under the `'dungeon'` sub-location routing.

---

## 2. Key UI/UX Updates

### Class-Specific Starting Gear & Slots
* **Starting Items Pre-equipped**: Starting gear (helmet, armor, gloves, boots, and the Combat Belt) is automatically equipped on character creation (`selectCharacterClass` in `useGameState.ts`). Backpack inventory is reserved for consumables (potions/scrolls).
* **Class-Specific Gear Rules**:
  * **Warrior**: Short Sword (+2 strength, weapon slot) & Wooden Shield (+1 endurance, shield slot).
  * **Archer**: Recurve Bow (+2 agility, weapon slot) & Quiver of Arrows (+1 agility, shield slot).
  * **Mage**: Wizard Staff (+2 intellect, weapon slot) & Spellbook (+1 intellect, shield slot).
* **Dynamic Slot Labels**: The weapon and shield equipment slots rename dynamically in [MyHouseView.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/MyHouseView.tsx) and [FighterCard.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/FighterCard.tsx) (e.g. Mage sees "Посох" & "Книга заклинаний", Archer sees "Лук" & "Колчан стрел").
* **Migration Support**: Loader in `useGameState.ts` automatically equips missing starting gear for pre-existing characters and recalculates player stats.

### Interactive Premium Tooltips
* Redesigned the `ItemHtmlTooltip` inside [MyHouseView.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/MyHouseView.tsx) and [FighterCard.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/FighterCard.tsx):
  * Displays item level ("Уровень: 1"), Russian category names, full descriptions, and list of color-coded stat bonuses. Fixed tooltip layers (`z-50`) to overlay correctly over other panels.

### Simplified Monster Profiles
* In [FighterCard.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/FighterCard.tsx), monsters (identified via `fighter.sprite`) no longer show equipment slots or class/race descriptions. They render as clean portraits showing only Name, Level, HP/MP bars, and win statistics.

### Cinematic Widescreen Dungeon Viewport
* Enlarged the 3D viewport box in [DungeonCrawler.tsx](file:///c:/Users/Дмитрий/Desktop/Antigravity Works/Naumov Game/src/components/DungeonCrawler.tsx) to `max-w-[880px] h-[495px]` (+10% increase from the previous widescreen layout).
* Adjusted scaling parameters for overlays (chests, locked doors, sprites) so they remain proportioned and aligned.

### Non-stretching 3-Column Dungeon Dashboard
* Arranged the Minimap, Navigation D-Pad, and Labyrinth Log horizontally side-by-side below the widescreen viewport.
* Fixed the height of all three panels at exactly `h-[340px]`. The console log scrolls internally, preventing vertical page stretching or alignment glitches.

### Interactive Loot Popups
* Opening a chest triggers a centered animated popup modal showing chest contents:
  * **Gold**: Golden coin icon with detailed text.
  * **Keys**: Door key icons with unlocking text.
  * **Items**: Potions and scrolls with resolved images and stat descriptions. Resolved a bug where scrolls were showing health potion icons/descriptions.

---

## 3. Verification Commands

To check the code status in future sessions:
- **TypeScript Typecheck**:
  ```powershell
  npx tsc -p tsconfig.app.json --noEmit
  ```
- **Vite Production Build**:
  ```powershell
  npm run build
  ```
- **Vite Local Server**:
  ```powershell
  npm run dev
  ```
