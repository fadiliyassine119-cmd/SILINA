import React from 'react';
import { Bot, MessageSquare, Send, Cpu, Layers, Terminal, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { BotStatus } from '../types/bot';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: BotStatus | null;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, status }) => {
  const isWaConnected = status?.whatsapp?.status === 'connected';
  const isTgConnected = status?.telegram?.status === 'connected';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Zone 1: Brand wordmark (single element, display font, whitespace-nowrap) */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
        className="flex items-center gap-3 cursor-pointer shrink-0"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
          <Bot className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            سيلانا بوت <span className="text-emerald-400 font-mono text-sm">Silana</span>
          </span>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">
            منصة إدارة وتكامل واتساب وتيليجرام
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation links (single line, whitespace-nowrap, clean text with active states) */}
      <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>لوحة القيادة</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'whatsapp' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>ربط واتساب</span>
          {isWaConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'telegram' 
              ? 'bg-slate-800 text-cyan-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>ربط تيليجرام</span>
          {isTgConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'chat' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>المحادثة الحية</span>
        </button>

        <button
          onClick={() => setActiveTab('plugins')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'plugins' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الأوامر والإضافات</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'logs' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>السجلات</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'database' 
              ? 'bg-slate-800 text-emerald-400 font-semibold' 
              : 'hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>الإعدادات</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action or connection quick indicator */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 rounded-lg border border-slate-700/80 text-xs">
          <span className="text-slate-400">النظام:</span>
          {isWaConnected || isTgConnected ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>متصل ومفعل</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>جاهز للربط</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
