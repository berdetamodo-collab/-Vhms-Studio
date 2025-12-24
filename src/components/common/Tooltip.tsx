import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-b-4 border-b-slate-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900',
  };

  return (
    <div className="relative flex items-center" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className={`absolute ${positionClasses[position]} w-48 sm:w-64 p-2 bg-slate-900 text-white text-[10px] sm:text-xs rounded-md shadow-xl z-[60] border border-slate-700 pointer-events-none animate-fade-in text-center leading-relaxed`}>
          {text}
          <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95) translate(var(--tw-translate-x), var(--tw-translate-y)); } to { opacity: 1; transform: scale(1) translate(var(--tw-translate-x), var(--tw-translate-y)); } } .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }`}</style>
    </div>
  );
};
