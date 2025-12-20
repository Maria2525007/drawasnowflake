import historyReducer, {
  saveState,
  undo,
  redo,
  clearHistory,
} from '../../../features/history/historySlice';

describe('historySlice', () => {
  const initialState = {
    past: [] as string[],
    present: null as string | null,
    future: [] as string[],
    maxHistorySize: 50,
  };

  it('should return initial state', () => {
    const state = historyReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  describe('saveState', () => {
    it('should save state', () => {
      const state = historyReducer(initialState, saveState('state1'));
      expect(state.present).toBe('state1');
      expect(state.past).toHaveLength(0);
    });

    it('should move previous state to past', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      expect(state.present).toBe('state2');
      expect(state.past).toHaveLength(1);
      expect(state.past[0]).toBe('state1');
    });
  });

  describe('undo', () => {
    it('should undo state', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, undo());

      expect(state.present).toBe('state1');
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(1);
    });

    it('should not undo when past is empty', () => {
      const state = historyReducer(initialState, undo());
      expect(state).toEqual(initialState);
    });
  });

  describe('redo', () => {
    it('should redo state', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, undo());
      state = historyReducer(state, redo());

      expect(state.present).toBe('state2');
      expect(state.past).toHaveLength(1);
      expect(state.future).toHaveLength(0);
    });

    it('should not redo when future is empty', () => {
      const state = historyReducer(initialState, redo());
      expect(state).toEqual(initialState);
    });
  });

  describe('clearHistory', () => {
    it('should clear history', () => {
      let state = historyReducer(initialState, saveState('state1'));
      state = historyReducer(state, saveState('state2'));
      state = historyReducer(state, clearHistory());

      expect(state.present).toBeNull();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });
  });
});
