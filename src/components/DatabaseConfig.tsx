import React, { useState, useEffect } from 'react';
import { 
  Database, Settings, Save, ShieldAlert, Award, UserPlus, 
  Trash2, RefreshCw, CheckCircle2, Download, Copy, Check 
} from 'lucide-react';

export const DatabaseConfig: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'users' | 'raw'>('config');

  // Config State
  const [botName, setBotName] = useState<string>('Silana Bot - سيلانا بوت');
  const [ownerNumber, setOwnerNumber] = useState<string>('212600112233');
  const [prefix, setPrefix] = useState<string>('.');
  const [autoRead, setAutoRead] = useState<boolean>(true);
  const [antiCall, setAntiCall] = useState<boolean>(true);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('مرحباً بك في المجموعة! نرجو الالتزام بالقوانين.');

  // Users State
  const [users, setUsers] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // New user modal
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserNumber, setNewUserNumber] = useState<string>('');
  const [newUserPremium, setNewUserPremium] = useState<boolean>(true);

  const fetchDatabase = async () => {
    try {
      const res = await fetch('/api/database');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setBotName(data.config.botName || 'Silana Bot');
          setOwnerNumber(data.config.ownerNumber || '212600112233');
          setPrefix(data.config.prefix || '.');
          setAutoRead(Boolean(data.config.autoRead));
          setAntiCall(Boolean(data.config.antiCall));
          setWelcomeMessage(data.config.welcomeMessage || '');
        }
        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to fetch database', err);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            botName,
            ownerNumber,
            prefix,
            autoRead,
            antiCall,
            welcomeMessage
          },
          users
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save database', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUser = () => {
    if (!newUserName || !newUserNumber) return;
    const cleanId = `${newUserNumber.replace(/\D/g, '')}@s.whatsapp.net`;
    setUsers((prev) => ({
      ...prev,
      [cleanId]: {
        name: newUserName,
        number: newUserNumber,
        exp: 5000,
        coins: 1000,
        level: 10,
        premium: newUserPremium,
        banned: false,
        warns: 0,
        lastSeen: new Date().toISOString()
      }
    }));
    setNewUserName('');
    setNewUserNumber('');
  };

  const handleToggleBan = (id: string) => {
    setUsers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        banned: !prev[id].banned
      }
    }));
  };

  const handleTogglePremium = (id: string) => {
    setUsers(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        premium: !prev[id].premium
      }
    }));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify({ config: { botName, ownerNumber, prefix, autoRead, antiCall, welcomeMessage }, users }, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">إعدادات وقاعدة بيانات البوت</h1>
            <p className="text-xs text-slate-400">
              إدارة ملف database.json، تعيين المطورين، الصلاحيات، وحسابات الـ VIP
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ التغييرات الآن</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>تم حفظ الإعدادات وقاعدة البيانات بنجاح!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'config'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات البوت والبادئة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>المستخدمين والرتب (VIP & Bans)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('raw')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeSubTab === 'raw'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ملف database.json الخام</span>
        </button>
      </div>

      {/* Tab 1: Config */}
      {activeSubTab === 'config' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                اسم البوت الرسمي (Bot Display Name)
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رقم المطور الرئيسي (Owner Number)
              </label>
              <input
                type="text"
                value={ownerNumber}
                onChange={(e) => setOwnerNumber(e.target.value)}
                placeholder="212600112233"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                بادئة الأوامر الافتراضية (Command Prefix)
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="."
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-end space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={autoRead}
                  onChange={(e) => setAutoRead(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span>قراءة الرسائل تلقائياً وإظهار الصحين الزرقاوين (Auto Read)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={antiCall}
                  onChange={(e) => setAntiCall(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <span>حظر المكالمات التلقائي لمنع الإزعاج (Anti-Call Protection)</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                رسالة الترحيب بالأعضاء الجدد في المجموعات (Welcome Message)
              </label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          {/* Add User Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>إضافة أو ترقية مستخدم جديد</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="اسم المستخدم..."
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                placeholder="رقم الهاتف: +212..."
                value={newUserNumber}
                onChange={(e) => setNewUserNumber(e.target.value)}
                className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
              />
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newUserPremium}
                  onChange={(e) => setNewUserPremium(e.target.checked)}
                  className="rounded text-emerald-600 bg-slate-900 border-slate-600"
                />
                <span>ترقية لعضوية VIP</span>
              </label>
              <button
                onClick={handleAddUser}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                إضافة المستخدم
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">قائمة مستخدمي البوت المسجلين</h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                {Object.keys(users).length} مستخدم
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">الاسم والرقم</th>
                    <th className="p-3">المستوى</th>
                    <th className="p-3">النقاط (Coins)</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {Object.entries(users).map(([id, user]: [string, any]) => (
                    <tr key={id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <strong className="block text-white font-medium">{user.name}</strong>
                        <span className="font-mono text-slate-400 text-[11px]">{user.number || id}</span>
                      </td>
                      <td className="p-3 font-mono tabular-nums text-emerald-400 font-bold">
                        Lv. {user.level || 1}
                      </td>
                      <td className="p-3 font-mono tabular-nums text-amber-400 font-bold">
                        🪙 {user.coins ?? 100}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          {user.premium && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              VIP
                            </span>
                          )}
                          {user.banned && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              محظور
                            </span>
                          )}
                          {!user.premium && !user.banned && (
                            <span className="text-slate-400">عادي</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePremium(id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                          >
                            {user.premium ? 'إلغاء VIP' : 'ترقية VIP'}
                          </button>
                          <button
                            onClick={() => handleToggleBan(id)}
                            className={`px-2 py-1 rounded text-[11px] ${
                              user.banned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {user.banned ? 'إلغاء الحظر' : 'حظر'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Raw JSON */}
      {activeSubTab === 'raw' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">محتوى database.json الكامل</h3>
              <p className="text-xs text-slate-400">
                هيكل قاعدة البيانات المتوافق مع سكربت Silana Bot Master
              </p>
            </div>
            <button
              onClick={handleCopyRaw}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ!' : 'نسخ JSON'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
            {JSON.stringify({ config: { botName, ownerNumber, prefix, autoRead, antiCall, welcomeMessage }, users }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
