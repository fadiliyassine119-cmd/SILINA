/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { WhatsAppConnect } from './components/WhatsAppConnect';
import { TelegramConnect } from './components/TelegramConnect';
import { ChatSandbox } from './components/ChatSandbox';
import { PluginsManager } from './components/PluginsManager';
import { LiveLogs } from './components/LiveLogs';
import { DatabaseConfig } from './components/DatabaseConfig';
import { BotStatus } from './types/bot';
import { 
  Cpu, MessageSquare, Send, Bot, Layers, Terminal, Database, 
  Menu, X 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchBotStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Backend status fetch warning, running with local state', err);
      // Fallback default state
      setStatus({
        online: true,
        uptimeSeconds: 1420,
        startTime: Date.now() - 1420000,
        whatsapp: {
          status: 'disconnected',
          phoneNumber: '+212 655443322',
          accountName: 'Silana Assistant',
          platform: 'baileys-multi-device'
        },
        telegram: {
          status: 'disconnected',
          pollingActive: false
        },
        stats: {
          totalCommandsExecuted: 142,
          messagesReceived: 389,
          messagesSent: 412,
          activeUsers: 84,
          activeGroups: 12,
          errorsCount: 0
        }
      });
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'لوحة القيادة', icon: Cpu },
    { id: 'whatsapp', label: 'ربط واتساب', icon: MessageSquare },
    { id: 'telegram', label: 'ربط تيليجرام', icon: Send },
    { id: 'chat', label: 'المحادثة الحية', icon: Bot },
    { id: 'plugins', label: 'الأوامر والإضافات', icon: Layers },
    { id: 'logs', label: 'السجلات', icon: Terminal },
    { id: 'database', label: 'الإعدادات', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Bar Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }} 
        status={status} 
      />

      {/* Mobile Navigation Trigger Strip */}
      <div className="lg:hidden flex items-center justify-between px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <span className="font-semibold text-slate-300">
          {navItems.find(n => n.id === activeTab)?.label || 'لوحة القيادة'}
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-emerald-400' 
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            status={status} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onRefresh={fetchBotStatus}
            isLoading={isLoadingStatus}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppConnect 
            status={status} 
            onStatusUpdate={fetchBotStatus} 
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramConnect 
            status={status} 
            onStatusUpdate={fetchBotStatus} 
          />
        )}

        {activeTab === 'chat' && (
          <ChatSandbox />
        )}

        {activeTab === 'plugins' && (
          <PluginsManager />
        )}

        {activeTab === 'logs' && (
          <LiveLogs />
        )}

        {activeTab === 'database' && (
          <DatabaseConfig />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-900/60 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            سيلانا بوت © {new Date().getFullYear()} · Silana Bot Master Platform
          </span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Baileys Multi-Device</span>
            <span>·</span>
            <span>Telegram Bot API</span>
            <span>·</span>
            <span>Google Gemini Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
