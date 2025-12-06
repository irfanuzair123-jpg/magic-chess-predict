import React from 'react';
import { Trophy, AlertTriangle, Crosshair } from 'lucide-react';
import { PredictionScenario } from '../types';

interface ResultsViewProps {
  scenarios: PredictionScenario[];
  isLoading: boolean;
  error: string | null;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ scenarios, isLoading, error }) => {
  if (error) {
    return (
      <div className="bg-red-900/80 border-2 border-red-500 p-6 text-center text-white rounded-xl animate-bounce-sm">
        <AlertTriangle className="w-12 h-12 mb-2 mx-auto text-yellow-400" />
        <h3 className="font-arcade text-2xl uppercase text-shadow">SYSTEM ERROR</h3>
        <p className="font-sans font-bold tracking-wide">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-black/80 border-4 border-kof-gold p-8 relative overflow-hidden flex flex-col items-center justify-center h-64 rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.3)]">
        {/* Shine Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
        
        <Crosshair className="w-20 h-20 text-kof-red animate-spin-slow mb-6" style={{ animationDuration: '3s' }} />
        <h3 className="text-3xl font-arcade italic font-black text-white uppercase tracking-widest text-stroke-lg animate-pulse">
          MATCHING...
        </h3>
        <div className="w-48 h-2 bg-gray-800 rounded-full mt-4 overflow-hidden border border-white/20">
             <div className="h-full bg-kof-gold animate-[width_1s_ease-in-out_infinite]" style={{width: '50%'}}></div>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) return null;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px w-12 bg-kof-gold"></div>
        <Trophy className="text-kof-gold fill-kof-gold" size={24} />
        <h2 className="font-arcade text-3xl font-bold text-white uppercase tracking-widest text-stroke">DESTINED MATCHES</h2>
        <div className="h-px w-12 bg-kof-gold"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((scenario, index) => (
          <div 
            key={index} 
            className="relative bg-gradient-to-b from-kof-purple to-black border-4 border-double border-kof-gold rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Banner */}
            <div className="bg-gradient-to-r from-kof-red to-red-900 py-2 px-4 text-center border-b-2 border-kof-gold">
               <span className="font-display font-bold text-xl text-white uppercase tracking-[0.2em] text-shadow">
                 {scenario.scenarioName}
               </span>
            </div>

            <div className="p-4 space-y-2">
              {scenario.matches.map((match, mIndex) => {
                const isOpponentSet = match.opponentName && !match.opponentName.includes("Player");
                return (
                  <div key={mIndex} className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/5 hover:border-kof-orange/50 transition-colors">
                    {/* Round Badge */}
                    <div className="bg-gray-800 text-white font-bold text-xs px-2 py-1 rounded font-mono border border-gray-600">
                        {match.round}
                    </div>

                    <div className="text-kof-red font-black text-[10px] mx-2">VS</div>

                    {/* Opponent Name */}
                    <div className={`flex-1 text-right font-display font-bold text-lg uppercase tracking-wide truncate ${isOpponentSet ? 'text-kof-gold text-shadow' : 'text-gray-500'}`}>
                      {match.opponentName}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-kof-red/20 to-transparent pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
