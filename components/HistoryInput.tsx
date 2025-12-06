import React from 'react';
import { Gamepad2, Skull, User, ShieldAlert, ArrowRight } from 'lucide-react';
import { Player, MatchRound } from '../types';

interface HistoryInputProps {
  players: Player[];
  history: MatchRound[];
  onHistoryChange: (roundId: string, opponentId: string) => void;
  userPlayer: Player;
}

export const HistoryInput: React.FC<HistoryInputProps> = ({ players, history, onHistoryChange, userPlayer }) => {
  const opponents = players.filter(p => !p.isUser);

  const getAvailableOpponents = (currentRoundId: string) => {
    const usedOpponentIds = new Set(
      history
        .filter(h => h.id !== currentRoundId && h.opponentId !== null)
        .map(h => h.opponentId)
    );
    return opponents.filter(op => !usedOpponentIds.has(op.id));
  };

  // Heuristic #6: Recognition rather than Recall
  // Find the first empty round to highlight it as the "Active Task"
  const firstEmptyIndex = history.findIndex(h => h.opponentId === null);

  return (
    <div className="relative rounded-3xl overflow-hidden border-4 border-kof-darkRed bg-kof-dark shadow-[0_0_20px_rgba(217,32,39,0.5)]">
      {/* Arcade Cabinet Top Header */}
      <div className="bg-gradient-to-b from-kof-red to-kof-darkRed p-4 border-b-4 border-kof-gold relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="flex items-center justify-between relative z-10">
           <div className="flex items-center gap-2">
              <div className="bg-black/50 p-2 rounded-full border border-kof-gold">
                <Gamepad2 size={20} className="text-kof-gold" />
              </div>
              <div>
                <h2 className="font-arcade text-2xl text-white tracking-widest text-shadow leading-none">BATTLE LOG</h2>
                <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-kof-gold/80">Record Your Fights</span>
              </div>
           </div>
           
           {/* Decorative Rights */}
           <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full ${i===3 ? 'bg-green-400 animate-pulse' : 'bg-red-900'}`}></div>)}
           </div>
        </div>
      </div>

      {/* Main Screen Area */}
      <div className="bg-[#1a0b10] p-4 space-y-4 h-[500px] overflow-y-auto custom-scrollbar relative">
        {/* Background Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900 via-transparent to-transparent"></div>

        {history.map((round, index) => {
          const isFilled = round.opponentId !== null;
          const isActive = index === firstEmptyIndex;
          const availableOpponents = getAvailableOpponents(round.id);
          const currentOpponent = opponents.find(op => op.id === round.opponentId);

          return (
            <div key={round.id} className="relative group perspective-1000">
              
              {/* Card Container */}
              <div className={`
                relative bg-gradient-to-r from-gray-900 to-black rounded-xl overflow-hidden shadow-lg transition-all
                ${isActive ? 'border-2 border-kof-gold shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-[1.02]' : 'border-2 border-gray-700 hover:scale-[1.01]'}
              `}>
                
                {/* Active Indicator (Heuristic #6) */}
                {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-kof-gold z-30 animate-pulse"></div>
                )}

                {/* VS Background Strip */}
                <div className="absolute top-1/2 left-0 right-0 h-1/2 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"></div>

                <div className="flex items-stretch h-20">
                  
                  {/* LEFT SIDE: PLAYER (YOU) - BLUE THEME */}
                  <div className="flex-1 relative bg-gradient-to-r from-blue-900/40 to-transparent border-r border-white/10 flex items-center pl-2 md:pl-4 overflow-hidden">
                     {/* Blue Glow Decoration */}
                     <div className="absolute -left-4 top-0 bottom-0 w-8 bg-blue-500/20 blur-xl"></div>
                     
                     <div className="flex flex-col relative z-10 w-full">
                        <span className="text-[9px] text-cyan-300 font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                           <User size={8} /> 1P (YOU)
                        </span>
                        <div className="font-display font-bold text-xl md:text-2xl text-white italic tracking-wide text-shadow-sm truncate">
                           {userPlayer.name || "COMMANDER"}
                        </div>
                        {/* HP Bar Decoration */}
                        <div className="w-16 h-1.5 bg-gray-800 rounded-sm mt-1 skew-x-[-20deg] overflow-hidden border border-blue-500/30">
                           <div className="h-full bg-cyan-400 w-full"></div>
                        </div>
                     </div>
                  </div>

                  {/* CENTER: VS BADGE */}
                  <div className="w-16 md:w-20 relative flex items-center justify-center z-20">
                     {/* Slanted Shape */}
                     <div className={`
                        absolute inset-0 transform -skew-x-12 border-x-2 border-white shadow-lg flex items-center justify-center overflow-hidden
                        ${isActive ? 'bg-kof-gold animate-pulse-glow' : 'bg-gray-600 grayscale'}
                     `}>
                        <div className={`absolute inset-0 bg-gradient-to-b ${isActive ? 'from-yellow-300 via-yellow-500 to-orange-500' : 'from-gray-500 to-gray-800'}`}></div>
                        <span className="relative z-10 font-arcade text-black text-xl md:text-2xl font-black">{round.label}</span>
                        {/* Shine */}
                        <div className="absolute top-0 -left-10 w-10 h-full bg-white/40 transform skew-x-12 animate-shine"></div>
                     </div>
                  </div>

                  {/* RIGHT SIDE: OPPONENT (SELECT) - RED THEME */}
                  <div className={`flex-1 relative flex items-center pr-2 md:pr-4 justify-end border-l border-white/10 transition-colors ${isFilled ? 'bg-gradient-to-l from-red-900/40 to-transparent' : 'bg-transparent'}`}>
                     
                     {/* Red Glow Decoration */}
                     {isFilled && <div className="absolute -right-4 top-0 bottom-0 w-8 bg-red-500/20 blur-xl"></div>}

                     <div className="flex flex-col items-end relative z-10 w-full">
                        <span className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1 ${isActive ? 'text-white animate-pulse' : 'text-red-300'}`}>
                           {isActive && <ArrowRight size={10} />} OPPONENT <Skull size={10} className="ml-1 inline" />
                        </span>
                        
                        <div className="relative w-full max-w-[140px]">
                            <select
                                className={`
                                    w-full appearance-none outline-none font-display font-bold text-xl md:text-2xl italic tracking-wide text-right cursor-pointer bg-transparent
                                    transition-colors
                                    ${isFilled ? 'text-white text-shadow-sm' : 'text-gray-400 hover:text-white'}
                                `}
                                value={round.opponentId || ''}
                                onChange={(e) => onHistoryChange(round.id, e.target.value)}
                                style={{ colorScheme: 'dark', direction: 'rtl' }}
                            >
                                <option value="" className="bg-gray-900 text-gray-500">SELECT ENEMY</option>
                                {availableOpponents.map(op => (
                                <option key={op.id} value={op.id} className="bg-gray-900 text-white text-left">
                                    {op.name || `P${op.id} CPU`}
                                </option>
                                ))}
                                {round.opponentId && !availableOpponents.find(op => op.id === round.opponentId) && (
                                <option value={round.opponentId} className="bg-gray-900 text-white text-left">
                                    {currentOpponent?.name || "Unknown"}
                                </option>
                                )}
                            </select>
                        </div>

                         {/* Power Bar Decoration (Opponent) */}
                        <div className="w-16 h-1.5 bg-gray-800 rounded-sm mt-1 skew-x-[20deg] overflow-hidden border border-red-500/30 flex justify-end">
                           <div className={`h-full bg-red-500 transition-all duration-300 ${isFilled ? 'w-full' : 'w-0'}`}></div>
                        </div>
                     </div>
                  </div>

                </div>
              </div>
              
              {/* Connector Line (Decoration) */}
              {parseInt(round.id.split('-')[1]) < 6 && (
                  <div className={`h-2 w-0.5 mx-auto transition-colors ${isFilled ? 'bg-red-900' : 'bg-gray-800 opacity-50'}`}></div>
              )}
            </div>
          );
        })}

        {/* Bottom Decoration */}
        <div className="text-center mt-6 opacity-30">
            <div className="inline-block px-4 py-1 border border-white rounded-full text-[10px] tracking-[0.3em] font-sans">
                READY FOR BATTLE
            </div>
        </div>
      </div>
    </div>
  );
};
