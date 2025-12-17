import historyReducer, {
  saveState,
  undo,
  redo,
  clearHistory,
} from '../../../features/history/historySlice';

describe('historySlice', () => {
  it('should save state', () => {
    const state = historyReducer(undefined, saveState('state1'));
    expect(state.present).toBe('state1');
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });

  it('should save multiple states', () => {
    let state = historyReducer(undefined, saveState('state1'));
    state = historyReducer(state, saveState('state2'));
    expect(state.present).toBe('state2');
    expect(state.past).toHaveLength(1);
    expect(state.past[0]).toBe('state1');
  });

  it('should undo', () => {
    let state = historyReducer(undefined, saveState('state1'));
    state = historyReducer(state, saveState('state2'));
    state = historyReducer(state, undo());
    expect(state.present).toBe('state1');
    expect(state.future).toHaveLength(1);
    expect(state.future[0]).toBe('state2');
  });

  it('should redo', () => {
    let state = historyReducer(undefined, saveState('state1'));
    state = historyReducer(state, saveState('state2'));
    state = historyReducer(state, undo());
    state = historyReducer(state, redo());
    expect(state.present).toBe('state2');
    expect(state.past).toHaveLength(1);
  });

  it('should clear history', () => {
    let state = historyReducer(undefined, saveState('state1'));
    state = historyReducer(state, saveState('state2'));
    state = historyReducer(state, clearHistory());
    expect(state.present).toBeNull();
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
  });

  it('should limit history size', () => {
    let state = historyReducer(undefined, saveState('state1'));
    for (let i = 2; i <= 60; i++) {
      state = historyReducer(state, saveState(`state${i}`));
    }
    expect(state.past.length).toBeLessThanOrEqual(50);
  });
});

