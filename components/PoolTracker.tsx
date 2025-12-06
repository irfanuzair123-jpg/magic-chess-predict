import React from 'react';
import { Skull, Shield, CheckCircle2 } from 'lucide-react';
import { Player, MatchRound } from '../types';

interface PoolTrackerProps {
  players: Player[];
  history: MatchRound[];
}

export const PoolTracker: React.FC<PoolTrackerProps> = ({ players, history }) => {
  const opponents = players.filter(p => !p.isUser);
  const foughtIds = new Set(history.filter(h => h.opponentId !== null).map(h => h.opponentId));
  
  const totalCount = opponents.length;
  const foughtCount = foughtIds.size;
  const remainingCount = totalCount - foughtCount;

  return (
    <div className="bg-gradient-to-r from-kof-darkRed via-kof-panel to-kof-panel p-1 rounded-xl border-2 border-kof-gold shadow-lg">
      <div className="bg-black/40 rounded-lg p-4">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="w-1 h-6 bg-kof-red"></div>
             <h2 className="font-arcade text-xl text-white text-stroke tracking-wider">THREAT CYCLE</h2>
          </div>
          
          <div className="bg-black/60 px-3 py-1 rounded border border-white/20">
             <span className="text-xs text-kof-gold font-bold uppercase tracking-widest">
                Remaining: <span className="text-white text-lg">{remainingCount}</span>
             </span>
          </div>
        </div>

        {/* Character Strips */}
        <div className="flex flex-wrap gap-2 justify-center">
            {opponents.map((opp) => {
            const isFought = foughtIds.has(opp.id);
            return (
                <div 
                key={opp.id}
                className={`
                    relative group w-14 h-14 sm:w-16 sm:h-16 flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-300 overflow-hidden
                    ${isFought 
                    ? 'bg-gray-900 border-gray-700 opacity-50 grayscale' 
                    : 'bg-gradient-to-b from-purple-900 to-black border-kof-red shadow-[0_0_10px_rgba(217,32,39,0.4)] scale-100'
                    }
                `}
                >
                <div className="absolute top-0 right-0 p-0.5">
                    {isFought && <CheckCircle2 size={12} className="text-green-500 fill-green-900" />}
                </div>

                {isFought ? (
                    <Skull size={20} className="text-gray-500 mb-1" />
                ) : (
                    <Shield size={20} className="text-kof-orange mb-1 animate-bounce-sm" />
                )}
                
                <span className={`text-[9px] font-bold uppercase truncate max-w-full px-1 text-center font-sans leading-none ${isFought ? 'text-gray-500' : 'text-white'}`}>
                    {opp.name || `P${opp.id}`}
                </span>
                
                {/* Shine effect for active */}
                {!isFought && <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors"></div>}
                </div>
            );
            })}
        </div>
        
        {/* HP Bar Style Progress */}
        <div className="w-full h-3 bg-gray-900 rounded-full mt-4 border border-gray-700 overflow-hidden relative">
            <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-500 relative" 
                style={{ width: `${(foughtCount / totalCount) * 100}%` }}
            >
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50"></div>
            </div>
        </div>

      </div>
    </div>
  );
};
