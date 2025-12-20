import historyReducer, {
  saveState,
  undo,
  redo,
  clearHistory,
} from '../../../features/history/historySlice';

describe('historySlice', () => {
  const initialState = {
    past: [],
    present: null,
    future: [],
    maxHistorySize: 50,
  };

  describe('Initial State', () => {
    it('should return initial state', () => {
      expect(historyReducer(undefined, { type: 'unknown' })).toEqual({
        past: [],
        present: null,
        future: [],
        maxHistorySize: 50,
      });
    });
  });

  describe('saveState', () => {
    it('should save first state', () => {
      const state = historyReducer(initialState, saveState('state1'));
      expect(state.present).toBe('state1');
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });

    it('should save multiple states', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      
      expect(state.present).toBe('state2');
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toBe('state1');
      expect(state.future).toHaveLength(0);
    });

    it('should clear future when saving new state after undo', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, saveState('state3'));
      state = historyReducer(state, undo());
      
      expect(state.future).toHaveLength(1);
      
      state = historyReducer(state, saveState('state4'));
      
      expect(state.present).toBe('state4');
      expect(state.past).toHaveLength(2);
      expect(state.future).toHaveLength(0);
    });

    it('should handle empty string state', () => {
      const state = historyReducer(initialState, saveState(''));
      expect(state.present).toBe('');
    });

    it('should handle data URL state', () => {
      const dataUrl = 'data:image/png;base64,test123';
      const state = historyReducer(initialState, saveState(dataUrl));
      expect(state.present).toBe(dataUrl);
    });
  });

  describe('undo', () => {
    it('should not undo when past is empty', () => {
      const state = historyReducer(initialState, saveState('state1'));
      const newState = historyReducer(state, undo());
      
      expect(newState.present).toBe('state1');
      expect(newState.past).toHaveLength(0);
      expect(newState.future).toHaveLength(0);
    });

    it('should undo to previous state', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, undo());
      
      expect(state.present).toBe('state1');
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(1);
      expect(state.future[0]).toBe('state2');
    });

    it('should undo multiple times', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, saveState('state3'));
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      
      expect(state.present).toBe('state1');
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(2);
      expect(state.future[0]).toBe('state2');
      expect(state.future[1]).toBe('state3');
    });

    it('should not undo when present is null', () => {
      const stateWithNull = { ...initialState, present: null };
      const newState = historyReducer(stateWithNull, undo());
      
      expect(newState.present).toBeNull();
      expect(newState.past).toHaveLength(0);
    });
  });

  describe('redo', () => {
    it('should not redo when future is empty', () => {
      const state = historyReducer(initialState, saveState('state1'));
      const newState = historyReducer(state, redo());
      
      expect(newState.present).toBe('state1');
      expect(newState.past).toHaveLength(0);
      expect(newState.future).toHaveLength(0);
    });

    it('should redo to next state', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());
      
      expect(state.present).toBe('state2');
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toBe('state1');
      expect(state.future).toHaveLength(0);
    });

    it('should redo multiple times', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, saveState('state3'));
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());
      state = historyReducer(state, redo());
      
      expect(state.present).toBe('state3');
      expect(state.past).toHaveLength(2);
      expect(state.future).toHaveLength(0);
    });

    it('should not redo when present is null', () => {
      const stateWithNull = { ...initialState, present: null, future: ['state1'] };
      const newState = historyReducer(stateWithNull, redo());
      
      expect(newState.present).toBeNull();
      expect(newState.future).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('should clear all history', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, undo());
      state = historyReducer(state, clearHistory());
      
      expect(state.present).toBeNull();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });

    it('should clear empty history', () => {
      const state = historyReducer(initialState, clearHistory());
      
      expect(state.present).toBeNull();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });
  });

  describe('History Size Limit', () => {
    it('should limit history size to maxHistorySize', () => {
      let state = historyReducer(initialState, saveState('state0'));
      
      for (let i = 1; i <= 60; i++) {
        state = historyReducer(state, saveState(`state${i}`));
      }
      
      expect(state.past.length).toBeLessThanOrEqual(50);
      expect(state.present).toBe('state60');
    });

    it('should remove oldest states when limit exceeded', () => {
      let state = historyReducer(initialState, saveState('state0'));
      
      for (let i = 1; i <= 55; i++) {
        state = historyReducer(state, saveState(`state${i}`));
      }
      
      // Oldest states should be removed
      expect(state.past.length).toBe(50);
      expect(state.past[0]).not.toBe('state0');
      expect(state.present).toBe('state55');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid state changes', () => {
      let state = initialState;
      
      for (let i = 0; i < 20; i++) {
        state = historyReducer(state, saveState(`state${i}`));
      }
      
      expect(state.past.length).toBe(19);
      expect(state.present).toBe('state19');
    });

    it('should handle undo/redo cycle', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, saveState('state3'));
      
      // Undo twice
      state = historyReducer(state, undo());
      state = historyReducer(state, undo());
      
      // Redo once
      state = historyReducer(state, redo());
      
      expect(state.present).toBe('state2');
      expect(state.past).toHaveLength(1);
      expect(state.future).toHaveLength(1);
    });
  });
});