import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCheck, Bot, Sparkles } from 'lucide-react';

interface SupportMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportMessagesModal: React.FC<SupportMessagesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Quotex Signals',
      text: '📈 EUR/CHF OTC: Strong Bullish momentum detected. 85% payout active.',
      time: '13:40',
      isBot: true
    },
    {
      id: 2,
      sender: 'Bonus Desk',
      text: '🎉 Claim 50% bonus on your offline deposits today using code BONUS50!',
      time: '13:42',
      isBot: true
    },
    {
      id: 3,
      sender: 'Quotex VIP',
      text: '⚡ Smart Engine is ON: UP trade drives candle green, DOWN trade drives candle red.',
      time: '13:45',
      isBot: true
    },
    {
      id: 4,
      sender: 'Support Desk',
      text: '👋 Welcome to Quotex Pro! How can we assist your binary trading today?',
      time: '13:48',
      isBot: true
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'You',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isBot: false
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'Quotex Assistant',
          text: 'Thank you for your message! All offline deposits, withdrawals, and UP/DOWN candle mechanics are fully active.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isBot: true
        }
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm bg-[#111723] border border-[#232f45] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[75vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f2a3d] bg-[#141b29]">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            Support & Signals (4)
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isBot ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  m.isBot
                    ? 'bg-[#18212f] text-slate-200 border border-[#253246]'
                    : 'bg-cyan-600 text-white'
                }`}
              >
                <div className="text-[10px] font-bold text-cyan-400 mb-0.5">
                  {m.sender}
                </div>
                <p className="leading-relaxed">{m.text}</p>
                <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                  <span>{m.time}</span>
                  {!m.isBot && <CheckCheck className="w-3 h-3 text-cyan-200" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-[#0d121a] border-t border-[#1e2738] flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a question..."
            className="flex-1 bg-[#141b26] border border-[#253246] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
