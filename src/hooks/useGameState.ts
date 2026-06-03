import { useState, useEffect } from 'react';
import { RACE_TEMPLATES, CLASS_TEMPLATES } from '../types';
import type { 
  Character, 
  CharacterRace,
  CharacterClass, 
  CombatZone, 
  CombatLogEntry, 
  ScreenState, 
  LogEntryType,
  Item
} from '../types';
import { auth } from '../services/auth';
import type { UserSession } from '../services/auth';
import { db } from '../services/db';
import { getItemImage } from '../utils/itemHelper';

const defaultStartingItems: Item[] = [
  { id: 'start_combat_belt', name: 'Боевой пояс', type: 'spellbook', stats: { endurance: 1 }, description: 'Пояс с ячейками для зелий и свитков. Позволяет использовать припасы в бою.', icon: getItemImage('spellbook') },
  { id: 'start_helmet', name: 'Шлем', type: 'helmet', stats: { endurance: 2 }, description: 'Простой шлем для защиты головы.', icon: getItemImage('helmet') },
  { id: 'start_gloves', name: 'Перчатки', type: 'gloves', stats: { agility: 1 }, description: 'Простые перчатки, повышающие хватку.', icon: getItemImage('gloves') },
  { id: 'start_armor', name: 'Нагрудник', type: 'armor', stats: { endurance: 4 }, description: 'Легкий нагрудник, защищающий грудь.', icon: getItemImage('armor') },
  { id: 'start_boots', name: 'Сапоги', type: 'boots', stats: { agility: 1 }, description: 'Прочные сапоги, увеличивающие скорость движений.', icon: getItemImage('boots') },
  { id: 'potion_hp_1', name: 'Зелье здоровья', type: 'potion_hp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 HP в бою или дома.', icon: getItemImage('potion_hp') },
  { id: 'potion_hp_2', name: 'Зелье здоровья', type: 'potion_hp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 HP в бою или дома.', icon: getItemImage('potion_hp') },
  { id: 'potion_hp_3', name: 'Зелье здоровья', type: 'potion_hp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 HP в бою или дома.', icon: getItemImage('potion_hp') },
  { id: 'potion_mp_1', name: 'Зелье маны', type: 'potion_mp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 MP в бою.', icon: getItemImage('potion_mp') },
  { id: 'potion_mp_2', name: 'Зелье маны', type: 'potion_mp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 MP в бою.', icon: getItemImage('potion_mp') },
  { id: 'potion_mp_3', name: 'Зелье маны', type: 'potion_mp', stats: {}, description: 'Магический эликсир. Восстанавливает 50 MP в бою.', icon: getItemImage('potion_mp') },
  { id: 'scroll_atk_1', name: 'Свиток Ярости', type: 'scroll_atk', stats: {}, description: 'Увеличивает наносимый урон на +10 до конца боя.', icon: getItemImage('scroll_atk') },
  { id: 'scroll_def_1', name: 'Свиток Каменной Кожи', type: 'scroll_def', stats: {}, description: 'Снижает получаемый урон на 5 до конца боя.', icon: getItemImage('scroll_def') },
  { id: 'scroll_dodge_1', name: 'Свиток Ветра', type: 'scroll_dodge', stats: {}, description: 'Повышает шанс уклонения на +15% до конца боя.', icon: getItemImage('scroll_dodge') },
  { id: 'scroll_crit_1', name: 'Свиток Гнева', type: 'scroll_crit', stats: {}, description: 'Повышает шанс крита на +15% до конца боя.', icon: getItemImage('scroll_crit') }
];

export const useGameState = () => {
  const [screen, setScreen] = useState<ScreenState>('auth');
  const [user, setUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [player, setPlayer] = useState<Character | null>(null);
  const [bot, setBot] = useState<Character | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);
  const [playerChoices, setPlayerChoices] = useState<{
    attack: CombatZone | null;
    defense: CombatZone | null;
  }>({ attack: null, defense: null });
  const [combatWinner, setCombatWinner] = useState<'player' | 'bot' | 'draw' | null>(null);
  const [combatSummary, setCombatSummary] = useState({
    goldReward: 0,
    expReward: 0,
    damageDealt: 0,
    damageReceived: 0,
    damageBlocked: 0,
    lastTurnDamageDealt: 0,
    lastTurnDamageReceived: 0
  });

  // Combat Consumable Tracking States
  const [potionsUsed, setPotionsUsed] = useState(0);
  const [activeScrolls, setActiveScrolls] = useState({
    atk: false,
    def: false,
    dodge: false,
    crit: false,
  });

  // Dungeon Crawler States
  const [activeSubLoc, setActiveSubLoc] = useState<any>('town');
  const [dungeonState, setDungeonState] = useState<any>(null);
  const [combatDungeonContext, setCombatDungeonContext] = useState<{
    dungeonId: string;
    monsterCoord: string;
    isBoss: boolean;
  } | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = auth.onAuthStateChange(async (session) => {
      setUser(session);
      
      if (session) {
        // Fetch character for user
        const character = await db.loadCharacter(session.uid);
        if (character) {
          // Class migration for backwards compatibility
          if (!character.race) {
            const oldClass = character.classType as string;
            if (oldClass === 'elf') {
              character.race = 'elf';
              character.classType = 'archer';
            } else if (oldClass === 'mage') {
              character.race = 'human';
              character.classType = 'mage';
            } else if (oldClass === 'orc' || oldClass === 'barbarian') {
              character.race = 'orc';
              character.classType = 'warrior';
            } else if (oldClass === 'gnome') {
              character.race = 'gnome';
              character.classType = 'warrior';
            } else {
              character.race = 'human';
              character.classType = 'warrior';
            }
          }

          if (!character.inventory) {
            character.inventory = [...defaultStartingItems];
          }
          if (!character.equipment) {
            character.equipment = {};
          }
          const hasBeltInInv = character.inventory.some((item: any) => item.type === 'spellbook');
          const hasBeltInEq = character.equipment.spellbook !== undefined;
          if (!hasBeltInInv && !hasBeltInEq) {
            character.inventory.push({
              id: 'start_combat_belt',
              name: 'Боевой пояс',
              type: 'spellbook',
              stats: { endurance: 1 },
              description: 'Пояс с ячейками для зелий и свитков. Позволяет использовать припасы в бою.',
              icon: getItemImage('spellbook')
            });
          }

          // Item icons & names migration for compatibility with custom PNG assets and names
          const migrateItems = (items: Item[]) => {
            return items.map(item => {
              let newName = item.name;
              newName = newName.replace(/Кожаный\s+/g, '')
                               .replace(/Кожаные\s+/g, '')
                               .replace(/кожаный\s+/g, '')
                               .replace(/кожаные\s+/g, '');
              if (newName.length > 0) {
                newName = newName.charAt(0).toUpperCase() + newName.slice(1);
              }

              let newDesc = item.description || '';
              newDesc = newDesc.replace(/Кожаный\s+/gi, '')
                               .replace(/Кожаные\s+/gi, '')
                               .replace(/кожаный\s+/gi, '')
                               .replace(/кожаные\s+/gi, '');
              if (newDesc.length > 0) {
                newDesc = newDesc.charAt(0).toUpperCase() + newDesc.slice(1);
              }

              return {
                ...item,
                name: newName,
                description: newDesc,
                icon: getItemImage(item.type, item.icon)
              };
            });
          };

          character.inventory = migrateItems(character.inventory);
          const equipment = character.equipment || {};
          Object.keys(equipment).forEach((key) => {
            const k = key as keyof typeof equipment;
            const eq = equipment[k];
            if (eq) {
              let newName = eq.name;
              newName = newName.replace(/Кожаный\s+/g, '')
                               .replace(/Кожаные\s+/g, '')
                               .replace(/кожаный\s+/g, '')
                               .replace(/кожаные\s+/g, '');
              if (newName.length > 0) {
                newName = newName.charAt(0).toUpperCase() + newName.slice(1);
              }
              eq.name = newName;

              let newDesc = eq.description || '';
              newDesc = newDesc.replace(/Кожаный\s+/gi, '')
                               .replace(/Кожаные\s+/gi, '')
                               .replace(/кожаный\s+/gi, '')
                               .replace(/кожаные\s+/gi, '');
              if (newDesc.length > 0) {
                newDesc = newDesc.charAt(0).toUpperCase() + newDesc.slice(1);
              }
              eq.description = newDesc;

              eq.icon = getItemImage(eq.type, eq.icon);
            }
          });

          // Set Mana stats if undefined (migration)
          if (character.maxMana === undefined || character.currentMana === undefined) {
            character.maxMana = character.stats.intellect * 10;
            character.currentMana = character.maxMana;
          }
          setPlayer(character);
          setScreen('hub');
          // Save migrated character permanently
          await db.saveCharacter(session.uid, character);
        } else {
          setPlayer(null);
          setScreen('char_select');
        }
      } else {
        setPlayer(null);
        setScreen('auth');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await auth.login(email, password);
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err.message || 'Ошибка входа.');
      throw err;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await auth.register(email, password);
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err.message || 'Ошибка регистрации.');
      throw err;
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    await auth.logout();
    setBot(null);
    setPlayer(null);
    setScreen('auth');
  };

  const selectCharacterClass = async (race: CharacterRace, classType: CharacterClass, name: string) => {
    if (!user) return;

    const raceTemplate = RACE_TEMPLATES[race];
    const classTemplate = CLASS_TEMPLATES[classType];
    
    const baseStats = raceTemplate.baseStats;
    const modifiers = classTemplate.statModifiers;
    
    const stats = {
      strength: baseStats.strength + modifiers.strength,
      agility: baseStats.agility + modifiers.agility,
      endurance: baseStats.endurance + modifiers.endurance,
      intellect: baseStats.intellect + modifiers.intellect,
    };
    
    const maxHp = stats.endurance * 10;
    const maxMana = stats.intellect * 10;
    
    const newPlayer: Character = {
      name: name.trim() || `Игрок_${Math.floor(Math.random() * 1000)}`,
      race,
      classType,
      level: 1,
      experience: 0,
      gold: 0,
      stats,
      currentHp: maxHp,
      maxHp: maxHp,
      currentMana: maxMana,
      maxMana: maxMana,
      wins: 0,
      losses: 0,
      inventory: [...defaultStartingItems],
      equipment: {},
    };
    
    setPlayer(newPlayer);
    await db.saveCharacter(user.uid, newPlayer);
    setScreen('hub');
  };

  const startCombat = (customEnemy?: Character & { isDungeonBoss?: boolean; dungeonId?: string; monsterCoord?: string }) => {
    if (!player) return;

    // Retain player current HP and current Mana (no auto healing!)
    // Reset combat potions and scrolls tracker
    setPotionsUsed(0);
    setActiveScrolls({ atk: false, def: false, dodge: false, crit: false });
    setCombatSummary({
      goldReward: 0,
      expReward: 0,
      damageDealt: 0,
      damageReceived: 0,
      damageBlocked: 0,
      lastTurnDamageDealt: 0,
      lastTurnDamageReceived: 0
    });

    let generatedBot: Character;
    let raceTemplate: any;
    let classTemplate: any;

    if (customEnemy && typeof customEnemy === 'object' && 'name' in customEnemy && typeof (customEnemy as any).name === 'string') {
      generatedBot = { ...customEnemy };
      raceTemplate = RACE_TEMPLATES[customEnemy.race];
      classTemplate = CLASS_TEMPLATES[customEnemy.classType];
      
      if (customEnemy.dungeonId && customEnemy.monsterCoord) {
        setCombatDungeonContext({
          dungeonId: customEnemy.dungeonId,
          monsterCoord: customEnemy.monsterCoord,
          isBoss: !!customEnemy.isDungeonBoss
        });
      }
    } else {
      // Generate random bot combination of race and class
      const races: CharacterRace[] = ['human', 'elf', 'gnome', 'orc'];
      const classes: CharacterClass[] = ['warrior', 'archer', 'mage'];
      
      const botRace = races[Math.floor(Math.random() * races.length)];
      const botClass = classes[Math.floor(Math.random() * classes.length)];
      
      raceTemplate = RACE_TEMPLATES[botRace];
      classTemplate = CLASS_TEMPLATES[botClass];
      
      const botNames = ['Грязный Гарри', 'Безумный Джо', 'Свирепый Орк', 'Теневой Убийца', 'Старый Гэндальф', 'Адепт Хаоса'];
      const botName = botNames[Math.floor(Math.random() * botNames.length)];

      // Base stats matching combination
      const baseStats = raceTemplate.baseStats;
      const modifiers = classTemplate.statModifiers;
      
      const levelDiff = player.level - 1;
      const adjustedStats = {
        strength: baseStats.strength + modifiers.strength + levelDiff,
        agility: baseStats.agility + modifiers.agility + levelDiff,
        endurance: baseStats.endurance + modifiers.endurance + levelDiff,
        intellect: baseStats.intellect + modifiers.intellect + levelDiff,
      };
      const adjustedMaxHp = adjustedStats.endurance * 10;
      const adjustedMaxMana = adjustedStats.intellect * 10;

      const botEquipment: any = {
        helmet: { id: 'bot_helmet', name: 'Шлем гладиатора', type: 'helmet', stats: { endurance: 1 }, description: 'Тяжелый шлем арены.', icon: getItemImage('helmet') },
        armor: { id: 'bot_armor', name: 'Нагрудник гладиатора', type: 'armor', stats: { endurance: 2 }, description: 'Защитные пластины.', icon: getItemImage('armor') },
        gloves: { id: 'bot_gloves', name: 'Рукавицы гладиатора', type: 'gloves', stats: { strength: 1 }, description: 'Боевые перчатки.', icon: getItemImage('gloves') },
        boots: { id: 'bot_boots', name: 'Сапоги гладиатора', type: 'boots', stats: { agility: 1 }, description: 'Поношенные сапоги арены.', icon: getItemImage('boots') }
      };
      
      if (botClass === 'warrior') {
        botEquipment.weapon = { id: 'bot_weapon', name: 'Короткий меч', type: 'weapon', stats: { strength: 2 }, description: 'Гладиус ближнего боя.', icon: getItemImage('weapon') };
        botEquipment.shield = { id: 'bot_shield', name: 'Деревянный щит', type: 'shield', stats: { endurance: 1 }, description: 'Круглый щит.', icon: getItemImage('shield') };
      } else if (botClass === 'archer') {
        botEquipment.weapon = { id: 'bot_weapon', name: 'Простой лук', type: 'weapon', stats: { agility: 2 }, description: 'Охотничий лук.', icon: getItemImage('weapon') };
      } else if (botClass === 'mage') {
        botEquipment.weapon = { id: 'bot_weapon', name: 'Магический посох', type: 'weapon', stats: { intellect: 2 }, description: 'Посох послушника.', icon: getItemImage('weapon') };
        botEquipment.spellbook = { id: 'bot_belt', name: 'Боевой пояс', type: 'spellbook', stats: { intellect: 1 }, description: 'Пояс с ячейками.', icon: getItemImage('spellbook') };
      }

      generatedBot = {
        name: botName,
        race: botRace,
        classType: botClass,
        level: player.level,
        experience: 0,
        gold: 0,
        stats: adjustedStats,
        currentHp: adjustedMaxHp,
        maxHp: adjustedMaxHp,
        currentMana: adjustedMaxMana,
        maxMana: adjustedMaxMana,
        wins: 0,
        losses: 0,
        equipment: botEquipment,
      };

      setCombatDungeonContext(null);
    }

    setBot(generatedBot);
    setCombatWinner(null);
    setPlayerChoices({ attack: null, defense: null });
    
    const timestamp = new Date().toLocaleTimeString();
    setCombatLogs([
      {
        id: 'start',
        timestamp,
        type: 'system',
        message: `Бой начался! Вы бросили вызов бойцу ${generatedBot.name} (${raceTemplate.title} ${classTemplate.title}) [ур. ${generatedBot.level}].`,
      }
    ]);

    setScreen('battle');
  };

  const useCombatPotion = async (type: 'hp' | 'mp') => {
    if (!player || !user) return;
    if (potionsUsed >= 3) {
      addLog('system', '⚠️ Вы не можете выпить более 3 зелий за один бой!');
      return;
    }

    const itemType = type === 'hp' ? 'potion_hp' : 'potion_mp';
    const inventory = [...(player.inventory || [])];
    const potionIndex = inventory.findIndex(item => item.type === itemType);

    if (potionIndex === -1) {
      addLog('system', `⚠️ У вас нет ${type === 'hp' ? 'Зелья здоровья' : 'Зелья маны'} в рюкзаке!`);
      return;
    }

    // Remove 1 potion
    inventory.splice(potionIndex, 1);

    let nextHp = player.currentHp;
    let nextMana = player.currentMana;

    if (type === 'hp') {
      nextHp = Math.min(player.maxHp, player.currentHp + 50);
      addLog('system', `🧪 Вы выпили Зелье здоровья и восстановили ${nextHp - player.currentHp} HP.`);
    } else {
      nextMana = Math.min(player.maxMana, player.currentMana + 50);
      addLog('system', `🧪 Вы выпили Зелье маны и восстановили ${nextMana - player.currentMana} MP.`);
    }

    const updatedPlayer: Character = {
      ...player,
      inventory,
      currentHp: nextHp,
      currentMana: nextMana
    };

    setPlayer(updatedPlayer);
    setPotionsUsed(prev => prev + 1);
    await db.saveCharacter(user.uid, updatedPlayer);
  };

  const useCombatScroll = async (type: 'atk' | 'def' | 'dodge' | 'crit') => {
    if (!player || !user) return;
    
    const itemTypeMap: Record<string, string> = {
      atk: 'scroll_atk',
      def: 'scroll_def',
      dodge: 'scroll_dodge',
      crit: 'scroll_crit'
    };
    
    const itemType = itemTypeMap[type];
    const inventory = [...(player.inventory || [])];
    const scrollIndex = inventory.findIndex(item => item.type === itemType);

    if (scrollIndex === -1) {
      addLog('system', `⚠️ У вас нет подходящего свитка в рюкзаке!`);
      return;
    }

    const scrollName = inventory[scrollIndex].name;
    inventory.splice(scrollIndex, 1);

    setActiveScrolls(prev => ({
      ...prev,
      [type]: true
    }));

    addLog('system', `📜 Вы прочитали свиток: "${scrollName}". Эффект активирован до конца поединка!`);

    const updatedPlayer: Character = {
      ...player,
      inventory
    };

    setPlayer(updatedPlayer);
    await db.saveCharacter(user.uid, updatedPlayer);
  };

  const surrenderCombat = async () => {
    if (!player || !bot || !user) return;

    // Retain current HP in combat when surrendering
    const nextPlayerHp = player.currentHp;
    const updatedPlayer: Character = {
      ...player,
      losses: player.losses + 1,
      currentHp: Math.max(1, nextPlayerHp)
    };

    setPlayer(updatedPlayer);
    await db.saveCharacter(user.uid, updatedPlayer);

    addLog('defeat', `🏳️ Вы сдались! Боец ${bot.name} одержал победу.`);
    setCombatWinner('bot');
  };

  const addLog = (type: LogEntryType, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setCombatLogs(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        timestamp,
        type,
        message,
      }
    ]);
  };

  const getEffectiveStat = (char: Character, statKey: 'strength' | 'agility' | 'endurance' | 'intellect') => {
    let val = char.stats[statKey];
    if (char.activeBuff && char.activeBuff.type === statKey && char.activeBuff.fightsLeft > 0) {
      val += char.activeBuff.value;
    }
    if (char.equipment) {
      Object.values(char.equipment).forEach((item) => {
        if (item && item.stats && item.stats[statKey]) {
          val += item.stats[statKey]!;
        }
      });
    }
    return val;
  };

  const submitTurn = async () => {
    if (!player || !bot || !playerChoices.attack || !playerChoices.defense || !user) return;

    // Generate Bot choices
    const zones: CombatZone[] = ['head', 'chest', 'stomach', 'legs'];
    const botChoices = {
      attack: zones[Math.floor(Math.random() * zones.length)],
      defense: zones[Math.floor(Math.random() * zones.length)],
    };

    const zoneNames: Record<CombatZone, string> = {
      head: 'голову',
      chest: 'грудь',
      stomach: 'живот',
      legs: 'ноги',
    };

    let nextPlayerHp = player.currentHp;
    let nextBotHp = bot.currentHp;

    // Mana Math: Mages spend 15 mana to cast spells, otherwise they hit with standard staff scaling on strength
    let pMana = player.currentMana;
    let bMana = bot.currentMana === undefined ? bot.stats.intellect * 10 : bot.currentMana;
    
    let isPlayerMageSpell = false;
    let isBotMageSpell = false;
    
    if (player.classType === 'mage') {
      if (pMana >= 15) {
        pMana -= 15;
        isPlayerMageSpell = true;
      }
    }
    
    if (bot.classType === 'mage') {
      if (bMana >= 15) {
        bMana -= 15;
        isBotMageSpell = true;
      }
    }

    // Resolve Player Attack -> Bot Defense
    const playerAttacksZone = playerChoices.attack;
    const botBlocksZone = botChoices.defense;
    let turnDmgDealt = 0;
    let turnDmgReceived = 0;
    let turnDmgBlocked = 0;

    if (playerAttacksZone === botBlocksZone) {
      addLog('block', `🛡️ ${player.name} атаковал в ${zoneNames[playerAttacksZone]}, но ${bot.name} заблокировал удар!`);
    } else {
      const botDodgeChance = getEffectiveStat(bot, 'agility') * 1.0;
      const isDodged = Math.random() * 100 < botDodgeChance;

      if (isDodged) {
        addLog('dodge', `💨 ${player.name} пытался ударить в ${zoneNames[playerAttacksZone]}, но ловкий ${bot.name} увернулся!`);
      } else {
        const playerAgility = getEffectiveStat(player, 'agility');
        // Scroll of Crit adds +15% crit chance
        const isCrit = Math.random() * 100 < (playerAgility * 1.5 + (activeScrolls.crit ? 15 : 0));
        const baseDamage = Math.floor(Math.random() * 5) + 5;
        const playerIntellect = getEffectiveStat(player, 'intellect');
        const playerStrength = getEffectiveStat(player, 'strength');
        
        let modifier = 0;
        if (player.classType === 'mage') {
          modifier = isPlayerMageSpell
            ? playerIntellect * 1.1
            : playerStrength * 0.6;
        } else if (player.classType === 'warrior') {
          modifier = playerStrength * 1.0;
        } else if (player.classType === 'archer') {
          modifier = playerAgility * 0.9 + playerStrength * 0.3;
        }
        
        let damage = Math.round(baseDamage + modifier);
        
        // Scroll of Attack adds +10 to final damage
        if (activeScrolls.atk) {
          damage += 10;
        }

        if (isCrit) damage *= 2;

        nextBotHp = Math.max(0, nextBotHp - damage);
        turnDmgDealt = damage;
        
        let logPrefix = '';
        if (player.classType === 'mage') {
          logPrefix = isPlayerMageSpell ? '🔮 [Заклинание] ' : '⚔️ [Посох - Мана пуста] ';
        } else if (player.classType === 'archer') {
          logPrefix = '🏹 [Выстрел] ';
        } else {
          logPrefix = '⚔️ [Удар] ';
        }

        if (isCrit) {
          addLog('crit', `💥 Критический удар! ${logPrefix}${player.name} нанес сокрушительный урон по ${bot.name} в ${zoneNames[playerAttacksZone]} на ${damage} урона!`);
        } else {
          addLog('hit', `${logPrefix}${player.name} ударил ${bot.name} в ${zoneNames[playerAttacksZone]} на ${damage} урона.`);
        }
      }
    }

    // Resolve Bot Attack -> Player Defense
    const botAttacksZone = botChoices.attack;
    const playerBlocksZone = playerChoices.defense;

    if (botAttacksZone === playerBlocksZone) {
      addLog('block', `🛡️ ${bot.name} атаковал в ${zoneNames[botAttacksZone]}, но вы заблокировали удар!`);
      // Compute potential damage for block stats
      const baseDamage = Math.floor(Math.random() * 5) + 5;
      const botAgility = getEffectiveStat(bot, 'agility');
      const botIntellect = getEffectiveStat(bot, 'intellect');
      const botStrength = getEffectiveStat(bot, 'strength');
      
      let modifier = 0;
      if (bot.classType === 'mage') {
        modifier = isBotMageSpell ? botIntellect * 1.1 : botStrength * 0.6;
      } else if (bot.classType === 'warrior') {
        modifier = botStrength * 1.0;
      } else if (bot.classType === 'archer') {
        modifier = botAgility * 0.9 + botStrength * 0.3;
      }
      
      let damage = Math.round(baseDamage + modifier);
      const isCrit = Math.random() * 100 < (botAgility * 1.5);
      
      if (activeScrolls.def) {
        damage = Math.max(0, damage - 5);
      }
      if (isCrit) damage *= 2;
      
      turnDmgBlocked = damage;
    } else {
      let playerDodgeChance = getEffectiveStat(player, 'agility') * 1.0;
      // Scroll of Dodge adds +15% dodge rate
      if (activeScrolls.dodge) {
        playerDodgeChance += 15;
      }
      const isDodged = Math.random() * 100 < playerDodgeChance;

      if (isDodged) {
        addLog('dodge', `💨 ${bot.name} целился в ${zoneNames[botAttacksZone]}, но вы ловко увернулись!`);
      } else {
        const botAgility = getEffectiveStat(bot, 'agility');
        const isCrit = Math.random() * 100 < (botAgility * 1.5);
        const baseDamage = Math.floor(Math.random() * 5) + 5;
        const botIntellect = getEffectiveStat(bot, 'intellect');
        const botStrength = getEffectiveStat(bot, 'strength');
        
        let modifier = 0;
        if (bot.classType === 'mage') {
          modifier = isBotMageSpell
            ? botIntellect * 1.1
            : botStrength * 0.6;
        } else if (bot.classType === 'warrior') {
          modifier = botStrength * 1.0;
        } else if (bot.classType === 'archer') {
          modifier = botAgility * 0.9 + botStrength * 0.3;
        }
        
        let damage = Math.round(baseDamage + modifier);
        const rawDmg = damage;
        
        // Scroll of Defense reduces damage taken by 5
        if (activeScrolls.def) {
          damage = Math.max(0, damage - 5);
          const scrollMitigated = (rawDmg - damage) * (isCrit ? 2 : 1);
          turnDmgBlocked += scrollMitigated;
        }

        if (isCrit) damage *= 2;

        nextPlayerHp = Math.max(0, nextPlayerHp - damage);
        turnDmgReceived = damage;

        let logPrefix = '';
        if (bot.classType === 'mage') {
          logPrefix = isBotMageSpell ? '🔮 [Заклинание] ' : '⚔️ [Посох - Мана пуста] ';
        } else if (bot.classType === 'archer') {
          logPrefix = '🏹 [Выстрел] ';
        } else {
          logPrefix = '⚔️ [Удар] ';
        }

        if (isCrit) {
          addLog('crit', `🩸 Критический урон! ${logPrefix}${bot.name} пробил вашу оборону в ${zoneNames[botAttacksZone]} на ${damage} урона!`);
        } else {
          addLog('hit', `${logPrefix}${bot.name} нанес вам удар в ${zoneNames[botAttacksZone]} на ${damage} урона.`);
        }
      }
    }

    // Accumulate combat stats
    setCombatSummary(prev => ({
      ...prev,
      damageDealt: prev.damageDealt + turnDmgDealt,
      damageReceived: prev.damageReceived + turnDmgReceived,
      damageBlocked: prev.damageBlocked + turnDmgBlocked,
      lastTurnDamageDealt: turnDmgDealt,
      lastTurnDamageReceived: turnDmgReceived
    }));

    // Prepare character statistics update values
    let expReward = 0;
    let goldReward = 0;
    let winnerOutcome: 'player' | 'bot' | 'draw' | null = null;
    let addWin = 0;
    let addLoss = 0;

    if (nextPlayerHp <= 0 && nextBotHp <= 0) {
      winnerOutcome = 'draw';
      expReward = 10;
      goldReward = 5;
    } else if (nextPlayerHp <= 0) {
      winnerOutcome = 'bot';
      expReward = combatDungeonContext ? 10 : 5;
      goldReward = combatDungeonContext ? 5 : 2;
      addLoss = 1;
    } else if (nextBotHp <= 0) {
      winnerOutcome = 'player';
      if (combatDungeonContext) {
        if (combatDungeonContext.isBoss) {
          expReward = 120;
          goldReward = 60;
        } else {
          expReward = 40;
          goldReward = 20;
        }
      } else {
        expReward = 20;
        goldReward = 10;
      }
      addWin = 1;
    }

    // Set HP status temporarily during combat
    setBot(prev => prev ? { ...prev, currentHp: nextBotHp, currentMana: bMana } : null);

    if (winnerOutcome) {
      setCombatWinner(winnerOutcome);
      setCombatSummary(prev => ({
        ...prev,
        goldReward,
        expReward
      }));
      
      // Calculate levels and stats
      let nextLevel = player.level;
      let nextExp = player.experience + expReward;
      const nextStats = { ...player.stats };
      const levelUpNotifications: string[] = [];

      // Recursive level up check
      while (nextExp >= nextLevel * 100) {
        nextExp -= nextLevel * 100;
        nextLevel += 1;
        
        // Add +1 to all stats
        nextStats.strength += 1;
        nextStats.agility += 1;
        nextStats.endurance += 1;
        nextStats.intellect += 1;

        levelUpNotifications.push(`🎉 Вы получили новый уровень: ${nextLevel}! Характеристики возросли на +1!`);
      }

      const nextMaxHp = nextStats.endurance * 10;
      const nextMaxMana = nextStats.intellect * 10;

      // Decrement active buff fights left if present
      let nextBuff = player.activeBuff;
      if (nextBuff && nextBuff.fightsLeft > 0) {
        const nextFights = nextBuff.fightsLeft - 1;
        if (nextFights <= 0) {
          nextBuff = undefined;
        } else {
          nextBuff = { ...nextBuff, fightsLeft: nextFights };
        }
      }

      // Restores to full health/mana only on level up, otherwise retains current surviving HP (or 1 HP if dead)
      const isLevelUp = nextLevel > player.level;
      const finalHp = isLevelUp ? nextMaxHp : Math.max(1, nextPlayerHp);
      const finalMana = isLevelUp ? nextMaxMana : pMana;

      const updatedPlayer: Character = {
        ...player,
        level: nextLevel,
        experience: nextExp,
        gold: player.gold + goldReward,
        stats: nextStats,
        maxHp: nextMaxHp,
        currentHp: finalHp,
        maxMana: nextMaxMana,
        currentMana: finalMana,
        wins: player.wins + addWin,
        losses: player.losses + addLoss,
        activeBuff: nextBuff,
      };

      setPlayer(updatedPlayer);
      await db.saveCharacter(user.uid, updatedPlayer);

      // Log results
      if (winnerOutcome === 'draw') {
        addLog('system', `⌛ Ничья! Оба бойца без сил рухнули на арене. Награда: +${expReward} опыта, +${goldReward} золота.`);
      } else if (winnerOutcome === 'bot') {
        addLog('defeat', `💀 Поражение! Вы проиграли бойцу ${bot.name}. Награда: +${expReward} опыта, +${goldReward} золота.`);
      } else {
        addLog('victory', `🏆 Победа! Вы сокрушили противника ${bot.name}! Награда: +${expReward} опыта, +${goldReward} золота.`);
      }

      // Output level up logs if any
      levelUpNotifications.forEach(msg => addLog('system', msg));

    } else {
      setPlayer(prev => prev ? { ...prev, currentHp: nextPlayerHp, currentMana: pMana } : null);
    }

    setPlayerChoices({ attack: null, defense: null });
  };

  const exitCombat = () => {
    // Retain current health and mana levels (no auto healing!)
    setBot(null);
    setScreen('hub');

    if (combatDungeonContext) {
      const coord = combatDungeonContext.monsterCoord;
      if (combatWinner === 'player') {
        setDungeonState((prev: any) => {
          if (!prev) return prev;
          const defeated = [...(prev.defeatedMonsters || [])];
          if (!defeated.includes(coord)) {
            defeated.push(coord);
          }
          const time = new Date().toLocaleTimeString();
          const log = [...(prev.log || [])];
          log.push(`[${time}] Вы победили монстра ${bot?.name || 'Враг'}!`);
          if (combatDungeonContext.isBoss) {
            log.push(`[${time}] 🎉 Властелин этого подземелья повержен! Проход свободен.`);
          }
          return {
            ...prev,
            defeatedMonsters: defeated,
            log
          };
        });
      } else if (combatWinner === 'bot') {
        setDungeonState((prev: any) => {
          if (!prev) return prev;
          const time = new Date().toLocaleTimeString();
          const log = [...(prev.log || [])];
          log.push(`[${time}] 💀 Вы проиграли бой с ${bot?.name || 'Враг'}. Восстановите силы и попробуйте снова.`);
          return {
            ...prev,
            log
          };
        });
      }
      setActiveSubLoc('dungeon');
      setCombatDungeonContext(null);
    }
  };

  const updateCharacter = async (updatedPlayer: Character) => {
    if (!user) return;
    setPlayer(updatedPlayer);
    await db.saveCharacter(user.uid, updatedPlayer);
  };

  return {
    screen,
    setScreen,
    player,
    bot,
    combatLogs,
    playerChoices,
    setPlayerChoices,
    combatWinner,
    authLoading,
    authError,
    setAuthError,
    login: handleLogin,
    register: handleRegister,
    logout,
    selectCharacterClass,
    startCombat,
    submitTurn,
    exitCombat,
    updateCharacter,
    useCombatPotion,
    useCombatScroll,
    surrenderCombat,
    potionsUsed,
    activeScrolls,
    combatSummary,
    activeSubLoc,
    setActiveSubLoc,
    dungeonState,
    setDungeonState
  };
};

