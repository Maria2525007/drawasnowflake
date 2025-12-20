import { store } from '../../store/store';
import { setTool } from '../../features/drawing/drawingSlice';
import { saveState } from '../../features/history/historySlice';
import { addSnowflake } from '../../features/snowflake/snowflakeSlice';

describe('store', () => {
  it('should have correct initial state', () => {
    const state = store.getState();
    expect(state.drawing).toBeDefined();
    expect(state.history).toBeDefined();
    expect(state.snowflake).toBeDefined();
  });

  it('should dispatch actions', () => {
    store.dispatch(setTool('eraser'));
    const state = store.getState();
    expect(state.drawing.tool).toBe('eraser');
  });

  it('should handle multiple reducers', () => {
    store.dispatch(setTool('pencil'));
    store.dispatch(saveState('test-state'));
    store.dispatch(
      addSnowflake({
        id: '1',
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
        data: null,
      })
    );

    const state = store.getState();
    expect(state.drawing.tool).toBe('pencil');
    expect(state.history.present).toBe('test-state');
    expect(state.snowflake.snowflakes).toHaveLength(1);
  });
});
