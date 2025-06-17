import { create } from 'zustand';
import { AppState } from './types';

export const useStore = create<AppState>((set) => ({
  userEmail: '',
  userName: '',
  isLoggedIn: false,
  login: (email, name) => set({ userEmail: email, userName: name, isLoggedIn: true }),
  logout: () => set({ userEmail: '', userName: '', isLoggedIn: false }),
}));