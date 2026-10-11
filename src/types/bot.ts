/**
 * Core type definitions for Silana Bot Web Platform
 */

export type Platform = 'whatsapp' | 'telegram';

export interface BotStatus {
  online: boolean;
  uptimeSeconds: number;
  startTime: number;
  whatsapp: {
    status: 'connected' | 'connecting' | 'waiting_qr' | 'waiting_code' | 'disconnected';
    phoneNumber?: string;
    accountName?: string;
    pushName?: string;
    batteryLevel?: number;
    lastPing?: number;
    platform: string;
  };
  telegram: {
    status: 'connected' | 'connecting' | 'disconnected';
    botUsername?: string;
    botName?: string;
    botId?: number;
    pollingActive: boolean;
    webhookUrl?: string;
    pendingUpdates?: number;
  };
  stats: {
    totalCommandsExecuted: number;
    messagesReceived: number;
    messagesSent: number;
    activeUsers: number;
    activeGroups: number;
    errorsCount: number;
  };
}

export interface BotPlugin {
  id: string;
  name: string;
  arabicName: string;
  category: 'ai' | 'download' | 'islamic' | 'stickers' | 'tools' | 'group' | 'owner';
  categoryArabic: string;
  command: string;
  aliases: string[];
  description: string;
  arabicDescription: string;
  usage: string;
  enabled: boolean;
  isOwnerOnly: boolean;
  isGroupOnly: boolean;
  isMedia: boolean;
  originalFile: string;
  sampleArgs?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  platform: Platform;
  senderName: string;
  senderNumber?: string;
  timestamp: number;
  text: string;
  mediaType?: 'image' | 'audio' | 'video' | 'sticker' | 'document';
  mediaUrl?: string;
  caption?: string;
  status?: 'sent' | 'delivered' | 'read';
  commandUsed?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  platform: 'system' | 'whatsapp' | 'telegram' | 'gemini';
  message: string;
  details?: Record<string, unknown>;
}

export interface BotDatabaseUser {
  id: string;
  name: string;
  number: string;
  exp: number;
  coins: number;
  level: number;
  premium: boolean;
  banned: boolean;
  warns: number;
  lastCommand: string;
  registeredAt: string;
}

export interface BotConfig {
  botName: string;
  ownerNumber: string;
  ownerName: string;
  prefix: string;
  autoRead: boolean;
  antiCall: boolean;
  welcomeMessage: string;
  byeMessage: string;
  language: 'ar' | 'en';
  geminiModel: string;
}
