import React, { useState } from 'react';
import { 
  Send, Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, 
  Radio, Copy, Check, Shield, HelpCircle, MessageSquare 
} from 'lucide-react';
import { BotStatus } from '../types/bot';

interface TelegramConnectProps {
  status: BotStatus | null;
  onStatusUpdate: () => void;
}

export const TelegramConnect: React.FC<TelegramConnectProps> = ({ status, onStatusUpdate }) => {
  const [token, setToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string>('');
  const [verifySuccess, setVerifySuccess] = useState<string>('');

  // Polling toggle state
  const [isTogglingPolling, setIsTogglingPolling] = useState<boolean>(false);

  // Message test state
  const [testChatId, setTestChatId] = useState<string>('');
  const [testText, setTestText] = useState<string>('مرحباً من سيلانا بوت! تم تفعيل الاتصال المباشر بنجاح ⚡');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [sendError, setSendError] = useState<string>('');

  // Webhook copy
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);

  const isConnected = status?.telegram?.status === 'connected';
  const isPolling = status?.telegram?.pollingActive;

  // Verify Telegram Bot Token
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsVerifying(true);
    setVerifyError('');
    setVerifySuccess('');

    try {
      const res = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setVerifySuccess(`تم ربط البوت بنجاح: @${data.bot.username}`);
        onStatusUpdate();
      } else {
        setVerifyError(data.message || 'فشل التحقق من التوكن. تأكد من صحته من @BotFather.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setVerifyError(`خطأ في الشبكة: ${errorMsg}`);
    } finally {
      setIsVerifying(false);
    }
  };

  // Toggle Polling
  const handleTogglePolling = async () => {
    setIsTogglingPolling(true);
    try {
      const res = await fetch('/api/telegram/toggle-polling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isPolling })
      });
      if (res.ok) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error('Failed to toggle polling', err);
    } finally {
      setIsTogglingPolling(false);
    }
  };

  // Send Direct Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChatId || !testText) return;

    setIsSending(true);
    setSendSuccess(false);
    setSendError('');

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: testChatId.trim(), text: testText })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 4000);
      } else {
        setSendError(data.message || 'فشل الإرسال. تأكد من أن المستخدم بدأ محادثة مع البوت أولاً.');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setSendError(`خطأ في الإرسال: ${errorMsg}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/telegram/webhook`);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">ربط بوت تيليجرام الحقيقي</h1>
              {isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> متصل ونشط
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> غير مرتبط
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ربط مباشر وموثوق باستخدام Telegram Bot API الرسمي للرد الفوري على مستخدمي وقنوات تيليجرام.
            </p>
          </div>
        </div>

        {isConnected && status?.telegram?.botUsername && (
          <a
            href={`https://t.me/${status.telegram.botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition shrink-0"
          >
            <span>فتح البوت في تيليجرام</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Main Connection Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Token Input & Live Status */}
        <div className="md:col-span-7 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <span>إدخال رمز البوت (Bot Token)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              احصل على التوكن مجاناً من بوت <strong>@BotFather</strong> الرسمي في تطبيق تيليجرام وألصقه هنا.
            </p>
          </div>

          <form onSubmit={handleVerifyToken} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Telegram Bot Token (HTTP API Access Token)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="e.g. 7123456789:AAFl8k9..."
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || !token}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من التوكن عبر سيرفرات تيليجرام...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>التحقق من التوكن وتفعيل البوت</span>
                </>
              )}
            </button>
          </form>

          {verifyError && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{verifyError}</span>
            </div>
          )}

          {verifySuccess && (
            <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{verifySuccess}</span>
            </div>
          )}

          {/* Connected bot info card */}
          {isConnected && (
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">بيانات البوت المتصل:</span>
                <span className="text-[11px] text-cyan-400 font-mono">ID: {status?.telegram?.botId}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                  {status?.telegram?.botName?.charAt(0) || 'T'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{status?.telegram?.botName}</h4>
                  <a 
                    href={`https://t.me/${status?.telegram?.botUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-400 hover:underline font-mono"
                  >
                    @{status?.telegram?.botUsername}
                  </a>
                </div>
              </div>

              {/* Polling Controller */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">الاستماع التلقائي للرسائل (Live Polling):</span>
                  <span className="text-[11px] text-slate-400">
                    {isPolling ? 'البوت يستقبل رسائل المستخدمين ويرد عليها آلياً' : 'الاستماع متوقف'}
                  </span>
                </div>
                <button
                  onClick={handleTogglePolling}
                  disabled={isTogglingPolling}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isPolling 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${isPolling ? 'animate-pulse text-rose-400' : ''}`} />
                  <span>{isPolling ? 'إيقاف الاستماع' : 'تشغيل الاستماع'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Instructions / BotFather Guide */}
        <div className="md:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>كيفية إنشاء بوت تيليجرام في دقيقة:</span>
            </h3>

            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>افتح تيليجرام وابحث عن <strong>@BotFather</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>أرسل الأمر <strong>/newbot</strong> ثم اختر اسماً للبوت واسم مستخدم ينتهي بـ <code>bot</code>.</span>
              </li>
              <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>انسخ رمز الـ <strong>API Token</strong> الذي يظهر لك وضعه في الخانة المقابلة.</span>
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-900/40 space-y-2 text-xs">
            <span className="text-cyan-300 font-semibold block flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>رابط Webhook المباشر (اختياري للإنتاج):</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/api/telegram/webhook`}
                className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400"
              />
              <button
                onClick={handleCopyWebhook}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] text-slate-200"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real Telegram Message Sender */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span>أداة إرسال رسالة تيليجرام حقيقية</span>
        </h3>
        <p className="text-xs text-slate-400">
          أرسل رسالة مباشرة إلى أي محادثة أو مجموعة أو قناة بواسطة البوت للتأكد من وصول الرسائل بنجاح.
        </p>

        <form onSubmit={handleSendMessage} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              value={testChatId}
              onChange={(e) => setTestChatId(e.target.value)}
              placeholder="Chat ID (معرف المحادثة أو القناة)"
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>
          <div className="md:col-span-6">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="نص الرسالة المراد إرسالها..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSending || !isConnected}
              className="w-full h-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>إرسال لتيليجرام</span>
            </button>
          </div>
        </form>

        {sendSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم إرسال الرسالة الحقيقية بنجاح إلى معرف تيليجرام {testChatId}!</span>
          </div>
        )}

        {sendError && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{sendError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
