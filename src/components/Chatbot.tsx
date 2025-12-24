import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatbotRole, ChatModel, FileWithPreview } from '../types';
import { BotIcon, SendIcon, PaperclipIcon, GoogleIcon, UserIcon, ChevronDown, XCircleIcon } from './icons/Icons';

interface ChatbotProps {
  history: ChatMessage[];
  onSend: (message: string, image: FileWithPreview | null, role: ChatbotRole, model: ChatModel) => void;
  roles: ChatbotRole[];
  models: { id: ChatModel, name: string }[];
}

export const Chatbot: React.FC<ChatbotProps> = ({ history, onSend, roles, models }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<FileWithPreview | null>(null);
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>(roles[0]);
  const [selectedModel, setSelectedModel] = useState<ChatModel>(models[1].id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = () => {
    if ((message.trim() || image) && !history.some(m => m.isLoading)) {
      onSend(message, image, selectedRole, selectedModel);
      setMessage('');
      setImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fileWithPreview = Object.assign(file, { preview: URL.createObjectURL(file) });
      setImage(fileWithPreview);
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex-shrink-0 p-3 bg-slate-800 rounded-t-xl border-b border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><BotIcon className="w-5 h-5 text-amber-400" /> VHMS Assistant</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="relative flex-1">
            <select value={selectedRole.id} onChange={(e) => setSelectedRole(roles.find(r => r.id === e.target.value) || roles[0])} className="w-full appearance-none bg-slate-900 border border-slate-600 rounded-md px-2 py-1.5 pr-7 text-slate-300 focus:outline-none focus:border-amber-500">
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
          <div className="relative flex-1">
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value as ChatModel)} className="w-full appearance-none bg-slate-900 border border-slate-600 rounded-md px-2 py-1.5 pr-7 text-slate-300 focus:outline-none focus:border-amber-500">
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-3 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {history.map(msg => (
            <div key={msg.id} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0"><BotIcon className="w-4 h-4 text-amber-400"/></div>}
              <div className={`p-3 rounded-xl max-w-[80%] ${msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                {msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-2 max-h-40"/>}
                {msg.imageUrl && <img src={msg.imageUrl} alt="AI generated" className="rounded-lg my-2 max-h-64"/>}
                {msg.isLoading ? (
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div></div>
                ) : (
                  msg.text && <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                )}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700">
                    <h4 className="text-xs font-bold text-slate-400 mb-1 flex items-center gap-1.5"><GoogleIcon/> Sources:</h4>
                    <div className="flex flex-col gap-1.5 text-xs">
                      {msg.groundingChunks.map((chunk, i) => (
                        <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">{chunk.web.title || chunk.web.uri}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {msg.role === 'user' && <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0"><UserIcon className="w-4 h-4 text-slate-300"/></div>}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-3 bg-slate-800 rounded-b-xl border-t border-slate-700">
        {image && (
          <div className="relative mb-2 w-20 h-20">
            <img src={image.preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
            <button onClick={() => setImage(null)} className="absolute -top-1.5 -right-1.5 bg-slate-900 rounded-full p-0.5"><XCircleIcon className="w-5 h-5 text-red-400"/></button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-600 rounded-lg p-1.5">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-amber-400"><PaperclipIcon className="w-5 h-5"/></button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan atau unggah gambar..."
            rows={1}
            className="flex-grow bg-transparent text-sm text-slate-200 resize-none outline-none max-h-24"
          />
          <button onClick={handleSend} disabled={history.some(m => m.isLoading)} className="p-2 bg-amber-600 text-white rounded-md hover:bg-amber-500 disabled:bg-slate-600"><SendIcon className="w-5 h-5"/></button>
        </div>
      </div>
    </div>
  );
};
