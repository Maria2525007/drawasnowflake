import snowflakeReducer, {
  addSnowflake,
  removeSnowflake,
  updateSnowflake,
  selectSnowflake,
  clearSnowflakes,
  setAnimationSpeed,
  toggleAnimation,
  loadSnowflakes,
  animateSnowflakes,
  Snowflake,
} from '../../../features/snowflake/snowflakeSlice';

describe('snowflakeSlice', () => {
  const initialState = {
    snowflakes: [] as Snowflake[],
    selectedId: null as string | null,
    animationSpeed: 1.5,
    isAnimating: true,
  };

  const mockSnowflake: Snowflake = {
    id: '1',
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    pattern: 'custom',
    data: null,
  };

  it('should return initial state', () => {
    const state = snowflakeReducer(undefined, { type: 'unknown' });
    expect(state.snowflakes).toEqual([]);
    expect(state.selectedId).toBeNull();
    expect(state.isAnimating).toBe(true);
  });

  describe('addSnowflake', () => {
    it('should add snowflake', () => {
      const state = snowflakeReducer(initialState, addSnowflake(mockSnowflake));
      expect(state.snowflakes).toHaveLength(1);
      expect(state.snowflakes[0]).toEqual(mockSnowflake);
    });

    it('should add multiple snowflakes', () => {
      let state = snowflakeReducer(initialState, addSnowflake(mockSnowflake));
      const snowflake2 = { ...mockSnowflake, id: '2' };
      state = snowflakeReducer(state, addSnowflake(snowflake2));
      expect(state.snowflakes).toHaveLength(2);
    });
  });

  describe('removeSnowflake', () => {
    it('should remove snowflake', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(stateWithSnowflake, removeSnowflake('1'));
      expect(state.snowflakes).toHaveLength(0);
    });

    it('should not remove non-existent snowflake', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        removeSnowflake('999')
      );
      expect(state.snowflakes).toHaveLength(1);
    });
  });

  describe('updateSnowflake', () => {
    it('should update snowflake', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        updateSnowflake({ id: '1', x: 200, y: 200 })
      );
      expect(state.snowflakes[0].x).toBe(200);
      expect(state.snowflakes[0].y).toBe(200);
    });

    it('should not update non-existent snowflake', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        updateSnowflake({ id: '999', x: 999 })
      );
      expect(state.snowflakes[0].x).toBe(100);
    });
  });

  describe('selectSnowflake', () => {
    it('should select snowflake', () => {
      const state = snowflakeReducer(initialState, selectSnowflake('1'));
      expect(state.selectedId).toBe('1');
    });

    it('should deselect snowflake', () => {
      const stateWithSelection = { ...initialState, selectedId: '1' };
      const state = snowflakeReducer(stateWithSelection, selectSnowflake(null));
      expect(state.selectedId).toBeNull();
    });
  });

  describe('clearSnowflakes', () => {
    it('should clear all snowflakes', () => {
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(stateWithSnowflakes, clearSnowflakes());
      expect(state.snowflakes).toHaveLength(0);
      expect(state.selectedId).toBeNull();
    });
  });

  describe('setAnimationSpeed', () => {
    it('should set animation speed', () => {
      const state = snowflakeReducer(initialState, setAnimationSpeed(2));
      expect(state.animationSpeed).toBe(2);
    });
  });

  describe('toggleAnimation', () => {
    it('should toggle animation', () => {
      const state = snowflakeReducer(initialState, toggleAnimation());
      expect(state.isAnimating).toBe(false);

      const state2 = snowflakeReducer(state, toggleAnimation());
      expect(state2.isAnimating).toBe(true);
    });
  });

  describe('loadSnowflakes', () => {
    it('should load snowflakes', () => {
      const snowflakes = [mockSnowflake, { ...mockSnowflake, id: '2' }];
      const state = snowflakeReducer(initialState, loadSnowflakes(snowflakes));
      expect(state.snowflakes).toHaveLength(2);
      expect(state.snowflakes).toEqual(snowflakes);
    });

    it('should replace existing snowflakes', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const newSnowflakes = [{ ...mockSnowflake, id: '2' }];
      const state = snowflakeReducer(
        stateWithSnowflake,
        loadSnowflakes(newSnowflakes)
      );
      expect(state.snowflakes).toHaveLength(1);
      expect(state.snowflakes[0].id).toBe('2');
    });
  });

  describe('animateSnowflakes', () => {
    it('should animate snowflakes rotation', () => {
      const snowflakeWithAnimation = {
        ...mockSnowflake,
        isFalling: true,
        fallSpeed: 1,
      };
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [snowflakeWithAnimation],
        animationSpeed: 1.5,
      };

      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].rotation).toBeGreaterThan(0);
    });

    it('should reset snowflake position when it falls below canvas', () => {
      const fallingSnowflake = {
        ...mockSnowflake,
        y: 1100,
        isFalling: true,
        fallSpeed: 1,
        driftPhase: 0,
      };
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [fallingSnowflake],
        animationSpeed: 1.5,
      };

      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].y).toBeLessThan(100);
    });
  });
});
