import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Zap, ChevronDown, ShieldAlert, ArrowLeft, Info, X, LogOut, Settings, MessageCircle, Send, ShieldCheck, Key } from 'lucide-react';

import { Header } from './components/Header';
import { PlayerInputGrid } from './components/PlayerInputGrid';
import { HistoryInput } from './components/HistoryInput';
import { ResultsView } from './components/ResultsView';
import { PoolTracker } from './components/PoolTracker';
import { AuthScreen } from './components/AuthScreen';
import { AdminPanel } from './components/AdminPanel';

import { Player, MatchRound, INPUT_ROUNDS, PredictionScenario } from './types';
import { generatePrediction } from './services/geminiService';
import { authService, User } from './services/authService';

const INITIAL_PLAYERS: Player[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: '', 
  isUser: i === 0,
}));

const DEMO_NAMES = ['', 'Kyo', 'Iori', 'Terry', 'Mai', 'Athena', 'Kula', 'K\''];

type AppStep = 'players' | 'battle' | 'results';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // App State
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [history, setHistory] = useState<MatchRound[]>(
    INPUT_ROUNDS.map(r => ({ ...r, opponentId: null }))
  );
  const [scenarios, setScenarios] = useState<PredictionScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [step, setStep] = useState<AppStep>('players');

  // Refs
  const topRef = useRef<HTMLDivElement>(null);
  const battleSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // Check Session on Mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') setShowAdminPanel(true);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowAdminPanel(false);
  };

  const handleLoginSuccess = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user?.role === 'admin') setShowAdminPanel(true);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newPassword.trim()) {
        setPassMsg({type: 'error', text: 'Password cannot be empty'});
        return;
    }

    const result = authService.updateCredentials(currentUser.id, currentUser.username, newPassword);
    if (result.success) {
        setPassMsg({type: 'success', text: 'Password Updated Successfully!'});
        setNewPassword('');
        setTimeout(() => {
            setShowPassModal(false);
            setPassMsg(null);
        }, 1500);
    } else {
        setPassMsg({type: 'error', text: result.error || 'Update failed'});
    }
  };

  // --- Main Logic Handlers ---

  const handleNameChange = (id: number, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleResetNames = () => {
    setPlayers(INITIAL_PLAYERS);
    setScenarios([]);
    setHistory(INPUT_ROUNDS.map(r => ({ ...r, opponentId: null })));
    setStep('players');
    setError(null);
  };

  const handleHistoryChange = (roundId: string, opponentIdStr: string) => {
    const opponentId = opponentIdStr ? parseInt(opponentIdStr) : null;
    setHistory(prev => prev.map(r => r.id === roundId ? { ...r, opponentId } : r));
  };

  const fillDemoData = () => {
    setPlayers(INITIAL_PLAYERS.map((p, i) => ({ ...p, name: DEMO_NAMES[i] })));
  };

  const goToBattleLog = () => {
    const filledPlayers = players.map(p => p.name.trim() === '' ? {...p, name: p.isUser ? 'Commander' : `CPU ${p.id}`} : p);
    setPlayers(filledPlayers);
    setStep('battle');
    setTimeout(() => {
        battleSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const goBackToPlayers = () => {
    setStep('players');
    setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePredict = async () => {
    const filledHistory = history.filter(h => h.opponentId !== null);
    if (filledHistory.length === 0) {
      setError("NO BATTLE DATA RECORDED!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setScenarios([]);
    setStep('results');
    
    setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const result = await generatePrediction(players, history);
      setScenarios(result);
    } catch (err) {
      setError("CONNECTION ERROR. CHECK NEURAL LINK.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Conditions ---

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'admin' && showAdminPanel) {
    return (
        <AdminPanel 
            onBackToApp={() => setShowAdminPanel(false)} 
            onLogout={handleLogout} 
        />
    );
  }

  const userPlayer = players.find(p => p.isUser) || players[0];

  return (
    <div className="min-h-screen relative font-sans text-white pb-20">
      <div className="bg-arena"></div>
      
      <div ref={topRef} className="container mx-auto px-4 max-w-6xl relative z-30">
        
        {/* User Bar */}
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            {currentUser.role === 'admin' && (
                <button 
                    onClick={() => setShowAdminPanel(true)}
                    className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white p-2 rounded-full transition-colors border border-blue-500/50"
                    title="Admin Panel"
                >
                    <Settings size={16} />
                </button>
            )}
            <div className="bg-black/60 px-3 py-1 rounded-full border border-gray-700 text-xs text-gray-400 flex items-center gap-2">
                <span className="text-kof-gold">{currentUser.username}</span>
                
                <div className="w-px h-3 bg-gray-600 mx-1"></div>

                <button 
                    onClick={() => setShowPassModal(true)} 
                    className="hover:text-white text-gray-400 transition-colors"
                    title="Change Password"
                >
                    <Key size={12} />
                </button>
                <button onClick={handleLogout} className="hover:text-red-400 text-gray-400 transition-colors">
                    <LogOut size={12} />
                </button>
            </div>
        </div>

        <Header />

        {/* Heuristic #1: Visibility of System Status (Stepper) */}
        <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2 md:space-x-4 bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
                <div className={`flex items-center gap-2 ${step === 'players' ? 'text-kof-gold opacity-100' : 'text-gray-500 opacity-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${step === 'players' ? 'bg-kof-gold animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="font-arcade text-xs tracking-widest">SETUP</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step === 'battle' ? 'text-kof-gold opacity-100' : 'text-gray-500 opacity-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${step === 'battle' ? 'bg-kof-gold animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="font-arcade text-xs tracking-widest">DATA</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step === 'results' ? 'text-kof-gold opacity-100' : 'text-gray-500 opacity-50'}`}>
                    <div className={`w-3 h-3 rounded-full ${step === 'results' ? 'bg-kof-gold animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="font-arcade text-xs tracking-widest">PREDICT</span>
                </div>
            </div>
            
            {/* Heuristic #10: Help and Documentation */}
            <button 
                onClick={() => setShowInfo(true)}
                className="ml-4 bg-kof-panel p-2 rounded-full border border-kof-gold/30 text-kof-gold hover:bg-kof-gold hover:text-black transition-colors"
            >
                <Info size={20} />
            </button>
        </div>

        {/* Info Modal */}
        {showInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop-in">
                <div className="bg-kof-panel border-2 border-kof-gold rounded-xl max-w-md w-full p-6 relative shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    <button onClick={() => setShowInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                    <h3 className="font-arcade text-xl text-kof-gold mb-4 border-b border-gray-700 pb-2">SYSTEM MANUAL</h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        This tool uses the <strong>Cycle Repeat Algorithm</strong>. In Magic Chess: Go Go, you typically face every opponent once in a cycle before the cycle resets.
                    </p>
                    <ul className="text-sm space-y-2 text-gray-400 list-disc pl-4">
                        <li>Input active player names.</li>
                        <li>Record who you fought in the current stage.</li>
                        <li>The system calculates remaining opponents.</li>
                    </ul>
                </div>
            </div>
        )}

        <div className="space-y-8">
          
          {/* STEP 1: PLAYER INPUTS */}
          <section className={`transition-all duration-500 ${step !== 'players' ? 'hidden' : 'animate-pop-in'}`}>
             <PlayerInputGrid 
              players={players} 
              onNameChange={handleNameChange} 
              onReset={handleResetNames}
            />
            
            {step === 'players' && (
              <div className="mt-6 flex flex-col items-center gap-4">
                 {players.every((p, i) => i===0 || p.name === '') && (
                    <button onClick={fillDemoData} className="text-[10px] font-bold font-sans uppercase tracking-widest text-kof-gold hover:text-white transition-colors bg-black/50 px-2 py-1 rounded border border-kof-gold/30">
                      [ LOAD KOF DATA ]
                    </button>
                  )}

                 <button 
                    onClick={goToBattleLog}
                    className="btn-next px-10 py-4 rounded-full font-arcade text-2xl uppercase tracking-widest flex items-center gap-3 group animate-bounce-sm"
                 >
                    <span>NEXT: BATTLE LOG</span>
                    <ChevronDown className="group-hover:translate-y-1 transition-transform" />
                 </button>
              </div>
            )}
          </section>

          {/* STEP 2: BATTLE LOG (Pop Up Animation) */}
          {(step === 'battle' || step === 'results') && (
            <section 
                ref={battleSectionRef}
                className="animate-pop-in space-y-6"
            >
                <div className="flex items-center justify-between gap-2 mb-4">
                     <div className="flex items-center gap-2">
                        <ShieldAlert className="text-kof-red" />
                        <h3 className="font-arcade text-xl text-kof-gold tracking-widest">PHASE 2: COMBAT DATA</h3>
                     </div>
                     
                     {/* Heuristic #3: User Control (Back Button) */}
                     {step === 'battle' && (
                        <button 
                            onClick={goBackToPlayers}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors px-3 py-1 rounded border border-gray-700 hover:border-gray-500"
                        >
                            <ArrowLeft size={12} /> Modify Players
                        </button>
                     )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Logic & History */}
                    <div className="lg:col-span-1 space-y-6">
                        <PoolTracker players={players} history={history} />
                        <HistoryInput 
                            players={players} 
                            history={history} 
                            onHistoryChange={handleHistoryChange}
                            userPlayer={userPlayer}
                        />
                    </div>

                    {/* Right Column: Actions */}
                    <div className="lg:col-span-2 flex flex-col justify-center gap-6">
                        
                        {/* Prompt Text */}
                        <div className="text-center md:text-left bg-black/40 p-4 rounded border-l-4 border-kof-gold">
                             <p className="text-gray-300 font-sans text-lg">
                                Input your recent battles to calibrate the prediction engine.
                                <br />
                                <span className="text-kof-gold font-bold">The more accurate the data, the better the prediction.</span>
                             </p>
                        </div>

                        {/* Giant Action Button */}
                        <div className="flex justify-center py-4">
                            <button
                            onClick={handlePredict}
                            disabled={isLoading || step === 'results'} 
                            className={`
                                btn-hit w-full md:w-5/6 py-5 md:py-8 rounded-xl transform transition-transform
                                flex flex-col items-center justify-center relative overflow-hidden group
                                ${isLoading ? 'opacity-70 cursor-not-allowed grayscale' : 'hover:scale-105'}
                            `}
                            >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <span className="font-arcade font-black italic text-4xl md:text-6xl tracking-tighter uppercase text-stroke text-red-900">
                                    PREDICT
                                </span>
                                <Zap size={40} className="fill-kof-red text-red-900 stroke-[3px]" />
                            </div>
                            <div className="text-xs font-bold uppercase tracking-[0.4em] text-red-900 mt-2">
                                Initiate Neural Calculation
                            </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
          )}

          {/* STEP 3: RESULTS (Pop Up Animation) */}
          {step === 'results' && (
             <section 
                ref={resultsSectionRef}
                className="animate-pop-in pt-8 border-t-2 border-white/10 mt-8"
             >
                  <ResultsView 
                    scenarios={scenarios} 
                    isLoading={isLoading} 
                    error={error} 
                />
                
                {!isLoading && (
                    <div className="text-center mt-8">
                        <button 
                            onClick={goToBattleLog} 
                            className="text-gray-400 hover:text-white underline text-sm tracking-widest uppercase"
                        >
                            Update Data & Predict Again
                        </button>
                    </div>
                )}
             </section>
          )}

        </div>
        
        <footer className="mt-20 text-center border-t border-white/10 pt-8 pb-8 flex flex-col items-center gap-4">
          <button 
             onClick={() => setShowContact(true)}
             className="flex items-center gap-2 text-kof-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-kof-gold/30 px-4 py-2 rounded-full hover:bg-white/5"
          >
             <ShieldCheck size={14} /> Contact Admin / Report Issue
          </button>
          <p className="text-white/30 font-sans text-xs uppercase tracking-widest">
             Not affiliated with Moonton or SNK • Fan Made Tool
          </p>
        </footer>

        {/* Contact Modal (Reused) */}
        {showContact && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-pop-in">
            <div className="bg-kof-panel border-2 border-kof-gold rounded-xl max-w-sm w-full p-1 shadow-[0_0_50px_rgba(255,215,0,0.3)]">
                <div className="bg-black/50 p-6 rounded-lg relative overflow-hidden">
                    {/* Close Button */}
                    <button 
                        onClick={() => setShowContact(false)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-white"
                    >
                        ✕
                    </button>

                    <div className="text-center mb-6">
                        <h2 className="font-arcade text-2xl text-kof-gold mb-1 tracking-widest">HELP CENTER</h2>
                        <div className="h-0.5 w-16 bg-kof-red mx-auto mb-2"></div>
                        <p className="text-gray-400 text-xs uppercase tracking-wide leading-relaxed">
                            Encountered a bug? <br/> Need subscription renewal?
                        </p>
                    </div>

                    <div className="space-y-3">
                        <a 
                            href="https://t.me/RotiJohn" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 bg-[#0088cc] hover:bg-[#0077b5] border-b-4 border-[#005f7f] active:border-b-0 active:translate-y-1 text-white font-bold py-3 rounded transition-all font-display text-lg tracking-wide w-full"
                        >
                            <Send size={18} /> TELEGRAM
                        </a>
                        <a 
                            href="https://wa.me/60196682203" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] border-b-4 border-[#075E54] active:border-b-0 active:translate-y-1 text-white font-bold py-3 rounded transition-all font-display text-lg tracking-wide w-full"
                        >
                            <MessageCircle size={18} /> WHATSAPP
                        </a>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
                            Admin: <span className="text-kof-gold font-bold">RotiJohn</span>
                        </p>
                    </div>
                </div>
            </div>
            </div>
        )}

        {/* Change Password Modal (For User) */}
        {showPassModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in">
                 <div className="bg-kof-panel border-2 border-kof-gold rounded-xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h2 className="font-arcade text-xl text-white tracking-widest flex items-center gap-2">
                             <Key size={20} className="text-kof-gold" /> NEW PASSWORD
                        </h2>
                        <button onClick={() => {setShowPassModal(false); setNewPassword(''); setPassMsg(null);}} className="text-gray-500 hover:text-white"><X size={20}/></button>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        {passMsg && (
                            <div className={`p-2 text-xs uppercase font-bold text-center border ${passMsg.type === 'success' ? 'bg-green-900/50 border-green-500 text-green-200' : 'bg-red-900/50 border-red-500 text-red-200'}`}>
                                {passMsg.text}
                            </div>
                        )}
                        
                        <div>
                            <input 
                                type="text" // Show cleartext for better UX in arcade style, or password if preferred. Keeping text for ease as per arcade aesthetic often lacking complex input validation UX
                                placeholder="ENTER NEW PASSWORD"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-black/60 border border-gray-600 text-white p-3 rounded focus:border-kof-gold focus:outline-none placeholder:text-gray-700 uppercase tracking-wider text-center"
                            />
                        </div>

                        <button 
                            type="submit"
                            className="w-full py-4 mt-2 bg-gradient-to-r from-kof-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold text-lg uppercase tracking-widest rounded shadow-lg transform transition-transform active:scale-95"
                        >
                            CONFIRM CHANGE
                        </button>
                    </form>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
