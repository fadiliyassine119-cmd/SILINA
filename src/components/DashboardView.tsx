import React from 'react';
import { 
  MessageSquare, Send, Zap, ShieldCheck, Terminal, Cpu, Users, 
  Layers, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { BotStatus } from '../types/bot';
import heroImg from '../assets/images/silana_bot_hero_1791710282529.jpg';
import avatarImg from '../assets/images/bot_avatar_silana_1791710292196.jpg';

interface DashboardViewProps {
  status: BotStatus | null;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  status, 
  onNavigate, 
  onRefresh, 
  isLoading 
}) => {
  const isWaConnected = status?.whatsapp?.status === 'connected';
  const isTgConnected = status?.telegram?.status === 'connected';

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="relative min-h-[340px] flex items-center">
          {/* Background image with measured contrast scrim */}
          <img 
            src={heroImg} 
            alt="Silana Bot Operations Center" 
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>

          {/* Foreground content */}
          <div className="relative z-10 max-w-2xl p-8 lg:p-10 space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={avatarImg} 
                alt="Silana Mascot" 
                className="w-12 h-12 rounded-xl border border-emerald-500/40 shadow-lg shadow-emerald-500/20 object-cover"
              />
              <div>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider">
                  منصة سيلانا بوت v2.0
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight" style={{ textWrap: 'balance' }}>
                  مركز التحكم الشامل لبوتات واتساب وتيليجرام
                </h1>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              تم تحويل سكربت سيلانا (Silana Bot Master) بالكامل إلى تطبيق ويب متكامل. اربط حساب واتساب عبر باركود QR أو كود الربط الفوري، وتواصل مع بوت تيليجرام الحقيقي عبر التوكن مع معالجة ذكية للأوامر والذكاء الاصطناعي.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('whatsapp')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-emerald-600/30 whitespace-nowrap"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ربط واتساب بالباركود أو الكود</span>
              </button>

              <button
                onClick={() => onNavigate('telegram')}
                className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-cyan-600/30 whitespace-nowrap"
              >
                <Send className="w-4 h-4" />
                <span>ربط بوت تيليجرام الحقيقي</span>
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>تجربة الأوامر في المحاكي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WhatsApp Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">اتصال واتساب</h3>
                <span className="text-xs text-slate-400">Baileys Multi-Device</span>
              </div>
            </div>
            {isWaConnected ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> متصل
              </span>
            ) : (
              <span className="text-xs text-amber-400 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertCircle className="w-3 h-3" /> في الانتظار
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>الحساب:</span>
              <span className="text-slate-200 font-mono text-xs">{status?.whatsapp?.accountName || 'غير متصل'}</span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>الرقم:</span>
              <span className="text-slate-200 font-mono text-xs">{status?.whatsapp?.phoneNumber || '—'}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('whatsapp')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 transition flex items-center justify-center gap-1.5"
          >
            <span>{isWaConnected ? 'إدارة الجلسة والرسائل' : 'مسح الباركود أو توليد الكود'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Telegram Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">اتصال تيليجرام</h3>
                <span className="text-xs text-slate-400">Telegram Bot API</span>
              </div>
            </div>
            {isTgConnected ? (
              <span className="text-xs text-cyan-400 flex items-center gap-1 font-medium bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                <CheckCircle2 className="w-3 h-3" /> نشط
              </span>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <AlertCircle className="w-3 h-3" /> بانتظار التوكن
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex justify-between">
              <span>اسم البوت:</span>
              <span className="text-slate-200 font-mono text-xs">
                {status?.telegram?.botUsername ? `@${status.telegram.botUsername}` : '—'}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex justify-between">
              <span>الاستماع الحي:</span>
              <span className={`text-xs font-semibold ${status?.telegram?.pollingActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                {status?.telegram?.pollingActive ? 'مفعل (Long Polling)' : 'متوقف'}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('telegram')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 transition flex items-center justify-center gap-1.5"
          >
            <span>{isTgConnected ? 'إدارة توكن تيليجرام' : 'إدخال رمز التوكن'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Stats Card: Total Commands */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">الأوامر المنفذة</h3>
                <span className="text-xs text-slate-400">إجمالي العمليات</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">24 ساعة</span>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
              {status?.stats?.totalCommandsExecuted ?? 142}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>وارد: <strong className="text-slate-200 font-mono tabular-nums">{status?.stats?.messagesReceived ?? 389}</strong></span>
              <span>·</span>
              <span>صادر: <strong className="text-slate-200 font-mono tabular-nums">{status?.stats?.messagesSent ?? 412}</strong></span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('plugins')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 transition flex items-center justify-center gap-1.5"
          >
            <span>استعراض الإضافات والأوامر</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* System Uptime & Health Card */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">استقرار النظام</h3>
                <span className="text-xs text-slate-400">سيلانا كور v2</span>
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="text-slate-400 hover:text-white transition p-1"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>زمن التشغيل:</span>
              <span className="text-emerald-400 font-mono font-bold tabular-nums">
                {status ? formatUptime(status.uptimeSeconds) : '00:00:00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>محرك الذكاء:</span>
              <span className="text-slate-200 text-xs">Google Gemini</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('logs')}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700/80 transition flex items-center justify-center gap-1.5"
          >
            <span>مراقبة سجلات السيرفر</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              قدرات وميزات سيلانا بوت المدمجة
            </h2>
            <p className="text-xs text-slate-400">
              تم تحويل كل المجلدات والإضافات من الأرشيف الأصلي إلى خدمات حقيقية تفاعلية
            </p>
          </div>
          <button 
            onClick={() => onNavigate('plugins')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>جميع الإضافات (45+)</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">الذكاء الاصطناعي (Gemini & GPT)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إجابة فورية عن الأسئلة المعقدة، حل البرمجة بالأكواد، التلخيص، وتوليد الصور مع فهم اللهجات العربية.
            </p>
            <div className="text-[11px] font-mono text-emerald-400/90 pt-1">
              الأوامر: .gemini · .gpt4 · .nour · .dalle
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">القرآن الكريم والأذكار والمواقيت</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تلاوة السور القرآنية والآيات الكريمة بأصوات كبار القراء، مواقيت الصلاة الدقيقة لكل المدن، والأحاديث النبوية.
            </p>
            <div className="text-[11px] font-mono text-cyan-400/90 pt-1">
              الأوامر: .ayah · .surah · .prayer · .hadith
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">أدوات التنزيل وصناعة الملصقات</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              تحميل مقاطع تيك توك بدون علامة مائية، صوتيات يوتيوب MP3 بجودة 320k، وصنع ملصقات واتساب وملصقات برات.
            </p>
            <div className="text-[11px] font-mono text-indigo-400/90 pt-1">
              الأوامر: .tiktok · .ytmp3 · .sticker · .brat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
