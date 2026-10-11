import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Trash2, CheckCheck, Play, Pause, 
  Sparkles, MessageSquare, CornerDownLeft, Volume2 
} from 'lucide-react';
import { ChatMessage, Platform } from '../types/bot';
import { runBotCommand } from '../services/commandRunner';
import avatarImg from '../assets/images/bot_avatar_silana_1791710292196.jpg';

interface ChatSandboxProps {
  initialPlatform?: Platform;
}

export const ChatSandbox: React.FC<ChatSandboxProps> = ({ initialPlatform = 'whatsapp' }) => {
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      platform: 'whatsapp',
      senderName: 'سيلانا بوت (Silana Bot)',
      timestamp: Date.now() - 60000,
      text: `👋 مرحباً بك في مختبر محاكاة وتجربة أوامر سيلانا بوت!\n\nيمكنك إرسال أي أمر مثل *.menu* أو تجربة الذكاء الاصطناعي *.gemini* أو القرآن الكريم *.ayah 2:255* ومواقيت الصلاة *.prayer*.`,
      status: 'read'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio play/pause handler
  const handleToggleAudio = (url: string) => {
    if (playingAudioUrl === url) {
      audioRef.current?.pause();
      setPlayingAudioUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioUrl(url);
      audio.onended = () => setPlayingAudioUrl(null);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      platform,
      senderName: 'أنت',
      timestamp: Date.now(),
      text,
      status: 'read'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsProcessing(true);

    try {
      const result = await runBotCommand(text, platform, 'ياسين');
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        platform,
        senderName: 'سيلانا بوت',
        timestamp: Date.now(),
        text: result.text,
        mediaType: result.mediaType,
        mediaUrl: result.mediaUrl,
        caption: result.caption,
        commandUsed: result.pluginUsed,
        status: 'read'
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Error running bot command', err);
      const errMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        platform,
        senderName: 'سيلانا بوت',
        timestamp: Date.now(),
        text: '⚠️ حدث خطأ أثناء تنفيذ الأمر، يرجى المحاولة لاحقاً.',
        status: 'read'
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingAudioUrl(null);
    }
  };

  const QUICK_COMMANDS = [
    { label: '.menu (قائمة الأوامر)', cmd: '.menu' },
    { label: '.gemini ما هو الذكاء الاصطناعي؟', cmd: '.gemini ما هو الذكاء الاصطناعي وما هي مجالاته؟' },
    { label: '.ayah 2:255 (آية الكرسي مع صوت)', cmd: '.ayah 2:255' },
    { label: '.surah 112 (سورة الإخلاص)', cmd: '.surah 112' },
    { label: '.prayer الرباط (مواقيت الصلاة)', cmd: '.prayer الرباط' },
    { label: '.hadith (الأحاديث الشريفة)', cmd: '.hadith النية' },
    { label: '.brat سيلانا الأفضل (ملصق برات)', cmd: '.brat سيلانا بوت v2' },
    { label: '.weather الدار البيضاء (الطقس)', cmd: '.weather الدار البيضاء' },
    { label: '.ping (سرعة البوت)', cmd: '.ping' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setPlatform('whatsapp')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                platform === 'whatsapp' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>واجهة واتساب</span>
            </button>
            <button
              onClick={() => setPlatform('telegram')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                platform === 'telegram' 
                  ? 'bg-cyan-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>واجهة تيليجرام</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            اختبار تفاعلي يحاكي معالجة الرسائل الحقيقية
          </span>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition"
          title="مسح المحادثة"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>

      {/* Chat Simulation Viewport */}
      <div className={`rounded-2xl border overflow-hidden shadow-2xl flex flex-col h-[580px] ${
        platform === 'whatsapp' 
          ? 'bg-[#0b141a] border-emerald-900/40' 
          : 'bg-[#17212b] border-cyan-900/40'
      }`}>
        {/* Contact Header */}
        <div className={`flex items-center justify-between px-5 py-3 border-b text-white shrink-0 ${
          platform === 'whatsapp' 
            ? 'bg-[#1f2c34] border-[#2a3942]' 
            : 'bg-[#242f3d] border-[#1f2936]'
        }`}>
          <div className="flex items-center gap-3">
            <img 
              src={avatarImg} 
              alt="Bot Avatar" 
              className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white leading-none">سيلانا بوت (Silana Bot)</h3>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${
                  platform === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                }`}>
                  BOT
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                متصل الآن · جاهز للأوامر
              </span>
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {platform === 'whatsapp' ? '+212 600-112233' : '@SilanaOfficialBot'}
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 space-y-2 text-sm shadow-md ${
                    isMe
                      ? platform === 'whatsapp'
                        ? 'bg-[#005c4b] text-white rounded-br-none'
                        : 'bg-[#2b5278] text-white rounded-br-none'
                      : platform === 'whatsapp'
                        ? 'bg-[#202c33] text-slate-100 rounded-bl-none border border-[#2a3942]'
                        : 'bg-[#182533] text-slate-100 rounded-bl-none border border-[#242f3d]'
                  }`}
                >
                  {/* Sender name for bot */}
                  {!isMe && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold pb-1 border-b border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        <span>سيلانا بوت</span>
                      </span>
                      {msg.commandUsed && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          .{msg.commandUsed}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Media attachment if any */}
                  {msg.mediaType === 'audio' && msg.mediaUrl && (
                    <div className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleToggleAudio(msg.mediaUrl!)}
                        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition shrink-0"
                      >
                        {playingAudioUrl === msg.mediaUrl ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 overflow-hidden">
                        <span className="text-xs font-semibold text-white truncate block">
                          {msg.caption || 'تلاوة صوتية'}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Volume2 className="w-3 h-3" />
                          <span>تلاوة نقية بجودة MP3 عالية</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.mediaType === 'sticker' && msg.mediaUrl && (
                    <div className="py-2 flex justify-center">
                      <img 
                        src={msg.mediaUrl} 
                        alt="Sticker" 
                        className="w-40 h-40 object-contain rounded-lg filter drop-shadow-lg"
                      />
                    </div>
                  )}

                  {msg.mediaType === 'image' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden my-1 border border-white/10">
                      <img 
                        src={msg.mediaUrl} 
                        alt="Media Preview" 
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}

                  {msg.mediaType === 'video' && msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden my-1">
                      <video 
                        src={msg.mediaUrl} 
                        controls 
                        className="w-full max-h-64 rounded-xl"
                      />
                    </div>
                  )}

                  {/* Text content with whitespace preserve */}
                  <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                    {msg.text}
                  </div>

                  {/* Message timestamp and status */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 pt-1">
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-start gap-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 rounded-bl-none text-xs text-slate-300 flex items-center gap-2 border border-slate-700">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>سيلانا بوت يكتب الآن...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Command Suggestions */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">جرّب فوراً:</span>
          {QUICK_COMMANDS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.cmd)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] whitespace-nowrap shrink-0 transition"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Area */}
        <div className={`p-3 border-t flex items-center gap-2 shrink-0 ${
          platform === 'whatsapp' 
            ? 'bg-[#202c33] border-[#2a3942]' 
            : 'bg-[#242f3d] border-[#1f2936]'
        }`}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="اكتب أمراً أو سؤالاً للذكاء الاصطناعي (مثال: .menu أو .gemini)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className={`p-2.5 rounded-xl text-white transition flex items-center justify-center shrink-0 ${
              platform === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500'
                : 'bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
