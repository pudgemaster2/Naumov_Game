import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isBot: boolean;
}

interface GeneralChatProps {
  playerName: string;
}



const RETRO_SMILEYS = [
  { code: ':-)', emoji: '🙂', label: 'Улыбка' },
  { code: ':-D', emoji: '😀', label: 'Смех' },
  { code: ';-)', emoji: '😉', label: 'Подмигивание' },
  { code: ':-P', emoji: '😛', label: 'Язык' },
  { code: ':-*', emoji: '😘', label: 'Поцелуй' },
  { code: ':-O', emoji: '😮', label: 'Удивление' },
  { code: ':-(', emoji: '🙁', label: 'Грусть' },
  { code: ':-@', emoji: '😡', label: 'Злость' },
  { code: ':-[', emoji: '😳', label: 'Смущение' },
  { code: '[:-]', emoji: '🤖', label: 'Робот' },
  { code: '8-)', emoji: '😎', label: 'Крутой' },
  { code: ':-!', emoji: '🤮', label: 'Тошнота' },
  { code: '*THUMBS UP*', emoji: '👍', label: 'Класс' },
  { code: '*DRINK*', emoji: '🍺', label: 'Пиво' },
  { code: '*DANCE*', emoji: '🕺', label: 'Танец' },
];

const parseRetroSmileys = (text: string) => {
  const smileysMap: Record<string, string> = {
    ':-)': '🙂',
    ':-D': '😀',
    ';-)': '😉',
    ':-P': '😛',
    ':-*': '😘',
    ':-O': '😮',
    ':-(': '🙁',
    ':-@': '😡',
    ':-[': '😳',
    '[:-]': '🤖',
    '8-)': '😎',
    ':-!': '🤮',
    '*THUMBS UP*': '👍',
    '*DRINK*': '🍺',
    '*DANCE*': '🕺',
  };

  // Escape special regex chars
  const keys = Object.keys(smileysMap).map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${keys.join('|')})`, 'g');

  if (!regex.test(text)) return <span>{text}</span>;

  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (smileysMap[part]) {
          let animClass = "animate-bounce";
          if (part === '*DANCE*') animClass = "animate-pulse origin-center rotate-6 inline-block";
          if (part === ':-@') animClass = "inline-block animate-pulse text-red-500 scale-110";
          if (part === ':-!') animClass = "inline-block -skew-x-6";
          if (part === '*DRINK*') animClass = "inline-block origin-bottom hover:rotate-12 transition-transform duration-100";
          return (
            <span 
              key={index} 
              className={`inline-block ${animClass} mx-0.5 text-[15px] select-none hover:scale-125 transition-transform cursor-help`} 
              title={part}
            >
              {smileysMap[part]}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

export const GeneralChat: React.FC<GeneralChatProps> = ({ playerName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'Система',
      text: 'Добро пожаловать в городской чат Цитадели! Общайтесь, торгуйте и вызывайте на поединки! :-)',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBot: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `player-${Math.random().toString(36).substring(2, 9)}`,
      sender: playerName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBot: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="gothic-panel flex flex-col h-[600px] lg:h-[700px] w-full bg-obsidian-900/90 rounded-lg overflow-hidden border-gold-900/30">
      {/* Chat Header */}
      <div className="bg-obsidian-950 border-b border-gold-900/30 p-4.5 flex items-center gap-2.5 select-none">
        <MessageSquare className="w-5 h-5 text-gold-500" />
        <h4 className="text-sm font-bold font-gothic tracking-widest text-gold-400 uppercase">Чат города</h4>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-auto" title="Подключено к чату" />
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4.5 space-y-4 font-sans text-sm rpg-scrollbar bg-obsidian-950/40">
        {messages.map((msg) => {
          const isSystem = msg.sender === 'Система';
          const isSelf = msg.sender === playerName;
          return (
            <div key={msg.id} className="animate-fade-in break-words leading-relaxed">
              <span className="text-xs text-slate-500 font-mono mr-2">[{msg.timestamp}]</span>
              {isSystem ? (
                <span className="text-amber-500/80 font-bold">{msg.sender}: </span>
              ) : isSelf ? (
                <span className="text-gold-400 font-bold hover:underline cursor-pointer">{msg.sender}: </span>
              ) : (
                <span className="text-sky-400 font-semibold hover:underline cursor-pointer">{msg.sender}: </span>
              )}
              <span className={isSystem ? 'text-amber-500/70 italic' : 'text-slate-300'}>
                {parseRetroSmileys(msg.text)}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Smiley Picker Bar */}
      <div className="bg-obsidian-950/80 border-t border-obsidian-850 p-2.5 px-4 flex gap-2 overflow-x-auto select-none rpg-scrollbar items-center">
        <span className="text-xs font-mono text-slate-500 uppercase mr-2 flex-shrink-0 font-semibold">Смайлы:</span>
        {RETRO_SMILEYS.map((s) => (
          <button
            key={s.code}
            type="button"
            onClick={() => setInputText(prev => prev + ' ' + s.code + ' ')}
            className="text-lg hover:scale-125 hover:bg-obsidian-900 border border-transparent hover:border-gold-900/20 p-0.5 px-1.5 rounded transition-all cursor-pointer flex-shrink-0 select-none"
            title={`${s.label} (${s.code})`}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-obsidian-950 border-t border-obsidian-800 p-2.5 flex gap-2.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Введите сообщение в чат..."
          className="flex-1 gothic-input px-4 py-2.5 text-sm rounded"
          maxLength={100}
        />
        <button
          type="submit"
          className="gothic-btn p-3 rounded text-obsidian-950 font-bold transition-all duration-200"
          title="Отправить сообщение"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};
