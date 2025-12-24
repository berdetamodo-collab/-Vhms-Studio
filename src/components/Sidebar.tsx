import React from 'react';
import { GenerateIcon, HistoryIcon, ChatIcon, ShieldCheckIcon } from './icons/Icons';
import { LogicLog } from './LogicLog';
import { ApiStatus } from '../types';

type ActiveView = 'generation' | 'history' | 'chat';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  isOpen: boolean;
  logEntries: any[];
  onRunDiagnostic: () => void;
  apiStatus: ApiStatus;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, isOpen, logEntries, onRunDiagnostic, apiStatus }) => {
  const navItems = [
    { id: 'generation', label: 'Generation Deck', icon: GenerateIcon, color: 'text-amber-400' },
    { id: 'history', label: 'Asset Gallery', icon: HistoryIcon, color: 'text-sky-400' },
    { id: 'chat', label: 'VHMS Assistant', icon: ChatIcon, color: 'text-purple-400' },
  ] as const;

  return (
    <aside className={`fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800/80 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} shadow-2xl overflow-hidden flex flex-col`}>
      {/* Brand Section */}
      <div className="h-16 flex items-center gap-3 px-5 bg-slate-950/40 backdrop-blur-md border-b border-slate-800/60 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
              <span className="font-black text-slate-900 text-xl italic">V</span>
          </div>
          <div className="flex flex-col">
              <h1 className="font-black text-sm tracking-widest text-slate-100 uppercase">
                  <span className="text-amber-500">VHMS</span> STUDIO
              </h1>
              <span className="text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase">v13.1 Stable</span>
          </div>
      </div>
      
      {/* Navigation Section */}
      <nav className="p-3 space-y-1.5 border-b border-slate-800/40">
        {navItems.map(item => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-slate-800/80 text-white border border-slate-700/50 shadow-inner'
                    : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                    <item.icon className={`w-4.5 h-4.5 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-400'}`} />
                    <span>{item.label}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')} shadow-[0_0_8px_currentColor]`}></div>}
              </button>
            );
        })}
      </nav>

      {/* Engine Console Section */}
      <div className="flex-grow flex flex-col p-4 min-h-0 bg-slate-950/20">
          <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Engine Matrix</span>
              <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                  <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              </div>
          </div>
          <div className="flex-grow mb-4">
               <LogicLog entries={logEntries} />
          </div>
          
          <button 
              onClick={onRunDiagnostic}
              disabled={apiStatus === 'PENDING'}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border transition-all active:scale-95 group ${
                  apiStatus === 'PENDING' 
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-slate-900 border-slate-800 text-amber-500/80 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500'
              }`}
          >
              <ShieldCheckIcon className={`w-4 h-4 ${apiStatus === 'PENDING' ? 'animate-spin opacity-50' : 'group-hover:rotate-12 transition-transform'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">S.A.F.E. Test</span>
          </button>
      </div>

      {/* System Integrity Footer */}
      <div className="p-4 flex flex-col gap-2.5 border-t border-slate-800/60 bg-slate-950/60 backdrop-blur-lg">
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
              <span className="uppercase tracking-widest">Core Integrity</span>
              <span className="text-emerald-500 font-mono">100% ONLINE</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full w-full opacity-80 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          </div>
      </div>
    </aside>
  );
};