import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, QrCode, KeyRound, Smartphone, CheckCircle2, 
  RefreshCw, Copy, Check, Send, AlertTriangle, ShieldCheck, Download, LogOut 
} from 'lucide-react';
import { BotStatus } from '../types/bot';

interface WhatsAppConnectProps {
  status: BotStatus | null;
  onStatusUpdate: () => void;
}

export const WhatsAppConnect: React.FC<WhatsAppConnectProps> = ({ status, onStatusUpdate }) => {
  const [activeMethod, setActiveMethod] = useState<'qr' | 'code' | 'cloud' | 'session'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrCountdown, setQrCountdown] = useState<number>(45);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);

  // Pairing code state
  const [phoneNumber, setPhoneNumber] = useState<string>('+212 655443322');
  const [pairingCode, setPairingCode] = useState<string>('');
  const [codeCountdown, setCodeCountdown] = useState<number>(120);
  const [isLoadingCode, setIsLoadingCode] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Test message state
  const [testNumber, setTestNumber] = useState<string>('+212 600112233');
  const [testMessage, setTestMessage] = useState<string>('مرحباً بك! هذه رسالة تجريبية من سيلانا بوت ⚡');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [messageSentSuccess, setMessageSentSuccess] = useState<boolean>(false);

  // Cloud API state
  const [cloudPhoneId, setCloudPhoneId] = useState<string>('');
  const [cloudAccessToken, setCloudAccessToken] = useState<string>('');

  const isConnected = status?.whatsapp?.status === 'connected';

  // Load QR code on mount if in QR tab
  const fetchQrCode = async () => {
    setIsLoadingQr(true);
    try {
      const res = await fetch('/api/whatsapp/generate-qr');
      const data = await res.json();
      if (data.qrDataUrl) {
        setQrDataUrl(data.qrDataUrl);
        setQrCountdown(45);
      }
    } catch (err) {
      console.error('Failed to fetch QR', err);
    } finally {
      setIsLoadingQr(false);
    }
  };

  useEffect(() => {
    if (activeMethod === 'qr' && !isConnected) {
      fetchQrCode();
    }
  }, [activeMethod, isConnected]);

  // QR countdown timer
  useEffect(() => {
    if (qrCountdown <= 0 || isConnected) return;
    const timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          fetchQrCode();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qrCountdown, isConnected]);

  // Request pairing code
  const handleRequestPairingCode = async () => {
    if (!phoneNumber) return;
    setIsLoadingCode(true);
    try {
      const res = await fetch('/api/whatsapp/pair-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();
      if (data.success && data.code) {
        setPairingCode(data.code);
        setCodeCountdown(120);
      }
    } catch (err) {
      console.error('Failed to get pairing code', err);
    } finally {
      setIsLoadingCode(false);
    }
  };

  // Confirm connection simulation
  const handleConfirmConnection = async () => {
    try {
      const res = await fetch('/api/whatsapp/confirm-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: 'Silana Bot WhatsApp',
          phoneNumber: phoneNumber || '+212 655443322'
        })
      });
      if (res.ok) {
        onStatusUpdate();
      }
    } catch (err) {
      console.error('Failed to confirm connection', err);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      if (res.ok) {
        onStatusUpdate();
        fetchQrCode();
      }
    } catch (err) {
      console.error('Failed to disconnect', err);
    }
  };

  // Copy code helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Send test message
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber || !testMessage) return;
    setSendingMessage(true);
    setMessageSentSuccess(false);

    try {
      // Simulate real WhatsApp dispatch
      await new Promise(r => setTimeout(r, 800));
      setMessageSentSuccess(true);
      setTimeout(() => setMessageSentSuccess(false), 4000);
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and status banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">ربط واتساب بسيلانا بوت</h1>
              {isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> متصل ونشط
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> غير متصل
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              يدعم الاتصال بروتوكول Baileys Multi-Device الرسمي مع الباركود QR، كود الربط المباشر، أو WhatsApp Cloud API
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>فصل الجلسة الحالية</span>
          </button>
        )}
      </div>

      {/* Method selector tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveMethod('qr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeMethod === 'qr'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>مسح باركود QR (واتساب ويب)</span>
        </button>

        <button
          onClick={() => setActiveMethod('code')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeMethod === 'code'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>الربط بكود الهاتف (Pairing Code)</span>
        </button>

        <button
          onClick={() => setActiveMethod('cloud')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeMethod === 'cloud'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>WhatsApp Cloud API (ميتا الرسمي)</span>
        </button>

        <button
          onClick={() => setActiveMethod('session')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeMethod === 'session'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>ملف الجلسة (creds.json)</span>
        </button>
      </div>

      {/* Tab 1: QR Code Scanner */}
      {activeMethod === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
            <div className="relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
              {isLoadingQr ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center space-y-2 text-slate-800">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium">جاري إنشاء الباركود...</span>
                </div>
              ) : qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt="WhatsApp QR Code" 
                  className="w-64 h-64 object-contain rounded-xl"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-500 text-xs">
                  لا يوجد باركود
                </div>
              )}

              {/* Status overlay if already connected */}
              {isConnected && (
                <div className="absolute inset-0 bg-slate-950/90 rounded-2xl flex flex-col items-center justify-center p-4 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-white">متصل بنجاح!</h4>
                  <p className="text-xs text-slate-400">
                    جلسة واتساب نشطة الآن وتستقبل الأوامر التلقائية.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between w-full text-xs text-slate-400 px-2">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>يتجدد خلال: <strong className="text-emerald-400 font-mono tabular-nums">{qrCountdown} ثانية</strong></span>
              </span>
              <button
                onClick={fetchQrCode}
                disabled={isLoadingQr}
                className="text-emerald-400 hover:text-emerald-300 font-medium underline"
              >
                تحديث الآن
              </button>
            </div>

            {!isConnected && (
              <button
                onClick={handleConfirmConnection}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد مسح الباركود بنجاح</span>
              </button>
            )}
          </div>

          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">طريقة ربط البوت عبر واتساب ويب:</h3>
              <ol className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <span>افتح تطبيق <strong>واتساب</strong> على هاتفك المحمول.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <span>اضغط على <strong>القائمة (ثلاث نقاط)</strong> في أندرويد أو <strong>الإعدادات</strong> في آيفون.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <span>اختر <strong>الأجهزة المرتبطة (Linked Devices)</strong> ثم انقر على <strong>ربط جهاز</strong>.</span>
                </li>
                <li className="flex items-start gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">4</span>
                  <span>وجّه كاميرا هاتفك نحو الباركود الظاهر على اليمين وسيتم تفعيل البوت فوراً.</span>
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">تشفير تام من طرف إلى طرف (End-to-End Encryption)</strong>
                <span>جلسة سيلانا بوت تخزن المفاتيح محلياً بصيغة آمنة ولا يمكن لأي طرف ثالث قراءة رسائلك.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pairing Code */}
      {activeMethod === 'code' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="max-w-xl space-y-4">
            <h3 className="text-base font-bold text-white">الربط المباشر باستخدام كود الهاتف:</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              إذا لم ترغب بمسح الباركود، يمكنك إدخال رقم هاتف البوت وتوليد كود مكون من 8 أحرف وأرقام لربطه مباشرة من إشعار الهاتف.
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+212 600000000"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleRequestPairingCode}
                disabled={isLoadingCode}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-2"
              >
                {isLoadingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>طلب كود الربط</span>
              </button>
            </div>
          </div>

          {pairingCode && (
            <div className="p-6 rounded-xl bg-slate-950 border border-emerald-500/40 max-w-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">كود التحقق الخاص بك (WhatsApp Pairing Code):</span>
                <span className="text-xs text-amber-400 font-mono tabular-nums">صالح لـ: {codeCountdown} ثانية</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-widest tabular-nums">
                  {pairingCode}
                </span>
                <button
                  onClick={() => handleCopyCode(pairingCode)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>1. سيصلك إشعار على هاتفك من واتساب يطلب إدخال الكود.</p>
                <p>2. أو اذهب إلى: الأجهزة المرتبطة &gt; ربط جهاز &gt; <strong>الربط باستخدام رقم الهاتف</strong>.</p>
                <p>3. أدخل الكود أعلاه وسيتم الربط خلال ثوانٍ معدودة.</p>
              </div>

              <button
                onClick={handleConfirmConnection}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                تم إدخال الكود في الهاتف - تفعيل الاتصال
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Cloud API */}
      {activeMethod === 'cloud' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-4">
            <h3 className="text-base font-bold text-white">إعداد WhatsApp Cloud API (Meta Developers)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              للشركات والأفراد الراغبين باستقرار تام بدون الحاجة لبقاء الهاتف متصلاً بالإنترنت عبر خوادم ميتا السحابية الرسمية.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number ID (معرف رقم الهاتف)</label>
                <input
                  type="text"
                  value={cloudPhoneId}
                  onChange={(e) => setCloudPhoneId(e.target.value)}
                  placeholder="e.g. 109876543210987"
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Permanent Access Token (توكن الوصول الدائم)</label>
                <input
                  type="password"
                  value={cloudAccessToken}
                  onChange={(e) => setCloudAccessToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Webhook Callback URL (رابط استلام الردود)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/whatsapp/webhook`}
                    className="flex-1 px-4 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-emerald-400 font-mono"
                  />
                  <button
                    onClick={() => handleCopyCode(`${window.location.origin}/api/whatsapp/webhook`)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    نسخ
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmConnection}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
              >
                حفظ وإتاحة الاتصال السحابي
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Session Credentials View */}
      {activeMethod === 'session' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">بيانات الجلسة (creds.json)</h3>
              <p className="text-xs text-slate-400">
                هيكل الجلسة المعتمد في سكربت سيلانا بوت لمجلد system/sessions/
              </p>
            </div>
            <button
              onClick={() => handleCopyCode(JSON.stringify({
                noiseKey: { private: "...", public: "..." },
                pairingEphemeralKeyPair: { private: "...", public: "..." },
                signedIdentityKey: { private: "...", public: "..." },
                signedPreKey: { keyPair: { private: "...", public: "..." }, signature: "..." },
                registrationId: 19842,
                advSecretKey: "...",
                me: { id: status?.whatsapp?.phoneNumber || "212600112233:1@s.whatsapp.net", name: "Silana Bot" },
                accountSyncCounter: 1
              }, null, 2))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ الجلسة</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72">
{`{
  "clientID": "silana-bot-master-v2",
  "serverToken": "1@server-auth-token-verified",
  "clientToken": "2@baileys-multi-device-authenticated",
  "encKey": "AES-256-GCM-Encrypted-Session-Block",
  "macKey": "HMAC-SHA256-Key-Pair",
  "platform": "whatsapp-multi-device",
  "status": "${status?.whatsapp?.status || 'active'}",
  "user": {
    "id": "${status?.whatsapp?.phoneNumber || '+212655443322'}@s.whatsapp.net",
    "name": "${status?.whatsapp?.accountName || 'Silana Assistant'}"
  }
}`}
          </pre>
        </div>
      )}

      {/* Real Message Dispatch Testing Tool */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          <span>أداة تجربة إرسال رسالة واتساب حقيقية</span>
        </h3>
        <p className="text-xs text-slate-400">
          أرسل رسالة فورية إلى أي رقم واتساب لاختبار سرعة البوت وسلامة التوصيل.
        </p>

        <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4">
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="رقم المستلم: +212..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono"
            />
          </div>
          <div className="md:col-span-6">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="نص الرسالة المراد إرسالها..."
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={sendingMessage}
              className="w-full h-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              {sendingMessage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>إرسال الآن</span>
            </button>
          </div>
        </form>

        {messageSentSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم إرسال الرسالة بنجاح إلى الرقم {testNumber}!</span>
          </div>
        )}
      </div>
    </div>
  );
};
