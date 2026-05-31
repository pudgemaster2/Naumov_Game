import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onRegister,
  loading,
  error,
  setError,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Пожалуйста, введите корректный адрес почты.');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }

    try {
      if (isRegister) {
        await onRegister(email, password);
      } else {
        await onLogin(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка.');
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
    setPassword('');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-16 relative select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,40,0.07)_0%,transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-[480px] gothic-panel-gold p-10 bg-obsidian-900/90 backdrop-blur rounded-xl animate-fade-in relative overflow-hidden">
        
        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-obsidian-950/70 backdrop-blur-xs z-50 flex flex-col justify-center items-center gap-4">
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin" />
            <p className="text-sm font-mono text-gold-400 uppercase tracking-widest animate-pulse">Связь с сервером...</p>
          </div>
        )}

        {/* Shield Header */}
        <div className="flex justify-center mb-8">
          <div className="p-5 rounded-full bg-obsidian-950 border border-gold-500 shadow-[0_0_20px_rgba(197,160,40,0.35)] text-gold-400">
            <Shield className="w-16 h-16" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold font-gothic text-center tracking-widest text-gold-400 mb-2 gold-text-shimmer">
          БОЙЦОВСКИЙ КЛУБ
        </h1>
        <p className="text-xs text-center text-slate-400 font-mono tracking-widest uppercase mb-10">
          Легендарная бойцовская арена
        </p>

        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 rounded border border-rose-800 bg-rose-950/30 text-rose-300 text-sm font-mono leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gold-500 uppercase tracking-widest mb-2 font-gothic">
              Адрес почты (Email)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full px-5 py-3.5 rounded border border-obsidian-700 bg-obsidian-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-mono text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gold-500 uppercase tracking-widest mb-2 font-gothic">
              Пароль (Password)
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="w-full px-5 py-3.5 pr-12 rounded border border-obsidian-700 bg-obsidian-950 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all font-mono text-base"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-5">
            {isRegister ? 'Зарегистрироваться' : 'Войти в игру'}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            className="text-sm font-mono text-gold-500 hover:text-gold-300 underline cursor-pointer transition-colors"
          >
            {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>

        <div className="mt-10 border-t border-obsidian-800 pt-8 text-xs text-slate-500 font-mono text-center leading-relaxed">
          <p>© 1999-2026 COMBATS CLONE. ВСЕ ПРАВА ЗАЩИЩЕНЫ.</p>
          <p className="mt-1">Для подключения требуется Email и надежный пароль.</p>
        </div>
      </div>
    </div>
  );
};
