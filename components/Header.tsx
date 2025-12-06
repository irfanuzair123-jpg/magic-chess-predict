import React from 'react';
import { Flame, Gamepad2 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="relative py-8 md:py-12 flex flex-col items-center justify-center text-center z-30">
      
      {/* Top Decoration Line */}
      <div className="w-full max-w-lg h-1 bg-gradient-to-r from-transparent via-kof-gold to-transparent mb-4 opacity-50"></div>

      <div className="flex flex-col items-center relative group cursor-default transform hover:scale-105 transition-transform duration-300">
        
        {/* Main Title Layered */}
        <div className="relative z-10 mb-2">
          <h1 className="text-5xl md:text-7xl font-arcade italic font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 text-stroke-lg tracking-widest relative z-20">
            MAGIC CHESS
          </h1>
          <h1 className="text-5xl md:text-7xl font-arcade italic font-black text-kof-darkRed absolute top-1 left-1 -z-10 tracking-widest blur-[1px]">
            MAGIC CHESS
          </h1>
        </div>

        {/* Subtitle Banner - Increased Z-Index to 30 to sit ON TOP of title shadow */}
        <div className="relative mt-4 z-30">
          <div className="absolute inset-0 bg-kof-red transform skew-x-[-20deg] blur-md opacity-50"></div>
          <div className="bg-gradient-to-r from-kof-red to-kof-orange px-8 py-1 transform skew-x-[-20deg] border-2 border-white shadow-[0_0_15px_rgba(255,140,0,0.6)]">
             <span className="block transform skew-x-[20deg] font-display font-bold text-2xl md:text-4xl text-white tracking-[0.3em] drop-shadow-md">
               FIGHTERS PREDICT
             </span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-3 text-kof-gold font-sans font-bold tracking-widest text-sm uppercase bg-black/40 px-4 py-1 rounded-full border border-kof-gold/30 shadow-lg backdrop-blur-sm">
        <Flame size={16} className="text-orange-500 fill-orange-500 animate-pulse" />
        <span className="text-shadow">Season 4: Rising Stars</span>
        <Gamepad2 size={16} className="text-orange-500" />
      </div>
    </div>
  );
};
