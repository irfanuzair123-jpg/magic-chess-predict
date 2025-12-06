import React, { useState, useEffect } from 'react';
import { Users, Trash2, Crown, AlertCircle } from 'lucide-react';
import { Player } from '../types';

interface PlayerInputGridProps {
  players: Player[];
  onNameChange: (id: number, name: string) => void;
  onReset: () => void;
}

export const PlayerInputGrid: React.FC<PlayerInputGridProps> = ({ players, onNameChange, onReset }) => {
  // Heuristic #5: Error Prevention
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (confirmReset) {
      const timer = setTimeout(() => setConfirmReset(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmReset]);

  const handleResetClick = () => {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="arcade-card p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #D92027 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
            <div className="bg-kof-gold text-black font-arcade text-xs px-2 py-1 rounded skew-x-[-10deg]">
                <span className="block skew-x-[10deg]">SELECT FIGHTERS</span>
            </div>
        </div>
        
        <button
          onClick={handleResetClick}
          className={`
            text-xs font-bold tracking-widest transition-all flex items-center gap-2 uppercase px-3 py-1 rounded border
            ${confirmReset 
              ? 'bg-red-600 text-white border-red-400 animate-pulse' 
              : 'text-white/70 hover:text-white bg-red-900/50 hover:bg-red-600 border-red-500/50'
            }
          `}
        >
          {confirmReset ? <AlertCircle size={12} /> : <Trash2 size={12} />}
          {confirmReset ? "CONFIRM RESET?" : "Reset Slots"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {players.map((player) => (
          <div key={player.id} className="relative group">
             {/* Slot Header */}
            <div className={`
              flex justify-between items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border-t-2 border-l-2 border-r-2 rounded-t-lg
              ${player.isUser 
                ? 'bg-kof-gold border-white text-black' 
                : 'bg-kof-panel border-gray-600 text-gray-400'
              }
            `}>
              <span>{player.isUser ? '1P (YOU)' : `${player.id}P CPU`}</span>
              {player.isUser && <Crown size={10} className="fill-black" />}
            </div>
            
            {/* Input Container */}
            <div className={`
                relative p-1 border-2 border-t-0 rounded-b-lg transition-colors
                ${player.isUser 
                    ? 'bg-kof-gold/10 border-white shadow-[0_0_10px_rgba(255,215,0,0.3)]' 
                    : 'bg-black/40 border-gray-600 group-hover:border-kof-red/50'
                }
            `}>
              <input
                type="text"
                value={player.name}
                onChange={(e) => onNameChange(player.id, e.target.value)}
                placeholder={player.isUser ? "YOUR NAME" : "EMPTY SLOT"}
                className={`
                  w-full px-3 py-3 bg-black/60 outline-none font-bold text-lg font-sans uppercase tracking-wider text-center rounded
                  placeholder:text-gray-700
                  ${player.isUser 
                    ? 'text-kof-gold placeholder:text-kof-gold/30' 
                    : 'text-white focus:text-kof-red focus:bg-white/10'
                  }
                `}
              />
              
              {/* Special Instruction for P1 */}
              {player.isUser && player.name === '' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="text-[10px] text-kof-gold/70 font-sans tracking-tight animate-pulse bg-black/80 px-1 rounded">
                          ENTER COMMANDER NAME
                      </span>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
