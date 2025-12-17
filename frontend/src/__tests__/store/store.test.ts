import { store } from '../../store/store';
import { addSnowflake } from '../../features/snowflake/snowflakeSlice';
import { setTool } from '../../features/drawing/drawingSlice';
import { saveState } from '../../features/history/historySlice';

describe('store', () => {
  it('should have correct initial state', () => {
    const state = store.getState();
    expect(state.snowflake).toBeDefined();
    expect(state.drawing).toBeDefined();
    expect(state.history).toBeDefined();
  });

  it('should dispatch snowflake actions', () => {
    const initialState = store.getState();
    store.dispatch(addSnowflake({
      id: '1',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
      data: null,
    }));
    const newState = store.getState();
    expect(newState.snowflake.snowflakes).toHaveLength(initialState.snowflake.snowflakes.length + 1);
  });

  it('should dispatch drawing actions', () => {
    store.dispatch(setTool('eraser'));
    const state = store.getState();
    expect(state.drawing.tool).toBe('eraser');
  });

  it('should dispatch history actions', () => {
    store.dispatch(saveState('test-state'));
    const state = store.getState();
    expect(state.history.present).toBe('test-state');
  });
});

