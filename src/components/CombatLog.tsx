import React, { useRef, useEffect } from 'react';
import type { CombatLogEntry } from '../types';
import { Terminal, ScrollText } from 'lucide-react';

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
        <span key={keyIndex++} className="text-rose-500 font-extrabold">
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
      let dmgClass = 'text-slate-200 font-bold';
      if (isPlayerDealt) {
        if (type === 'crit') {
          dmgClass = 'text-purple-400 text-[15px] md:text-[17px] font-black uppercase tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]';
        } else {
          dmgClass = 'text-white font-extrabold text-[13px] md:text-[15px]';
        }
      } else if (isPlayerReceived) {
        if (type === 'crit') {
          dmgClass = 'text-red-500 font-black text-[15px] md:text-[17px] uppercase tracking-wide drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]';
        } else {
          dmgClass = 'text-orange-400 font-extrabold text-[13px] md:text-[15px]';
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
        return 'border-l-2 border-purple-500/50 pl-2 bg-purple-950/5 py-1.5 my-1';
      case 'hit':
        return 'text-slate-300';
      case 'block':
        return 'text-slate-500 italic pl-2 border-l border-obsidian-800';
      case 'dodge':
        return 'text-sky-400/90 italic pl-2 border-l border-sky-900/30';
      case 'system':
        return 'text-gold-400 font-semibold border-l-2 border-gold-500/50 pl-2 bg-gold-950/10 py-1.5 my-1';
      case 'victory':
        return 'text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 bg-emerald-950/20 py-2.5 my-2 text-base md:text-lg';
      case 'defeat':
        return 'text-rose-500 font-bold border-l-2 border-rose-600 pl-2 bg-rose-950/20 py-2.5 my-2 text-base md:text-lg';
      default:
        return 'text-slate-400';
    }
  };

  const getLogFontSizeAndOpacity = (index: number) => {
    switch (index) {
      case 0:
        return 'text-base md:text-lg font-bold opacity-100 border-b border-obsidian-800/80 pb-2.5 mb-2.5';
      case 1:
        return 'text-[13px] md:text-[15px] font-semibold opacity-90';
      case 2:
        return 'text-[12px] md:text-[14px] opacity-75';
      case 3:
        return 'text-[11px] md:text-[13px] opacity-60';
      default:
        return 'text-[10px] md:text-[12px] opacity-40';
    }
  };

  // Reverse sequence so new logs appear at the top
  const reversedLogs = [...logs].reverse();

  return (
    <div className="gothic-panel p-6 flex flex-col h-full bg-obsidian-950/90 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-radial-at-t from-obsidian-900 to-obsidian-950 pointer-events-none opacity-40" />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-obsidian-800 pb-3 mb-4 relative z-10">
        <ScrollText className="w-5.5 h-5.5 text-gold-500" />
        <h4 className="text-base font-semibold uppercase tracking-wider text-gold-400 font-gothic flex-1">Летопись Боя (Лог)</h4>
        <Terminal className="w-4.5 h-4.5 text-slate-600" />
      </div>

      {/* Scrollable logs area */}
      <div
        ref={logContainerRef}
        className="flex-1 overflow-y-auto pr-1 space-y-3.5 rpg-scrollbar relative z-10 max-h-[350px] md:max-h-[450px]"
      >
        {logs.length === 0 ? (
          <div className="text-center text-slate-600 text-sm py-8 italic">Ожидание начала поединка...</div>
        ) : (
          reversedLogs.map((log, index) => (
            <div
              key={log.id}
              className={`font-mono transition-all duration-300 leading-relaxed ${getLogStyle(log.type)} ${getLogFontSizeAndOpacity(index)}`}
            >
              <span className="text-[10px] text-slate-650 mr-2">[{log.timestamp}]</span>
              <span>{formatLogMessage(log.message, log.type, playerName, botName)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
