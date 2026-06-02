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
        <span key={keyIndex++} className="text-emerald-700 font-extrabold">
          {text}
        </span>
      );
    }
    // Bot/Enemy Name
    else if (text === botName || lowerText === botName.toLowerCase()) {
      elements.push(
        <span key={keyIndex++} className="text-rose-700 font-extrabold">
          {text}
        </span>
      );
    }
    // Player Pronouns
    else if (['вы', 'вам', 'вашу', 'вас'].includes(lowerText)) {
      elements.push(
        <span key={keyIndex++} className="text-emerald-700 font-bold">
          {text}
        </span>
      );
    }
    // Damage numbers
    else if (/^\d+/.test(text)) {
      let dmgClass = 'text-slate-900 font-bold';
      if (isPlayerDealt) {
        if (type === 'crit') {
          dmgClass = 'text-purple-700 text-[14px] md:text-[16px] font-black uppercase tracking-wide';
        } else {
          dmgClass = 'text-emerald-800 font-extrabold text-[13px] md:text-[14px]';
        }
      } else if (isPlayerReceived) {
        if (type === 'crit') {
          dmgClass = 'text-red-700 font-black text-[14px] md:text-[16px] uppercase tracking-wide';
        } else {
          dmgClass = 'text-rose-800 font-extrabold text-[13px] md:text-[14px]';
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
        return 'border-l-2 border-purple-500 pl-2 bg-purple-50/70 py-1 my-1 text-slate-800';
      case 'hit':
        return 'text-slate-800 pl-2 border-l border-slate-300';
      case 'block':
        return 'text-slate-500 italic pl-2 border-l border-slate-300';
      case 'dodge':
        return 'text-sky-700 italic pl-2 border-l border-sky-300';
      case 'system':
        return 'text-amber-900 font-semibold border-l-2 border-amber-500/50 pl-2 bg-amber-50 py-1 my-1';
      case 'victory':
        return 'text-emerald-800 font-bold border-l-2 border-emerald-500 pl-2 bg-emerald-50 py-2 my-2 text-sm md:text-base';
      case 'defeat':
        return 'text-rose-800 font-bold border-l-2 border-rose-500 pl-2 bg-rose-50 py-2 my-2 text-sm md:text-base';
      default:
        return 'text-slate-700';
    }
  };

  const getLogFontSizeAndOpacity = (index: number) => {
    const turnIndex = Math.floor(index / 2);
    switch (turnIndex) {
      case 0:
        return 'text-sm md:text-base font-bold opacity-100 border-b border-slate-200 pb-2 mb-2';
      case 1:
        return 'text-[12px] md:text-[14px] font-semibold opacity-90';
      case 2:
        return 'text-[11px] md:text-[13px] opacity-75';
      default:
        return 'text-[10px] md:text-[12px] opacity-55';
    }
  };

  // Reverse sequence so new logs appear at the top
  const reversedLogs = [...logs].reverse();

  return (
    <div className="gothic-panel p-5 flex flex-col h-full bg-slate-100/90 border border-slate-300 rounded-lg relative overflow-hidden shadow-lg text-slate-800">
      {/* Background light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-300 pb-3 mb-4 relative z-10">
        <Swords className="w-5 h-5 text-amber-700" />
        <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-900 font-gothic flex-1">Бой</h4>
        <Terminal className="w-4 h-4 text-slate-400" />
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
              <span className="text-[10px] text-slate-400 mr-2 font-mono">[{log.timestamp}]</span>
              <span>{formatLogMessage(log.message, log.type, playerName, botName)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
