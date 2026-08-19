import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  MessageSquare, 
  RefreshCw, 
  Trash2, 
  Info,
  ChevronDown
} from 'lucide-react';
import { askMuniBot } from '../services/api';
import { Truck, Zone } from '../types';

interface CitizenChatAssistantProps {
  trucks: Truck[];
  zones: Zone[];
  userAddress?: string;
  userZone?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export const CitizenChatAssistant: React.FC<CitizenChatAssistantProps> = ({
  trucks,
  zones,
  userAddress = 'Liberty Bell Way',
  userZone = 'Ward 1 - Old Town',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `Hello! I'm MuniBot, your AI municipal waste tracking assistant. Ask me about truck arrival times on your street, hazardous waste rules, or today's collection progress!`,
      timestamp: '09:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const suggestedQuestions = [
    'When will the truck arrive on Liberty Bell Way?',
    'What waste bins go out today in Ward 1?',
    'How do I dispose of old paint and batteries?',
    'Why is the truck delayed in Downtown?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const activeTruck = trucks.find((t) => t.currentZoneId === 'ward-1') || trucks[0];
      const answer = await askMuniBot({
        question: textToSend,
        userAddress,
        userZone,
        activeTruckInfo: {
          code: activeTruck.code,
          name: activeTruck.name,
          currentStreet: activeTruck.currentStreet,
          status: activeTruck.status,
          speedKmh: activeTruck.speedKmh,
          stopsCompleted: activeTruck.stopsCompleted,
          totalStops: activeTruck.totalStops,
        },
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="btn-open-munibot"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-purple-400/40 transition-transform hover:scale-105"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">Ask MuniBot AI</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border border-purple-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] text-white animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 border-b border-purple-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  MuniBot
                  <span className="text-[10px] bg-purple-400/20 text-purple-300 px-1.5 py-0.2 rounded font-semibold">
                    Gemini AI
                  </span>
                </h4>
                <p className="text-[11px] text-purple-200/80">Civic waste & route timing assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-purple-800/50"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-lg bg-purple-900 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{m.text}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block text-right font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-purple-300">
                <div className="w-6 h-6 rounded-lg bg-purple-900 text-purple-300 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-300">
                  MuniBot is checking live GPS telemetry...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about timings, bins, or rules..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl disabled:opacity-50 transition-colors shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
