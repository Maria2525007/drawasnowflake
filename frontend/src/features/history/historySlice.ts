import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HistoryState {
  past: string[];
  present: string | null;
  future: string[];
  maxHistorySize: number;
}

const initialState: HistoryState = {
  past: [],
  present: null,
  future: [],
  maxHistorySize: 50,
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    saveState: (state, action: PayloadAction<string>) => {
      if (state.present !== null) {
        state.past.push(state.present);
        if (state.past.length > state.maxHistorySize) {
          state.past.shift();
        }
      }
      state.present = action.payload;
      state.future = [];
    },
    undo: (state) => {
      if (state.past.length > 0 && state.present !== null) {
        state.future.unshift(state.present);
        state.present = state.past.pop() || null;
      }
    },
    redo: (state) => {
      if (state.future.length > 0 && state.present !== null) {
        state.past.push(state.present);
        state.present = state.future.shift() || null;
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.present = null;
      state.future = [];
    },
  },
});

export const { saveState, undo, redo, clearHistory } = historySlice.actions;
export default historySlice.reducer;
