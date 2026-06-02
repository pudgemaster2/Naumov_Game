import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Smile } from 'lucide-react';

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
  { code: ':-)', url: 'https://www.kolobok.us/smiles/standart/smile3.gif', label: 'Улыбка' },
  { code: ':-D', url: 'https://www.kolobok.us/smiles/standart/grin.gif', label: 'Смех' },
  { code: ';-)', url: 'https://www.kolobok.us/smiles/standart/wink3.gif', label: 'Подмигивание' },
  { code: ':-*', url: 'https://www.kolobok.us/smiles/standart/kiss.gif', label: 'Поцелуй' },
  { code: ':-(', url: 'https://www.kolobok.us/smiles/standart/sad.gif', label: 'Грусть' },
  { code: ':-@', url: 'https://www.kolobok.us/smiles/standart/aggressive.gif', label: 'Злость' },
  { code: ':-[', url: 'https://www.kolobok.us/smiles/standart/blush2.gif', label: 'Смущение' },
  { code: '8-)', url: 'https://www.kolobok.us/smiles/standart/dirol.gif', label: 'Крутой' },
  { code: '*THUMBS UP*', url: 'https://www.kolobok.us/smiles/standart/yes.gif', label: 'Класс' },
  { code: '*DRINK*', url: 'https://www.kolobok.us/smiles/standart/drinks.gif', label: 'Пиво' },
  { code: '*DANCE*', url: 'https://www.kolobok.us/smiles/standart/dance.gif', label: 'Танец' },
  { code: '*ROFL*', url: 'https://www.kolobok.us/smiles/standart/rofl.gif', label: 'Катаюсь со смеху' },
  { code: '*PARDON*', url: 'https://www.kolobok.us/smiles/standart/pardon.gif', label: 'Прошу прощения' },
];

const parseRetroSmileys = (text: string) => {
  const smileysMap: Record<string, string> = {
    ':-)': 'https://www.kolobok.us/smiles/standart/smile3.gif',
    ':-D': 'https://www.kolobok.us/smiles/standart/grin.gif',
    ';-)': 'https://www.kolobok.us/smiles/standart/wink3.gif',
    ':-*': 'https://www.kolobok.us/smiles/standart/kiss.gif',
    ':-(': 'https://www.kolobok.us/smiles/standart/sad.gif',
    ':-@': 'https://www.kolobok.us/smiles/standart/aggressive.gif',
    ':-[': 'https://www.kolobok.us/smiles/standart/blush2.gif',
    '8-)': 'https://www.kolobok.us/smiles/standart/dirol.gif',
    '*THUMBS UP*': 'https://www.kolobok.us/smiles/standart/yes.gif',
    '*DRINK*': 'https://www.kolobok.us/smiles/standart/drinks.gif',
    '*DANCE*': 'https://www.kolobok.us/smiles/standart/dance.gif',
    '*ROFL*': 'https://www.kolobok.us/smiles/standart/rofl.gif',
    '*PARDON*': 'https://www.kolobok.us/smiles/standart/pardon.gif',
  };

  const keys = Object.keys(smileysMap).map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const regex = new RegExp(`(${keys.join('|')})`, 'g');

  if (!regex.test(text)) return <span>{text}</span>;

  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, index) => {
        if (smileysMap[part]) {
          return (
            <img 
              key={index} 
              src={smileysMap[part]} 
              alt={part}
              title={part}
              referrerPolicy="no-referrer"
              className="inline-block mx-0.5 max-h-[20px] align-middle select-none cursor-help hover:scale-125 transition-transform" 
            />
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
  const [showSmileyPicker, setShowSmileyPicker] = useState(false);
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
    setShowSmileyPicker(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg overflow-hidden border border-slate-350 relative shadow-md font-sans text-slate-800">
      {/* Chat Header */}
      <div className="bg-slate-100 border-b border-slate-300 p-3.5 flex items-center gap-2 select-none">
        <MessageSquare className="w-4.5 h-4.5 text-slate-650" />
        <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase font-sans leading-none">Чат города</h4>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-auto" title="Подключено к чату" />
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-sans text-xs select-text bg-white rpg-scrollbar">
        {messages.map((msg) => {
          const isSystem = msg.sender === 'Система';
          const isSelf = msg.sender === playerName;
          return (
            <div key={msg.id} className="animate-fade-in break-words leading-relaxed">
              <span className="text-[10px] text-slate-400 font-mono mr-1.5">[{msg.timestamp}]</span>
              {isSystem ? (
                <span className="text-amber-700 font-bold">{msg.sender}: </span>
              ) : isSelf ? (
                <span className="text-blue-700 font-bold hover:underline cursor-pointer">{msg.sender}: </span>
              ) : (
                <span className="text-indigo-650 font-bold hover:underline cursor-pointer">{msg.sender}: </span>
              )}
              <span className={isSystem ? 'text-amber-800 italic' : 'text-slate-800'}>
                {parseRetroSmileys(msg.text)}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Message input container */}
      <form onSubmit={handleSendMessage} className="bg-slate-100 border-t border-slate-200 p-2 flex gap-2 items-center relative">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Введите сообщение..."
            className="w-full bg-white border border-slate-300 pl-3 pr-9 py-2 text-xs rounded text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
            maxLength={100}
          />
          <button
            type="button"
            onClick={() => setShowSmileyPicker(!showSmileyPicker)}
            className={`absolute right-2.5 z-20 text-slate-450 hover:text-slate-650 transition-colors cursor-pointer select-none ${
              showSmileyPicker ? 'text-slate-650' : ''
            }`}
            title="Выбрать ретро-смайлик"
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          {/* Smiley Picker Popup */}
          {showSmileyPicker && (
            <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-white border border-slate-300 rounded-lg shadow-xl z-50 animate-fade-in select-none">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5 mb-2">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ретро Смайлы QIP / ICQ</span>
                <button 
                  type="button" 
                  onClick={() => setShowSmileyPicker(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto rpg-scrollbar pr-0.5">
                {RETRO_SMILEYS.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => {
                      setInputText(prev => prev + s.code + ' ');
                    }}
                    className="hover:bg-slate-100 border border-transparent hover:border-slate-200 p-1.5 rounded transition-all cursor-pointer flex justify-center items-center select-none"
                    title={`${s.label} (${s.code})`}
                  >
                    <img 
                      src={s.url} 
                      alt={s.code} 
                      referrerPolicy="no-referrer"
                      className="max-h-[20px] select-none" 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-slate-200 hover:bg-slate-300 border border-slate-350 p-2 px-3 rounded text-slate-700 font-bold transition-all duration-150 text-xs font-sans flex items-center justify-center gap-1 cursor-pointer"
          title="Отправить сообщение"
        >
          <Send className="w-3.5 h-3.5" /> Отправить
        </button>
      </form>
    </div>
  );
};
