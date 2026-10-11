import React, { useState } from 'react';
import { 
  Layers, Search, Play, CheckCircle2, XCircle, Code, 
  ExternalLink, Sparkles, Filter, RefreshCw, X 
} from 'lucide-react';
import { BotPlugin } from '../types/bot';
import { INITIAL_PLUGINS } from '../data/pluginsList';
import { runBotCommand, CommandResult } from '../services/commandRunner';

export const PluginsManager: React.FC = () => {
  const [plugins, setPlugins] = useState<BotPlugin[]>(INITIAL_PLUGINS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal execution state
  const [activeModalPlugin, setActiveModalPlugin] = useState<BotPlugin | null>(null);
  const [modalArgs, setModalArgs] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<CommandResult | null>(null);

  const categories = [
    { id: 'all', label: 'جميع الإضافات', count: plugins.length },
    { id: 'ai', label: 'الذكاء الاصطناعي', count: plugins.filter(p => p.category === 'ai').length },
    { id: 'download', label: 'التنزيل والوسائط', count: plugins.filter(p => p.category === 'download').length },
    { id: 'islamic', label: 'إسلاميات وقرآن', count: plugins.filter(p => p.category === 'islamic').length },
    { id: 'stickers', label: 'الملصقات والصور', count: plugins.filter(p => p.category === 'stickers').length },
    { id: 'tools', label: 'خدمات وأدوات', count: plugins.filter(p => p.category === 'tools').length },
    { id: 'group', label: 'إدارة المجموعات', count: plugins.filter(p => p.category === 'group').length },
    { id: 'owner', label: 'إدارة البوت', count: plugins.filter(p => p.category === 'owner').length }
  ];

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    const matchesSearch = 
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.arabicName.includes(searchQuery) ||
      plugin.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.arabicDescription.includes(searchQuery) ||
      plugin.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleOpenModal = (plugin: BotPlugin) => {
    setActiveModalPlugin(plugin);
    setModalArgs(plugin.sampleArgs || '');
    setExecutionResult(null);
  };

  const handleRunModalCommand = async () => {
    if (!activeModalPlugin) return;
    setIsExecuting(true);
    try {
      const fullCommand = `.${activeModalPlugin.command} ${modalArgs}`.trim();
      const res = await runBotCommand(fullCommand, 'whatsapp', 'مستخدم التجربة');
      setExecutionResult(res);
    } catch (err) {
      console.error('Execution error', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">مستودع إضافات وأوامر سيلانا</h1>
              <p className="text-xs text-slate-400">
                إجمالي {plugins.length} إضافة مستخرجة ومجهزة من ملفات السكربت الأصلي (silana-bot-master/plugins/)
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أمر أو ميزة..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Category Filter Pills (Functional Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              selectedCategory === cat.id ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlugins.map((plugin) => (
          <div
            key={plugin.id}
            className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition ${
              plugin.enabled
                ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                : 'bg-slate-950/60 border-slate-850 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{plugin.arabicName}</span>
                    <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      .{plugin.command}
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    {plugin.name}
                  </span>
                </div>

                {/* Enable / Disable toggle */}
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition flex items-center ${
                    plugin.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-750 justify-start'
                  }`}
                  title={plugin.enabled ? 'إلغاء التفعيل' : 'تفعيل'}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow"></span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {plugin.arabicDescription}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[180px] font-mono">
                  {plugin.originalFile}
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  {plugin.aliases.length > 0 ? `المرادفات: ${plugin.aliases.slice(0, 2).join(', ')}` : ''}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(plugin)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>تجربة الأمر الآن</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <p className="text-sm font-semibold text-white">لم يتم العثور على أي إضافة تطابق بحثك</p>
          <p className="text-xs text-slate-400">جرّب البحث باسم أمر آخر أو اختيار تصنيف مختلف.</p>
        </div>
      )}

      {/* Execution Test Modal */}
      {activeModalPlugin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-750 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>تجربة أمر:</span>
                  <span className="font-mono text-emerald-400">.{activeModalPlugin.command}</span>
                </h3>
                <span className="text-xs text-slate-400">{activeModalPlugin.arabicName}</span>
              </div>
              <button
                onClick={() => setActiveModalPlugin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  المدخلات / النص المصاحب للأمر (Arguments):
                </label>
                <input
                  type="text"
                  value={modalArgs}
                  onChange={(e) => setModalArgs(e.target.value)}
                  placeholder={activeModalPlugin.sampleArgs || 'اكتب المدخلات هنا...'}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/50 p-3 rounded-lg border border-slate-850">
                <strong>طريقة الاستخدام:</strong> {activeModalPlugin.usage}
              </div>
            </div>

            <button
              onClick={handleRunModalCommand}
              disabled={isExecuting}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>تنفيذ الأمر في النواة واستعراض الرد</span>
            </button>

            {/* Execution Output */}
            {executionResult && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-white block">مخرجات سيلانا بوت:</span>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
                  {executionResult.text}
                </div>
                {executionResult.mediaUrl && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم تضمين وسائط من نوع: {executionResult.mediaType}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
