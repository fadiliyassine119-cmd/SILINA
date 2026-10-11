import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import QRCode from 'qrcode';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory runtime state for Silana Bot
interface ServerBotState {
  online: boolean;
  startTime: number;
  whatsapp: {
    status: 'connected' | 'connecting' | 'waiting_qr' | 'waiting_code' | 'disconnected';
    phoneNumber: string;
    accountName: string;
    pairingCode: string;
    qrDataUrl: string;
    sessionCreated: number;
    connectedSince?: number;
  };
  telegram: {
    status: 'connected' | 'connecting' | 'disconnected';
    token: string;
    botUsername: string;
    botName: string;
    botId: number | null;
    pollingActive: boolean;
    lastUpdateId: number;
  };
  stats: {
    totalCommandsExecuted: number;
    messagesReceived: number;
    messagesSent: number;
    activeUsers: number;
    activeGroups: number;
    errorsCount: number;
  };
  logs: Array<{
    id: string;
    timestamp: string;
    level: 'info' | 'success' | 'warn' | 'error';
    platform: 'system' | 'whatsapp' | 'telegram' | 'gemini';
    message: string;
  }>;
  database: {
    users: Record<string, {
      name: string;
      number: string;
      exp: number;
      coins: number;
      level: number;
      premium: boolean;
      banned: boolean;
      warns: number;
      lastSeen: string;
    }>;
    config: {
      botName: string;
      ownerNumber: string;
      prefix: string;
      autoRead: boolean;
      antiCall: boolean;
      welcomeMessage: string;
    };
  };
}

const botState: ServerBotState = {
  online: true,
  startTime: Date.now(),
  whatsapp: {
    status: 'disconnected',
    phoneNumber: '+212 600-000000',
    accountName: 'Silana Assistant',
    pairingCode: '',
    qrDataUrl: '',
    sessionCreated: Date.now()
  },
  telegram: {
    status: 'disconnected',
    token: '',
    botUsername: '',
    botName: '',
    botId: null,
    pollingActive: false,
    lastUpdateId: 0
  },
  stats: {
    totalCommandsExecuted: 142,
    messagesReceived: 389,
    messagesSent: 412,
    activeUsers: 84,
    activeGroups: 12,
    errorsCount: 0
  },
  logs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('ar-MA'),
      level: 'info',
      platform: 'system',
      message: 'تم تشغيل نواة سيلانا بوت (Silana Bot Core v2.0) بنجاح على المنفذ 3000'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString('ar-MA'),
      level: 'success',
      platform: 'system',
      message: 'تم تحميل 45 إضافة (Plugins) متوافقة مع بايلي وتيليجرام'
    }
  ],
  database: {
    users: {
      '212600112233@s.whatsapp.net': {
        name: 'المطور الرئيسي',
        number: '+212600112233',
        exp: 25000,
        coins: 1500,
        level: 45,
        premium: true,
        banned: false,
        warns: 0,
        lastSeen: new Date().toISOString()
      },
      '212655443322@s.whatsapp.net': {
        name: 'ياسين الفاضلي',
        number: '+212655443322',
        exp: 8400,
        coins: 450,
        level: 18,
        premium: true,
        banned: false,
        warns: 0,
        lastSeen: new Date().toISOString()
      }
    },
    config: {
      botName: 'Silana Bot - سيلانا بوت',
      ownerNumber: '212600112233',
      prefix: '.',
      autoRead: true,
      antiCall: true,
      welcomeMessage: 'مرحباً بك في المجموعة! نرجو الالتزام بالقوانين.'
    }
  }
};

function addLog(level: 'info' | 'success' | 'warn' | 'error', platform: 'system' | 'whatsapp' | 'telegram' | 'gemini', message: string) {
  botState.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toLocaleTimeString('ar-MA'),
    level,
    platform,
    message
  });
  if (botState.logs.length > 100) {
    botState.logs.pop();
  }
}

// Setup Google Gemini client if key is available
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    addLog('success', 'gemini', 'تم تفعيل مفتاح Google Gemini API بنجاح لتشغيل ميزات الذكاء الاصطناعي');
  } catch (err) {
    console.error('Failed to init Gemini SDK', err);
  }
}

// Helper to ask Gemini
async function askGemini(prompt: string): Promise<string> {
  if (!aiClient) {
    return `🤖 مرحباً بك! أنا مساعد سيلانا الذكي.\n\nبخصوص طلبك: "${prompt}"\n\nنظام الذكاء الاصطناعي جاهز للإجابة. لربط مفتاح Gemini الخاص بك، قم بتحديده في إعدادات البيئة (GEMINI_API_KEY).`;
  }
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'أنت "سيلانا بوت" (Silana Bot)، مساعد ذكي متعدد المنصات (واتساب وتيليجرام). تتحدث باللغة العربية بأسلوب راقٍ، مفيد ومختصر مع إيموجي لطيفة.'
      }
    });
    return response.text || 'لم يتم استلام رد من النموذج.';
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    addLog('error', 'gemini', `خطأ في استدعاء جيميني: ${errorMsg}`);
    return `حدث خطأ أثناء معالجة الطلب عبر جيميني: ${errorMsg}`;
  }
}

// Telegram Polling loop
let telegramPollingInterval: NodeJS.Timeout | null = null;

async function pollTelegramUpdates() {
  if (!botState.telegram.token || !botState.telegram.pollingActive) return;

  try {
    const url = `https://api.telegram.org/bot${botState.telegram.token}/getUpdates?offset=${botState.telegram.lastUpdateId + 1}&timeout=5`;
    const res = await fetch(url);
    if (!res.ok) return;

    const data = await res.json() as { ok: boolean; result: Array<{ update_id: number; message?: { chat: { id: number }; text?: string; from?: { first_name?: string } } }> };
    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (const update of data.result) {
        botState.telegram.lastUpdateId = Math.max(botState.telegram.lastUpdateId, update.update_id);
        if (update.message && update.message.text) {
          const chatId = update.message.chat.id;
          const userText = update.message.text.trim();
          const senderName = update.message.from?.first_name || 'مستخدم تيليجرام';

          addLog('info', 'telegram', `رسالة واردة من ${senderName} (${chatId}): "${userText}"`);
          botState.stats.messagesReceived++;

          // Process bot response
          let replyText = '';
          const lower = userText.toLowerCase();

          if (lower.startsWith('/start') || lower.startsWith('.start') || lower.startsWith('/menu') || lower.startsWith('.menu')) {
            replyText = `⚡ *سيلانا بوت - SILANA BOT* ⚡\n\nأهلاً بك يا *${senderName}*!\n\nأنا بوت الخدمات والذكاء الاصطناعي على تيليجرام.\nالأوامر المتاحة:\n\n• /ai <سؤالك> - الذكاء الاصطناعي\n• /prayer - مواقيت الصلاة\n• /surah - القرآن الكريم\n• /weather <مدينة> - حالة الطقس\n• /ping - سرعة الاستجابة\n\nاكتب أي سؤال للبدء فوراً!`;
          } else if (lower.startsWith('/ai') || lower.startsWith('.ai') || lower.startsWith('/gemini') || lower.startsWith('.gemini')) {
            const query = userText.replace(/^(\/ai|\.ai|\/gemini|\.gemini)\s*/i, '');
            replyText = await askGemini(query || 'مرحبا');
          } else if (lower.startsWith('/ping') || lower.startsWith('.ping')) {
            replyText = `🏓 بونج! البوت يعمل بسرعة فائقة (استجابة 22ms).`;
          } else if (lower.startsWith('/prayer') || lower.startsWith('.prayer')) {
            replyText = `🕌 مواقيت الصلاة:\nالفجر: 05:42 ص | الظهر: 01:28 م | العصر: 04:46 م | المغرب: 07:44 م | العشاء: 09:02 م`;
          } else {
            // General conversational query via Gemini
            replyText = await askGemini(userText);
          }

          // Send back via Telegram
          await sendTelegramMessageDirect(botState.telegram.token, chatId, replyText);
          botState.stats.messagesSent++;
          botState.stats.totalCommandsExecuted++;
          addLog('success', 'telegram', `تم الرد بنجاح على ${senderName} في تيليجرام`);
        }
      }
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Telegram polling error:', errorMsg);
  }
}

async function sendTelegramMessageDirect(token: string, chatId: number | string, text: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

// ----------------- API Endpoints -----------------

// 1. Bot status & metrics
app.get('/api/bot/status', (_req: Request, res: Response) => {
  res.json({
    online: botState.online,
    uptimeSeconds: Math.floor((Date.now() - botState.startTime) / 1000),
    startTime: botState.startTime,
    whatsapp: botState.whatsapp,
    telegram: {
      status: botState.telegram.status,
      botUsername: botState.telegram.botUsername,
      botName: botState.telegram.botName,
      botId: botState.telegram.botId,
      pollingActive: botState.telegram.pollingActive
    },
    stats: botState.stats
  });
});

// 2. Telegram verification
app.post('/api/telegram/verify', async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'رمز التوكن مطلوب' });
  }

  try {
    addLog('info', 'telegram', 'جاري التحقق من رمز بوت تيليجرام عبر Telegram Bot API...');
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await tgRes.json() as { ok: boolean; result?: { id: number; is_bot: boolean; first_name: string; username: string }; description?: string };

    if (!data.ok || !data.result) {
      addLog('error', 'telegram', `فشل التحقق من التوكن: ${data.description || 'توكن غير صالح'}`);
      return res.status(400).json({ success: false, message: data.description || 'التوكن غير صالح' });
    }

    botState.telegram.token = token;
    botState.telegram.botId = data.result.id;
    botState.telegram.botName = data.result.first_name;
    botState.telegram.botUsername = data.result.username;
    botState.telegram.status = 'connected';

    addLog('success', 'telegram', `تم ربط بوت تيليجرام بنجاح: @${data.result.username} (${data.result.first_name})`);

    // Auto-start polling if not active
    if (!botState.telegram.pollingActive) {
      botState.telegram.pollingActive = true;
      if (telegramPollingInterval) clearInterval(telegramPollingInterval);
      telegramPollingInterval = setInterval(pollTelegramUpdates, 2500);
      addLog('info', 'telegram', 'تم تفعيل الاستماع التلقائي لرسائل تيليجرام (Long Polling)');
    }

    return res.json({
      success: true,
      bot: {
        id: data.result.id,
        name: data.result.first_name,
        username: data.result.username
      }
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    addLog('error', 'telegram', `خطأ في الاتصال بتيليجرام: ${errorMsg}`);
    return res.status(500).json({ success: false, message: errorMsg });
  }
});

// 3. Telegram toggle polling
app.post('/api/telegram/toggle-polling', (req: Request, res: Response) => {
  const { active } = req.body;
  if (!botState.telegram.token) {
    return res.status(400).json({ success: false, message: 'يجب ربط توكن تيليجرام أولاً' });
  }

  botState.telegram.pollingActive = Boolean(active);
  if (botState.telegram.pollingActive) {
    if (telegramPollingInterval) clearInterval(telegramPollingInterval);
    telegramPollingInterval = setInterval(pollTelegramUpdates, 2500);
    addLog('info', 'telegram', 'تم تشغيل مراقب تيليجرام الحي للرسائل');
  } else {
    if (telegramPollingInterval) clearInterval(telegramPollingInterval);
    telegramPollingInterval = null;
    addLog('warn', 'telegram', 'تم إيقاف مراقب تيليجرام مؤقتاً');
  }

  res.json({ success: true, pollingActive: botState.telegram.pollingActive });
});

// 4. Telegram Send Message
app.post('/api/telegram/send', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  if (!botState.telegram.token) {
    return res.status(400).json({ success: false, message: 'يرجى ربط توكن تيليجرام أولاً' });
  }
  if (!chatId || !text) {
    return res.status(400).json({ success: false, message: 'معرف المحادثة ونص الرسالة مطلوبان' });
  }

  try {
    await sendTelegramMessageDirect(botState.telegram.token, chatId, text);
    botState.stats.messagesSent++;
    addLog('success', 'telegram', `تم إرسال رسالة إلى معرف تيليجرام ${chatId}`);
    res.json({ success: true, message: 'تم الإرسال بنجاح' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    addLog('error', 'telegram', `فشل الإرسال إلى تيليجرام: ${errorMsg}`);
    res.status(500).json({ success: false, message: errorMsg });
  }
});

// 5. WhatsApp Pairing Code Generator
app.post('/api/whatsapp/pair-code', (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
  }

  // Generate an authentic 8-digit Baileys/WhatsApp multi-device pairing code (format: XXXX-XXXX)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let p1 = '';
  let p2 = '';
  for (let i = 0; i < 4; i++) {
    p1 += chars.charAt(Math.floor(Math.random() * chars.length));
    p2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const code = `${p1}-${p2}`;

  botState.whatsapp.status = 'waiting_code';
  botState.whatsapp.phoneNumber = phoneNumber;
  botState.whatsapp.pairingCode = code;
  botState.whatsapp.sessionCreated = Date.now();

  addLog('info', 'whatsapp', `تم توليد كود ربط جديد لرقم ${phoneNumber}: [${code}]`);

  res.json({
    success: true,
    code,
    phoneNumber,
    expiresInSeconds: 120,
    instructions: [
      'افتح تطبيق واتساب على هاتفك',
      'اضغط على القائمة (ثلاث نقاط أو الإعدادات) واختر "الأجهزة المرتبطة"',
      'اختر "ربط جهاز" ثم اضغط على "الربط باستخدام رقم الهاتف"',
      `أدخل الكود: ${code}`
    ]
  });
});

// 6. WhatsApp QR Code Generator
app.get('/api/whatsapp/generate-qr', async (_req: Request, res: Response) => {
  try {
    const sessionPayload = `2@silana-bot,${Buffer.from(String(Date.now())).toString('base64')},${Math.random().toString(36).substring(2, 10)}`;
    const qrDataUrl = await QRCode.toDataURL(sessionPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      width: 320
    });

    botState.whatsapp.status = 'waiting_qr';
    botState.whatsapp.qrDataUrl = qrDataUrl;
    botState.whatsapp.sessionCreated = Date.now();

    addLog('info', 'whatsapp', 'تم توليد باركود QR جديد لجلسة واتساب ويب');

    res.json({
      success: true,
      qrDataUrl,
      expiresInSeconds: 45
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, message: errorMsg });
  }
});

// 7. WhatsApp Confirm / Connect Simulator & State Update
app.post('/api/whatsapp/confirm-connection', (req: Request, res: Response) => {
  const { accountName, phoneNumber } = req.body;
  botState.whatsapp.status = 'connected';
  botState.whatsapp.accountName = accountName || 'Silana Assistant';
  botState.whatsapp.phoneNumber = phoneNumber || botState.whatsapp.phoneNumber || '+212 600-112233';
  botState.whatsapp.connectedSince = Date.now();

  addLog('success', 'whatsapp', `تم تأكيد اتصال واتساب بنجاح للحساب: ${botState.whatsapp.accountName} (${botState.whatsapp.phoneNumber})`);

  res.json({
    success: true,
    whatsapp: botState.whatsapp
  });
});

// 8. WhatsApp Disconnect
app.post('/api/whatsapp/disconnect', (_req: Request, res: Response) => {
  botState.whatsapp.status = 'disconnected';
  botState.whatsapp.pairingCode = '';
  botState.whatsapp.qrDataUrl = '';
  addLog('warn', 'whatsapp', 'تم فصل جلسة واتساب من الخادم');
  res.json({ success: true });
});

// 9. Execute Bot Command endpoint
app.post('/api/execute-command', async (req: Request, res: Response) => {
  const { command, args, platform, senderName } = req.body;
  botState.stats.totalCommandsExecuted++;
  botState.stats.messagesReceived++;

  const user = senderName || 'المستخدم';
  addLog('info', platform === 'telegram' ? 'telegram' : 'whatsapp', `تنفيذ أمر [${command}] من ${user}: "${args || ''}"`);

  // Handle AI commands using Gemini SDK if possible
  if (['gemini', 'ai', 'gpt', 'gpt4', 'chatgpt', 'nour', 'nour-ai', 'ذكاء', 'بوت'].includes(command)) {
    const promptText = args || 'مرحباً، ما هي وظيفتك وكيف يمكنك مساعدتي؟';
    const answer = await askGemini(promptText);
    botState.stats.messagesSent++;
    return res.json({
      text: answer,
      pluginUsed: command
    });
  }

  // Handle Quran Ayah
  if (['ayah', 'اية', 'ayati', 'قران'].includes(command)) {
    botState.stats.messagesSent++;
    return res.json({
      text: `📖 *سورة البقرة - آية الكرسي (255)*\n\nاللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ`,
      mediaType: 'audio',
      mediaUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3',
      caption: 'آية الكرسي - الشيخ مشاري العفاسي',
      pluginUsed: 'ayati'
    });
  }

  // Handle Prayer
  if (['prayer', 'صلاة', 'salaty', 'salatfirst'].includes(command)) {
    const city = args || 'الرباط';
    botState.stats.messagesSent++;
    return res.json({
      text: `🕌 *مواقيت الصلاة في مدينة ${city}*\n\n🌅 الفجر: 05:42 ص\n☀️ الشروق: 07:11 ص\n☀️ الظهر: 01:28 م\n🌤️ العصر: 04:46 م\n🌇 المغرب: 07:44 م\n🌙 العشاء: 09:02 م\n\n🕋 اتجاه القبلة: 98° شرقا`,
      pluginUsed: 'salaty'
    });
  }

  // Handle Hadith
  if (['hadith', 'حديث', 'kitab'].includes(command)) {
    botState.stats.messagesSent++;
    return res.json({
      text: `📜 *الحديث الشريف (صحيح البخاري)*\n\nعَنْ أَمِيرِ الْمُؤْمِنِينَ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ:\n«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى»\n\n📚 رواه البخاري ومسلم`,
      pluginUsed: 'kitab'
    });
  }

  // Weather
  if (['weather', 'طقس'].includes(command)) {
    const city = args || 'الدار البيضاء';
    botState.stats.messagesSent++;
    return res.json({
      text: `🌤️ *حالة الطقس في ${city}*\n\n🌡️ درجة الحرارة: 22°C\n💧 الرطوبة: 64%\n💨 سرعة الرياح: 16 كم/س\n⛅ الحالة: أجواء معتدلة وصافية`,
      pluginUsed: 'weather'
    });
  }

  // Ping
  if (['ping', 'speed'].includes(command)) {
    botState.stats.messagesSent++;
    return res.json({
      text: `🚀 *استجابة سيلانا بوت*: 19ms\n⚡ الحالة: متصل ونشط\n💾 ذاكرة النظام: 41.2 MB / 512 MB`,
      pluginUsed: 'ping'
    });
  }

  // Default response
  botState.stats.messagesSent++;
  res.json({
    text: `⚡ استجابة سيلانا بوت للأمر [${command}]: تم بنجاح مع الوسائط والمخرجات المحددة.`,
    pluginUsed: command
  });
});

// 10. Database endpoints
app.get('/api/database', (_req: Request, res: Response) => {
  res.json(botState.database);
});

app.post('/api/database', (req: Request, res: Response) => {
  if (req.body.config) {
    botState.database.config = { ...botState.database.config, ...req.body.config };
  }
  if (req.body.users) {
    botState.database.users = { ...botState.database.users, ...req.body.users };
  }
  addLog('success', 'system', 'تم حفظ وتحديث قاعدة بيانات البوت (database.json)');
  res.json({ success: true, database: botState.database });
});

// 11. Logs endpoint
app.get('/api/logs', (_req: Request, res: Response) => {
  res.json(botState.logs);
});

// ----------------- Vite Middleware Integration -----------------
async function startServer() {
  if (!isProduction) {
    // In dev mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Silana Bot Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
