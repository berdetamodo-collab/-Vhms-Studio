
import React, { useEffect, useRef } from 'react';

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'system' | 'ai' | 'success' | 'warn';
}

interface LogicLogProps {
    entries: LogEntry[];
}

export const LogicLog: React.FC<LogicLogProps> = ({ entries }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries]);

    return (
        <div className="flex flex-col h-full bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden shadow-inner">
            <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">VHMS Engine Console</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
            </div>
            <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-3 font-mono text-[10px] space-y-1.5 custom-scrollbar scroll-smooth"
            >
                {entries.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-700 italic">
                        Menunggu inisialisasi...
                    </div>
                ) : (
                    entries.map((entry, i) => (
                        <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                            <span className="text-slate-600 shrink-0">[{entry.timestamp}]</span>
                            <span className={`break-words ${
                                entry.type === 'ai' ? 'text-cyan-400' : 
                                entry.type === 'success' ? 'text-green-400' : 
                                entry.type === 'warn' ? 'text-amber-400' : 
                                'text-slate-400'
                            }`}>
                                {entry.type === 'ai' && <span className="mr-1">◈</span>}
                                {entry.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
            `}</style>
        </div>
    );
};
