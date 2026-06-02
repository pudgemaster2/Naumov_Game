import React, { useRef, useEffect } from 'react';
import type { CombatLogEntry } from '../types';
import { Swords, Terminal } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
  playerName: string;
  botName: string;
}

export const formatLogMessage = (
  message: string,
  type: string,
  playerName: string,
  botName: string
) => {
  if (!playerName || !botName) return <span>{message}</span>;

  // Identify who is dealing and receiving damage to color values correctly
  const isPlayerDealt = message.includes(playerName) && (type === 'hit' || type === 'crit') && !message.includes('нанес вам') && !message.includes('пробил вашу');
  const isPlayerReceived = (message.includes(botName) || message.includes('нанес вам') || message.includes('пробил вашу')) && (type === 'hit' || type === 'crit');

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedPlayer = escapeRegExp(playerName);
  const escapedBot = escapeRegExp(botName);

  // Match playerName, botName, personal pronouns (вы, вам, вашу, вас) and damage metrics
  const regexPattern = new RegExp(
    `(${escapedPlayer})|(${escapedBot})|(\\bвы\\b|\\bвам\\b|\\bвашу\\b|\\bвас\\b)|(\\d+\\s+урона|\\d+)`,
    'gi'
  );

  const parts = message.split(regexPattern);
  let keyIndex = 0;
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < parts.length) {
    const text = parts[i];
    if (text === undefined || text === '') {
      i++;
      continue;
    }

    const lowerText = text.toLowerCase();

    // Player Name
    if (text === playerName || lowerText === playerName.toLowerCase()) {
      elements.push(
        <span key={keyIndex++} className="text-emerald-400 font-extrabold">
          {text}
        </span>
      );
    }
    // Bot/Enemy Name
    else if (text === botName || lowerText === botName.toLowerCase()) {
      elements.push(
        <span key={keyIndex++} className="text-rose-400 font-extrabold">
          {text}
        </span>
      );
    }
    // Player Pronouns
    else if (['вы', 'вам', 'вашу', 'вас'].includes(lowerText)) {
      elements.push(
        <span key={keyIndex++} className="text-emerald-400 font-bold">
          {text}
        </span>
      );
    }
    // Damage numbers
    else if (/^\d+/.test(text)) {
      let dmgClass = 'text-slate-100 font-bold';
      if (isPlayerDealt) {
        if (type === 'crit') {
          dmgClass = 'text-purple-400 text-[14px] md:text-[16px] font-black uppercase tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]';
        } else {
          dmgClass = 'text-emerald-300 font-extrabold text-[13px] md:text-[14px]';
        }
      } else if (isPlayerReceived) {
        if (type === 'crit') {
          dmgClass = 'text-rose-500 font-black text-[14px] md:text-[16px] uppercase tracking-wide drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]';
        } else {
          dmgClass = 'text-rose-455 font-extrabold text-[13px] md:text-[14px]';
        }
      }
      elements.push(
        <span key={keyIndex++} className={dmgClass}>
          {text}
        </span>
      );
    }
    // Normal Text
    else {
      elements.push(<span key={keyIndex++}>{text}</span>);
    }
    i++;
  }

  return <>{elements}</>;
};

export const CombatLog: React.FC<CombatLogProps> = ({ logs, playerName, botName }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll back to top when a new event arrives (since newest is on top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'crit':
        return 'border-l-2 border-purple-500/50 pl-2 bg-purple-950/10 py-1 my-1';
      case 'hit':
        return 'text-slate-300 pl-2 border-l border-slate-800';
      case 'block':
        return 'text-slate-400 italic pl-2 border-l border-slate-800';
      case 'dodge':
        return 'text-sky-350 italic pl-2 border-l border-sky-900/40';
      case 'system':
        return 'text-amber-400 font-semibold border-l-2 border-amber-500/50 pl-2 bg-amber-950/20 py-1 my-1';
      case 'victory':
        return 'text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 bg-emerald-950/20 py-2 my-2 text-sm md:text-base';
      case 'defeat':
        return 'text-rose-400 font-bold border-l-2 border-rose-500 pl-2 bg-rose-950/20 py-2 my-2 text-sm md:text-base';
      default:
        return 'text-slate-400';
    }
  };

  const getLogFontSizeAndOpacity = (index: number) => {
    const turnIndex = Math.floor(index / 2);
    switch (turnIndex) {
      case 0:
        return 'text-sm md:text-base font-bold opacity-100 border-b border-slate-800/40 pb-2 mb-2';
      case 1:
        return 'text-[12px] md:text-[14px] font-semibold opacity-85';
      case 2:
        return 'text-[11px] md:text-[13px] opacity-60';
      default:
        return 'text-[10px] md:text-[12px] opacity-35';
    }
  };

  // Reverse sequence so new logs appear at the top
  const reversedLogs = [...logs].reverse();

  return (
    <div className="gothic-panel p-5 flex flex-col h-full bg-slate-900 border border-slate-750/80 rounded-lg relative overflow-hidden shadow-xl">
      {/* Background dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 to-slate-900/40 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-850 pb-3 mb-4 relative z-10">
        <Swords className="w-5 h-5 text-gold-555" />
        <h4 className="text-sm font-semibold uppercase tracking-widest text-gold-400 font-gothic flex-1">Бой</h4>
        <Terminal className="w-4 h-4 text-slate-500" />
      </div>

      {/* Scrollable logs area */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3 rpg-scrollbar relative z-10 max-h-[350px] md:max-h-[450px]"
      >
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8 italic font-mono">Ожидание начала поединка...</div>
        ) : (
          reversedLogs.map((log, index) => (
            <div
              key={log.id}
              className={`font-mono transition-all duration-300 leading-relaxed ${getLogStyle(log.type)} ${getLogFontSizeAndOpacity(index)}`}
            >
              <span className="text-[10px] text-slate-500 mr-2 font-mono">[{log.timestamp}]</span>
              <span>{formatLogMessage(log.message, log.type, playerName, botName)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
