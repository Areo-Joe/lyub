import { atomWithStorage } from "jotai/utils";

// Timer state - persisted to survive page refresh
export interface TimerState {
  isRunning: boolean;
  startTime: number | null; // timestamp ms
  categoryId: string | null;
  description: string;
}

const DEFAULT_TIMER_STATE: TimerState = {
  isRunning: false,
  startTime: null,
  categoryId: null,
  description: "",
};

export const timerAtom = atomWithStorage<TimerState>("lyub-timer", DEFAULT_TIMER_STATE);

