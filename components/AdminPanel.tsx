import React, { useState, useEffect } from 'react';
import { Check, X, User as UserIcon, LogOut, ArrowLeft, Shield, Search, Calendar, Infinity, Clock, Trash2, Edit, Key } from 'lucide-react';
import { authService, User } from '../services/authService';

interface AdminPanelProps {
  onBackToApp: () => void;
  onLogout: () => void;
}

type Tab = 'pending' | 'database';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToApp, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showCredsModal, setShowCredsModal] = useState(false); // New Modal for Creds
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Subscription Form State
  const [expiryType, setExpiryType] = useState<'lifetime' | 'date'>('lifetime');
  const [customDate, setCustomDate] = useState('');

  // Creds Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credsError, setCredsError] = useState<string | null>(null);

  const loadData = () => {
    setUsers(authService.getAllUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFilteredUsers = () => {
    let filtered = users;
    
    // Tab Filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(u => !u.isVerified);
    } else {
      filtered = filtered.filter(u => u.isVerified);
    }

    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => u.username.toLowerCase().includes(q));
    }

    return filtered.reverse(); // Newest first
  };

  // --- Modal Handlers ---

  const openVerifyModal = (user: User) => {
    setSelectedUser(user);
    setExpiryType('lifetime');
    // Default to 30 days from now
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setCustomDate(nextMonth.toISOString().split('T')[0]);
    setShowModal(true);
  };
  
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    if (user.expiryDate) {
        setExpiryType('date');
        setCustomDate(user.expiryDate.split('T')[0]);
    } else {
        setExpiryType('lifetime');
    }
    setShowModal(true);
  };

  const openCredsModal = (user: User) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewPassword(''); // Don't show old password
    setCredsError(null);
    setShowCredsModal(true);
  };

  // --- Save Actions ---

  const handleSaveUser = () => {
    if (!selectedUser) return;

    const finalDate = expiryType === 'lifetime' ? null : new Date(customDate).toISOString();

    if (activeTab === 'pending') {
        authService.verifyUser(selectedUser.id, finalDate);
    } else {
        authService.updateUserExpiry(selectedUser.id, finalDate);
    }

    setShowModal(false);
    setSelectedUser(null);
    loadData();
  };

  const handleSaveCreds = () => {
      if (!selectedUser) return;
      if (!newUsername.trim()) {
          setCredsError("Username cannot be empty");
          return;
      }

      const result = authService.updateCredentials(selectedUser.id, newUsername, newPassword);
      if (result.success) {
          setShowCredsModal(false);
          setSelectedUser(null);
          loadData();
      } else {
          setCredsError(result.error || "Update failed");
      }
  };

  const handleDelete = (id: string) => {
    if (confirm("DELETE USER PERMANENTLY? This cannot be undone.")) {
        authService.deleteUser(id);
        loadData();
    }
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="min-h-screen relative font-sans text-white p-4 md:p-8">
      <div className="bg-arena"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-kof-red p-3 rounded-lg border-2 border-white shadow-[0_0_15px_rgba(217,32,39,0.5)]">
                <Shield size={32} className="text-white" />
             </div>
             <div>
                <h1 className="font-arcade text-3xl md:text-4xl text-white text-stroke tracking-widest leading-none">COMMAND CENTER</h1>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs text-kof-gold font-bold uppercase tracking-[0.3em]">System Admin Active</p>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={onBackToApp} className="px-4 py-2 rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all font-bold text-xs uppercase tracking-wide flex items-center gap-2">
               <ArrowLeft size={16} /> App Mode
            </button>
            <button onClick={onLogout} className="px-4 py-2 rounded-full bg-red-900/50 text-red-300 border border-red-500/50 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-wide flex items-center gap-2">
               <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        {/* Main Panel */}
        <div className="arcade-card p-6 min-h-[600px] flex flex-col">
             
             {/* Toolbar */}
             <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-700 pb-6">
                
                {/* Tabs */}
                <div className="flex bg-black/40 p-1 rounded-lg border border-gray-700">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded font-arcade tracking-widest text-sm transition-all ${activeTab === 'pending' ? 'bg-kof-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        REQUESTS {users.filter(u => !u.isVerified).length > 0 && `(${users.filter(u => !u.isVerified).length})`}
                    </button>
                    <button 
                         onClick={() => setActiveTab('database')}
                         className={`px-6 py-2 rounded font-arcade tracking-widest text-sm transition-all ${activeTab === 'database' ? 'bg-kof-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        USER DATABASE
                    </button>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="SEARCH NAME..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-gray-600 text-white pl-10 pr-4 py-2 rounded focus:border-kof-gold focus:outline-none text-sm font-bold tracking-wide placeholder:text-gray-700 uppercase"
                    />
                </div>
             </div>

             {/* List */}
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {getFilteredUsers().length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                        <UserIcon size={48} className="mb-4" />
                        <p className="font-arcade tracking-widest">NO DATA FOUND</p>
                    </div>
                ) : (
                    getFilteredUsers().map(user => {
                        const expired = isExpired(user.expiryDate);
                        
                        return (
                            <div key={user.id} className="bg-black/40 p-4 rounded border-l-4 border-gray-700 hover:border-kof-gold hover:bg-white/5 transition-all flex flex-col md:flex-row items-center justify-between group">
                                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                    <div className={`p-3 rounded-full ${activeTab === 'pending' ? 'bg-yellow-900/30 text-yellow-500' : (expired ? 'bg-red-900/30 text-red-500' : 'bg-green-900/30 text-green-500')}`}>
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="font-display text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                                            {user.username}
                                            {activeTab === 'database' && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${expired ? 'border-red-500 text-red-400' : 'border-green-500 text-green-400'}`}>
                                                    {expired ? 'EXPIRED' : 'ACTIVE'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-mono flex items-center gap-3">
                                            <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                                            {activeTab === 'database' && (
                                                <span className="text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {user.expiryDate ? `Expires: ${new Date(user.expiryDate).toLocaleDateString()}` : 'LIFETIME ACCESS'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                    {activeTab === 'database' && (
                                        <button 
                                            onClick={() => openCredsModal(user)}
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                                            title="Edit Username/Password"
                                        >
                                            <Key size={18} />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-900/20 rounded transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    
                                    {activeTab === 'pending' ? (
                                        <button 
                                            onClick={() => openVerifyModal(user)}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-wider rounded shadow-lg shadow-green-900/50 flex items-center gap-2"
                                        >
                                            <Check size={16} /> Approve
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => openEditModal(user)}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded shadow-lg shadow-blue-900/50 flex items-center gap-2"
                                        >
                                            <Edit size={16} /> Manage Sub
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
             </div>
        </div>

        {/* Subscription Modal */}
        {showModal && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in">
                <div className="bg-kof-panel border-2 border-kof-gold rounded-xl w-full max-w-md p-6 shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h2 className="font-arcade text-xl text-white tracking-widest">
                            {activeTab === 'pending' ? 'VERIFY USER' : 'UPDATE SUBSCRIPTION'}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                    </div>

                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-widest">Target User</p>
                            <h3 className="text-3xl font-display font-bold text-kof-gold">{selectedUser.username}</h3>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Access Duration</label>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setExpiryType('lifetime')}
                                    className={`p-3 rounded border-2 flex flex-col items-center gap-2 transition-all ${expiryType === 'lifetime' ? 'bg-kof-gold/20 border-kof-gold text-kof-gold' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                                >
                                    <Infinity size={24} />
                                    <span className="text-xs font-bold uppercase">Friend / Lifetime</span>
                                </button>
                                <button 
                                    onClick={() => setExpiryType('date')}
                                    className={`p-3 rounded border-2 flex flex-col items-center gap-2 transition-all ${expiryType === 'date' ? 'bg-blue-500/20 border-blue-400 text-blue-400' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                                >
                                    <Calendar size={24} />
                                    <span className="text-xs font-bold uppercase">Paid / Date Limit</span>
                                </button>
                            </div>
                        </div>

                        {expiryType === 'date' && (
                             <div className="animate-slide-up">
                                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1 block">Expiration Date</label>
                                <input 
                                    type="date" 
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="w-full bg-black/60 border border-gray-600 text-white p-3 rounded focus:border-blue-500 focus:outline-none font-mono"
                                />
                             </div>
                        )}

                        <button 
                            onClick={handleSaveUser}
                            className="w-full py-4 mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg uppercase tracking-widest rounded shadow-lg transform transition-transform active:scale-95"
                        >
                            {activeTab === 'pending' ? 'CONFIRM & ACTIVATE' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Credentials Edit Modal */}
        {showCredsModal && selectedUser && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-pop-in">
                 <div className="bg-kof-panel border-2 border-kof-red rounded-xl w-full max-w-sm p-6 shadow-[0_0_50px_rgba(217,32,39,0.2)]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h2 className="font-arcade text-xl text-white tracking-widest flex items-center gap-2">
                             <Key size={20} className="text-kof-gold" /> EDIT CREDENTIALS
                        </h2>
                        <button onClick={() => setShowCredsModal(false)} className="text-gray-500 hover:text-white"><X size={20}/></button>
                    </div>

                    <div className="space-y-4">
                        {credsError && (
                            <div className="bg-red-900/50 border border-red-500 p-2 text-xs text-red-200 text-center uppercase font-bold">
                                {credsError}
                            </div>
                        )}
                        
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-1">Username</label>
                            <input 
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full bg-black/60 border border-gray-600 text-white p-3 rounded focus:border-kof-gold focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-widest font-bold block mb-1">New Password</label>
                            <input 
                                type="text"
                                placeholder="Leave empty to keep current"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-black/60 border border-gray-600 text-white p-3 rounded focus:border-kof-gold focus:outline-none placeholder:text-gray-700"
                            />
                        </div>

                        <button 
                            onClick={handleSaveCreds}
                            className="w-full py-4 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg uppercase tracking-widest rounded shadow-lg transform transition-transform active:scale-95"
                        >
                            UPDATE ACCOUNT
                        </button>
                    </div>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};