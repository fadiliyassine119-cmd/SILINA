import React, { useState, useEffect } from 'react';
import { Terminal, Copy, Check, Trash2, Filter, RefreshCw } from 'lucide-react';
import { LogEntry } from '../types/bot';

export const LiveLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesPlatform = platformFilter === 'all' || log.platform === platformFilter;
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesPlatform && matchesLevel;
  });

  const handleCopyLogs = () => {
    const logText = filteredLogs.map(l => `[${l.timestamp}] [${l.platform.toUpperCase()}] [${l.level.toUpperCase()}]: ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'success':
        return <span className="text-emerald-400 font-bold">[SUCCESS]</span>;
      case 'warn':
        return <span className="text-amber-400 font-bold">[WARN]</span>;
      case 'error':
        return <span className="text-rose-400 font-bold">[ERROR]</span>;
      default:
        return <span className="text-cyan-400 font-bold">[INFO]</span>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
        return <span className="text-emerald-400 font-semibold">[WHATSAPP]</span>;
      case 'telegram':
        return <span className="text-cyan-400 font-semibold">[TELEGRAM]</span>;
      case 'gemini':
        return <span className="text-indigo-400 font-semibold">[GEMINI-AI]</span>;
      default:
        return <span className="text-slate-400 font-semibold">[SYSTEM]</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">سجلات النشاط المباشر (Console Logs)</h1>
            <p className="text-xs text-slate-400">
              مراقبة آنية لكافة الرسائل الواردة، استدعاءات الذكاء الاصطناعي، وأحداث واتساب وتيليجرام
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'تم النسخ!' : 'نسخ السجلات'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">المنصة:</span>
          {['all', 'whatsapp', 'telegram', 'gemini', 'system'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                platformFilter === p 
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'all' ? 'الكل' : p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">المستوى:</span>
          {['all', 'info', 'success', 'warn', 'error'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                levelFilter === lvl 
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl === 'all' ? 'الكل' : lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Display */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="text-xs font-mono text-slate-400 mr-2">silana-bot-daemon.log</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            STREAM ACTIVE ({filteredLogs.length} events)
          </span>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 space-y-2 max-h-[500px] overflow-y-auto leading-relaxed">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/60 p-1 rounded transition">
              <span className="text-slate-500 tabular-nums shrink-0">{log.timestamp}</span>
              <span className="shrink-0">{getPlatformBadge(log.platform)}</span>
              <span className="shrink-0">{getLevelBadge(log.level)}</span>
              <span className="text-slate-200 break-words">{log.message}</span>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-500 font-mono">
              لا توجد سجلات تطابق الفلاتر المحددة حالياً.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
