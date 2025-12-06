import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, LogIn, MessageCircle, Send, Gamepad2, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Captcha State
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);

  // Generate random 4-char code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, 1, O, 0 to avoid confusion
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. Security Check
    if (captchaInput.toUpperCase() !== captchaCode) {
        setError('SECURITY BREACH: INVALID CAPTCHA CODE');
        generateCaptcha(); // Regenerate on failure
        return;
    }

    if (isLogin) {
      const result = authService.login(username, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Login failed');
        if (result.error?.includes('verification')) {
          setShowContact(true);
        }
        generateCaptcha(); // Regenerate on fail to prevent brute force
      }
    } else {
      const result = authService.register(username, password);
      if (result.success) {
        setSuccessMsg('Registration successful! Wait for Admin Verification.');
        setShowContact(true);
        setIsLogin(true);
        generateCaptcha();
      } else {
        setError(result.error || 'Registration failed');
        generateCaptcha();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans p-4 overflow-hidden">
      {/* Shared Background */}
      <div className="bg-arena"></div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-10 left-10 text-kof-gold/20 font-arcade text-9xl select-none pointer-events-none animate-pulse">KO</div>
      <div className="absolute bottom-10 right-10 text-kof-red/20 font-arcade text-9xl select-none pointer-events-none animate-pulse" style={{animationDelay: '1s'}}>GO</div>

      <div className="relative z-10 w-full max-w-md perspective-1000">
        
        {/* Header Logo Area */}
        <div className="text-center mb-8 relative">
           <div className="inline-block relative">
              <h1 className="font-arcade text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 text-stroke-lg tracking-widest italic relative z-10">
                {isLogin ? 'LOGIN' : 'JOIN'}
              </h1>
              <h1 className="font-arcade text-5xl md:text-6xl text-kof-darkRed absolute top-1 left-1 -z-10 tracking-widest italic blur-[1px]">
                {isLogin ? 'LOGIN' : 'JOIN'}
              </h1>
           </div>
           <p className="text-kof-gold text-sm font-bold tracking-[0.5em] uppercase mt-2 text-shadow">
              Magic Chess Predictor
           </p>
        </div>

        {/* Main Arcade Card */}
        <div className="arcade-card p-8 animate-slide-up">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Username Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Gamepad2 className="text-gray-500 group-focus-within:text-kof-gold transition-colors" size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="USERNAME"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-black/60 border-2 border-gray-700 text-white px-10 py-3 rounded focus:outline-none focus:border-kof-gold focus:bg-black/80 transition-all font-display text-xl tracking-wide placeholder:text-gray-600 uppercase"
                        required
                    />
                </div>
                
                {/* Password Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="text-gray-500 group-focus-within:text-kof-gold transition-colors" size={20} />
                    </div>
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-black/60 border-2 border-gray-700 text-white px-10 py-3 rounded focus:outline-none focus:border-kof-gold focus:bg-black/80 transition-all font-display text-xl tracking-wide placeholder:text-gray-600"
                        required
                    />
                </div>

                {/* --- ARCADE CAPTCHA START --- */}
                <div className="bg-black/40 p-3 rounded border border-gray-700 mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <ShieldAlert size={10} /> SYSTEM VERIFICATION
                        </span>
                        <button 
                            type="button" 
                            onClick={generateCaptcha}
                            className="text-kof-gold hover:text-white transition-colors"
                            title="Refresh Code"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* The Code Display */}
                        <div className="w-1/2 bg-gray-900 border border-gray-600 rounded flex items-center justify-center relative overflow-hidden select-none">
                             {/* Static Noise Overlay */}
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50"></div>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                             
                             <span className="font-arcade text-2xl text-white tracking-[0.3em] relative z-10 text-shadow skew-x-[-10deg]">
                                {captchaCode}
                             </span>
                        </div>

                        {/* Input Field */}
                        <input 
                            type="text"
                            placeholder="ENTER CODE"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="w-1/2 bg-black/60 border border-gray-600 text-white px-3 py-2 rounded focus:outline-none focus:border-kof-gold text-center font-arcade text-lg uppercase placeholder:text-gray-700 placeholder:font-sans placeholder:text-xs placeholder:tracking-normal"
                            maxLength={4}
                            required
                        />
                    </div>
                </div>
                {/* --- ARCADE CAPTCHA END --- */}

            </div>

            {error && (
              <div className="bg-red-900/80 border-l-4 border-red-500 text-white text-xs font-bold p-3 animate-bounce-sm uppercase tracking-wide">
                {error}
              </div>
            )}
            
            {successMsg && (
              <div className="bg-green-900/80 border-l-4 border-green-500 text-white text-xs font-bold p-3 animate-bounce-sm uppercase tracking-wide">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-next w-full py-4 rounded font-arcade text-2xl uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all relative overflow-hidden group"
            >
              <span className="relative z-10">{isLogin ? 'INSERT COIN' : 'NEW CHALLENGER'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-6 flex justify-between items-center text-xs font-bold tracking-widest text-gray-400">
             <button 
                onClick={() => { setIsLogin(!isLogin); generateCaptcha(); }} 
                className="hover:text-kof-gold hover:underline underline-offset-4 decoration-kof-gold decoration-2 transition-colors uppercase"
             >
                {isLogin ? 'Create Account' : 'Back to Login'}
             </button>
             
             <button 
                onClick={() => setShowContact(true)}
                className="flex items-center gap-1 hover:text-white transition-colors"
             >
                <ShieldCheck size={14} /> HELP
             </button>
          </div>
        </div>
      </div>

      {/* Contact Modal (Arcade Style) */}
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
                    <h2 className="font-arcade text-2xl text-kof-gold mb-1 tracking-widest">ACCESS DENIED?</h2>
                    <div className="h-0.5 w-16 bg-kof-red mx-auto mb-2"></div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide leading-relaxed">
                        Subscription Required.<br/>Contact Admin to Unlock.
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
    </div>
  );
};
