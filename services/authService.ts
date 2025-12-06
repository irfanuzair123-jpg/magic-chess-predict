export interface User {
  id: string;
  username: string;
  password?: string; // Only used internally
  role: 'admin' | 'user';
  isVerified: boolean;
  expiryDate: string | null; // ISO Date string or null for Lifetime/Friend
  createdAt: string;
}

const STORAGE_KEY = 'magic_chess_users';
const CURRENT_USER_KEY = 'magic_chess_current_session';

// Initialize default admin if not exists
const initAuth = () => {
  const users = getUsers();
  if (!users.find(u => u.username === 'admin')) {
    const admin: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'admin', // Simple for demo
      role: 'admin',
      isVerified: true,
      expiryDate: null, // Admin never expires
      createdAt: new Date().toISOString()
    };
    users.push(admin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
};

const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const authService = {
  login: (username: string, password: string): { success: boolean; user?: User; error?: string } => {
    initAuth();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Account pending verification. Contact Admin.' };
    }

    // Check Expiry
    if (user.expiryDate) {
      const expiry = new Date(user.expiryDate);
      const now = new Date();
      if (now > expiry) {
        return { success: false, error: 'Subscription Expired. Please renew.' };
      }
    }

    // Create session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, user };
  },

  register: (username: string, password: string): { success: boolean; error?: string } => {
    initAuth();
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      password,
      role: 'user',
      isVerified: false,
      expiryDate: null, // Set by admin upon verification
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return { success: true };
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // --- Admin Methods ---

  getAllUsers: (): User[] => {
    const users = getUsers();
    // Return all users except the main admin account to prevent accidental deletion/editing of self
    return users.filter(u => u.username !== 'admin');
  },

  getPendingUsers: (): User[] => {
    const users = getUsers();
    return users.filter(u => !u.isVerified && u.username !== 'admin');
  },

  verifyUser: (userId: string, expiryDate: string | null) => {
    const users = getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isVerified: true, expiryDate } : u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updateUserExpiry: (userId: string, expiryDate: string | null) => {
    const users = getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, expiryDate } : u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // NEW: Update Credentials (Username & Password)
  // If newUsername is provided, check for uniqueness (unless it's the same user)
  updateCredentials: (userId: string, newUsername: string, newPassword?: string): { success: boolean; error?: string } => {
    const users = getUsers();
    const targetIndex = users.findIndex(u => u.id === userId);
    
    if (targetIndex === -1) return { success: false, error: 'User not found' };

    // Check duplicate username if changing name
    if (newUsername !== users[targetIndex].username) {
        if (users.find(u => u.username === newUsername)) {
            return { success: false, error: 'Username already taken' };
        }
    }

    const updatedUser = { ...users[targetIndex] };
    updatedUser.username = newUsername;
    if (newPassword && newPassword.trim() !== '') {
        updatedUser.password = newPassword;
    }

    users[targetIndex] = updatedUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    
    // If updating current logged in user, update session
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }

    return { success: true };
  },

  deleteUser: (userId: string) => {
    const users = getUsers();
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};