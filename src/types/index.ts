export interface BookConfig {
  color: string;
  darkColor: string;
  colorName: string;
  label: string;
  height: number;
}

export interface Session {
  id: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  completed: boolean;
  book: {
    color: string;
    darkColor: string;
    label: string;
    height: number;
  };
  note: string;
}

export interface Settings {
  pomodoroDuration: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  shelfTheme: 'classic_oak' | 'modern_white' | 'dark_walnut' | 'night_purple';
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'abandoned';
