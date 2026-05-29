import React, { useEffect, useRef } from 'react';
import type { CombatLogEntry } from '../types';
import { Terminal, ScrollText } from 'lucide-react';

interface CombatLogProps {
  logs: CombatLogEntry[];
}

export const CombatLog: React.FC<CombatLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of log when entry is added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogStyle = (type: string) => {
    switch (type) {
      case 'crit':
        return 'text-rose-400 font-bold border-l-2 border-rose-500 pl-2 bg-rose-950/10 py-1 my-1 shadow-[inset_2px_0_0_rgba(244,63,94,0.5)]';
      case 'hit':
        return 'text-slate-200';
      case 'block':
        return 'text-slate-500 italic';
      case 'dodge':
        return 'text-sky-400 italic';
      case 'system':
        return 'text-gold-400 font-semibold border-l-2 border-gold-500 pl-2 bg-gold-950/10 py-1 my-1';
      case 'victory':
        return 'text-emerald-400 font-bold border-l-2 border-emerald-500 pl-2 bg-emerald-950/20 py-2 my-2 text-base';
      case 'defeat':
        return 'text-rose-500 font-bold border-l-2 border-rose-600 pl-2 bg-rose-950/20 py-2 my-2 text-base';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="gothic-panel p-4 flex flex-col h-full bg-obsidian-950/90 relative overflow-hidden">
      
      {/* Background overlay */}
      <div className="absolute inset-0 bg-radial-at-t from-obsidian-900 to-obsidian-950 pointer-events-none opacity-40" />

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-obsidian-800 pb-3 mb-3 relative z-10">
        <ScrollText className="w-5 h-5 text-gold-500" />
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gold-400 font-gothic flex-1">Летопись Боя (Лог)</h4>
        <Terminal className="w-4 h-4 text-slate-600" />
      </div>

      {/* Scrollable logs area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 rpg-scrollbar relative z-10 max-h-[220px] md:max-h-[300px]">
        {logs.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8 italic">Ожидание начала поединка...</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`text-xs font-mono transition-all duration-300 leading-relaxed ${getLogStyle(log.type)}`}
            >
              <span className="text-[10px] text-slate-600 mr-2">[{log.timestamp}]</span>
              <span>{log.message}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};
