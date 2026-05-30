import { useState, useEffect } from 'react';
import { CLASS_TEMPLATES } from '../types';
import type { 
  Character, 
  CharacterClass, 
  CombatZone, 
  CombatLogEntry, 
  ScreenState, 
  LogEntryType 
} from '../types';
import { auth } from '../services/auth';
import type { UserSession } from '../services/auth';
import { db } from '../services/db';

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

  // Subscribe to auth state changes
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = auth.onAuthStateChange(async (session) => {
      setUser(session);
      
      if (session) {
        // Fetch character for user
        const character = await db.loadCharacter(session.uid);
        if (character) {
          setPlayer(character);
          setScreen('hub');
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

  const selectCharacterClass = async (classType: CharacterClass, name: string) => {
    if (!user) return;

    const template = CLASS_TEMPLATES[classType];
    const maxHp = template.stats.endurance * 10;
    
    const newPlayer: Character = {
      name: name.trim() || `Игрок_${Math.floor(Math.random() * 1000)}`,
      classType,
      level: 1,
      experience: 0,
      gold: 0,
      stats: { ...template.stats },
      currentHp: maxHp,
      maxHp: maxHp,
      wins: 0,
      losses: 0,
    };
    
    setPlayer(newPlayer);
    await db.saveCharacter(user.uid, newPlayer);
    setScreen('hub');
  };

  const startCombat = () => {
    if (!player) return;

    // Reset player HP to max for the beginning of combat
    const activePlayer = { ...player, currentHp: player.maxHp };
    setPlayer(activePlayer);

    // Generate random bot class
    const classes: CharacterClass[] = ['barbarian', 'mage', 'archer'];
    const botClass = classes[Math.floor(Math.random() * classes.length)];
    const template = CLASS_TEMPLATES[botClass];
    
    const botNames = ['Грязный Гарри', 'Безумный Джо', 'Свирепый Орк', 'Теневой Убийца', 'Старый Гэндальф', 'Адепт Хаоса'];
    const botName = botNames[Math.floor(Math.random() * botNames.length)];

    // Bot stats match the level of the player slightly
    const levelDiff = player.level - 1;
    const adjustedStats = {
      strength: template.stats.strength + levelDiff,
      agility: template.stats.agility + levelDiff,
      endurance: template.stats.endurance + levelDiff,
      intellect: template.stats.intellect + levelDiff,
    };
    const adjustedMaxHp = adjustedStats.endurance * 10;

    const generatedBot: Character = {
      name: botName,
      classType: botClass,
      level: player.level,
      experience: 0,
      gold: 0,
      stats: adjustedStats,
      currentHp: adjustedMaxHp,
      maxHp: adjustedMaxHp,
      wins: 0,
      losses: 0,
    };

    setBot(generatedBot);
    setCombatWinner(null);
    setPlayerChoices({ attack: null, defense: null });
    
    const timestamp = new Date().toLocaleTimeString();
    setCombatLogs([
      {
        id: 'start',
        timestamp,
        type: 'system',
        message: `Бой начался! Вы бросили вызов бойцу ${generatedBot.name} (${template.title}) [ур. ${generatedBot.level}].`,
      }
    ]);

    setScreen('battle');
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

    // Resolve Player Attack -> Bot Defense
    const playerAttacksZone = playerChoices.attack;
    const botBlocksZone = botChoices.defense;

    if (playerAttacksZone === botBlocksZone) {
      addLog('block', `🛡️ ${player.name} атаковал в ${zoneNames[playerAttacksZone]}, но ${bot.name} заблокировал удар!`);
    } else {
      const botDodgeChance = getEffectiveStat(bot, 'agility') * 1.0;
      const isDodged = Math.random() * 100 < botDodgeChance;

      if (isDodged) {
        addLog('dodge', `💨 ${player.name} пытался ударить в ${zoneNames[playerAttacksZone]}, но ловкий ${bot.name} увернулся!`);
      } else {
        const playerAgility = getEffectiveStat(player, 'agility');
        const isCrit = Math.random() * 100 < (playerAgility * 1.5);
        const baseDamage = Math.floor(Math.random() * 5) + 5;
        const playerIntellect = getEffectiveStat(player, 'intellect');
        const playerStrength = getEffectiveStat(player, 'strength');
        const modifier = player.classType === 'mage' 
          ? playerIntellect * 1.0 
          : playerStrength * 0.8;
        
        let damage = Math.round(baseDamage + modifier);
        if (isCrit) damage *= 2;

        nextBotHp = Math.max(0, nextBotHp - damage);
        
        if (isCrit) {
          addLog('crit', `💥 Критический удар! ${player.name} нанес сокрушительный удар по ${bot.name} в ${zoneNames[playerAttacksZone]} на ${damage} урона!`);
        } else {
          addLog('hit', `⚔️ ${player.name} ударил ${bot.name} в ${zoneNames[playerAttacksZone]} на ${damage} урона.`);
        }
      }
    }

    // Resolve Bot Attack -> Player Defense
    const botAttacksZone = botChoices.attack;
    const playerBlocksZone = playerChoices.defense;

    if (botAttacksZone === playerBlocksZone) {
      addLog('block', `🛡️ ${bot.name} атаковал в ${zoneNames[botAttacksZone]}, но вы заблокировали удар!`);
    } else {
      const playerDodgeChance = getEffectiveStat(player, 'agility') * 1.0;
      const isDodged = Math.random() * 100 < playerDodgeChance;

      if (isDodged) {
        addLog('dodge', `💨 ${bot.name} целился в ${zoneNames[botAttacksZone]}, но вы ловко увернулись!`);
      } else {
        const botAgility = getEffectiveStat(bot, 'agility');
        const isCrit = Math.random() * 100 < (botAgility * 1.5);
        const baseDamage = Math.floor(Math.random() * 5) + 5;
        const botIntellect = getEffectiveStat(bot, 'intellect');
        const botStrength = getEffectiveStat(bot, 'strength');
        const modifier = bot.classType === 'mage' 
          ? botIntellect * 1.0 
          : botStrength * 0.8;
        
        let damage = Math.round(baseDamage + modifier);
        if (isCrit) damage *= 2;

        nextPlayerHp = Math.max(0, nextPlayerHp - damage);

        if (isCrit) {
          addLog('crit', `🩸 Критический урон! ${bot.name} пробил вашу оборону в ${zoneNames[botAttacksZone]} на ${damage} урона!`);
        } else {
          addLog('hit', `⚔️ ${bot.name} нанес вам удар в ${zoneNames[botAttacksZone]} на ${damage} урона.`);
        }
      }
    }

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
      expReward = 5;
      goldReward = 2;
      addLoss = 1;
    } else if (nextBotHp <= 0) {
      winnerOutcome = 'player';
      expReward = 20;
      goldReward = 10;
      addWin = 1;
    }

    // Set HP status temporarily during combat
    setBot(prev => prev ? { ...prev, currentHp: nextBotHp } : null);

    if (winnerOutcome) {
      setCombatWinner(winnerOutcome);
      
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

      const updatedPlayer: Character = {
        ...player,
        level: nextLevel,
        experience: nextExp,
        gold: player.gold + goldReward,
        stats: nextStats,
        maxHp: nextMaxHp,
        currentHp: nextMaxHp, // Heals player to full
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
      setPlayer(prev => prev ? { ...prev, currentHp: nextPlayerHp } : null);
    }

    setPlayerChoices({ attack: null, defense: null });
  };

  const exitCombat = () => {
    if (player) {
      setPlayer({
        ...player,
        currentHp: player.maxHp
      });
    }
    setBot(null);
    setScreen('hub');
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
  };
};
