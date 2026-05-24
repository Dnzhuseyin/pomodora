import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, Settings, BookConfig, TimerState } from '../types';
import { BOOK_COLORS } from '../constants/colors';

const DEFAULT_SETTINGS: Settings = {
  pomodoroDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationsEnabled: true,
  theme: 'system',
  shelfTheme: 'classic_oak',
};

const DEFAULT_BOOK: BookConfig = {
  color: BOOK_COLORS[0].hex,
  darkColor: BOOK_COLORS[0].dark,
  colorName: BOOK_COLORS[0].name,
  label: '',
  height: 65,
};

interface AppState {
  sessions: Session[];
  settings: Settings;
  timerState: TimerState;
  remainingSeconds: number;
  currentBook: BookConfig;
  newSessionId: string | null;
  isLoaded: boolean;

  // Actions
  loadData: () => Promise<void>;
  saveSession: (session: Session) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  setTimerState: (state: TimerState) => void;
  setRemainingSeconds: (s: number) => void;
  setCurrentBook: (book: BookConfig) => void;
  setNewSessionId: (id: string | null) => void;
  getTodayCount: () => number;
  getTodayMinutes: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  settings: DEFAULT_SETTINGS,
  timerState: 'idle',
  remainingSeconds: DEFAULT_SETTINGS.pomodoroDuration * 60,
  currentBook: DEFAULT_BOOK,
  newSessionId: null,
  isLoaded: false,

  loadData: async () => {
    try {
      const [sessionsRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem('sessions'),
        AsyncStorage.getItem('settings'),
      ]);
      const sessions: Session[] = sessionsRaw ? JSON.parse(sessionsRaw) : [];
      const settings: Settings = settingsRaw
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(settingsRaw) }
        : DEFAULT_SETTINGS;
      set({
        sessions,
        settings,
        remainingSeconds: settings.pomodoroDuration * 60,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  saveSession: async (session: Session) => {
    const sessions = [...get().sessions, session];
    set({ sessions });
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
  },

  updateSettings: async (patch: Partial<Settings>) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    if (patch.pomodoroDuration) {
      set({ remainingSeconds: patch.pomodoroDuration * 60 });
    }
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  },

  setTimerState: (timerState) => set({ timerState }),
  setRemainingSeconds: (remainingSeconds) => set({ remainingSeconds }),
  setCurrentBook: (currentBook) => set({ currentBook }),
  setNewSessionId: (newSessionId) => set({ newSessionId }),

  getTodayCount: () => {
    const today = new Date().toDateString();
    return get().sessions.filter(
      (s) => s.completed && new Date(s.startedAt).toDateString() === today,
    ).length;
  },

  getTodayMinutes: () => {
    const today = new Date().toDateString();
    return get()
      .sessions.filter(
        (s) => s.completed && new Date(s.startedAt).toDateString() === today,
      )
      .reduce((acc, s) => acc + s.durationMinutes, 0);
  },
}));
