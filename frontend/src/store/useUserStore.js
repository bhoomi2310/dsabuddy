import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('dsabuddy_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();

export const useUserStore = create((set) => ({
  user: initialUser,
  branch: initialUser?.branch || '',
  setUser: (user) => {
    if (user) {
      localStorage.setItem('dsabuddy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dsabuddy_user');
    }
    set({ 
      user, 
      branch: user?.branch || '' 
    });
  },
  setBranch: (branch) => set((state) => {
    const updatedUser = state.user ? { ...state.user, branch } : null;
    if (updatedUser) {
      localStorage.setItem('dsabuddy_user', JSON.stringify(updatedUser));
    }
    return {
      branch,
      user: updatedUser
    };
  }),
}));
