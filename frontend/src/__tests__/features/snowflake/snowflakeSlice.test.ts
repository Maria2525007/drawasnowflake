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
  const mockSnowflake: Snowflake = {
    id: '1',
    x: 100,
    y: 100,
    rotation: 0,
    scale: 1,
    pattern: 'default',
    data: null,
    imageData: 'data:image/png;base64,test',
    fallSpeed: 50,
    isFalling: true,
    driftSpeed: 5,
    driftPhase: 0,
  };

  const initialState = {
    snowflakes: [],
    selectedId: null,
    animationSpeed: 1,
    isAnimating: true,
  };

  describe('Initial State', () => {
    it('should return initial state', () => {
      expect(snowflakeReducer(undefined, { type: 'unknown' })).toEqual({
        snowflakes: [],
        selectedId: null,
        animationSpeed: 1,
        isAnimating: true,
      });
    });
  });

  describe('addSnowflake', () => {
    it('should add a snowflake to empty state', () => {
      const state = snowflakeReducer(initialState, addSnowflake(mockSnowflake));
      expect(state.snowflakes).toHaveLength(1);
      expect(state.snowflakes[0]).toEqual(mockSnowflake);
    });

    it('should add multiple snowflakes', () => {
      let state = snowflakeReducer(initialState, addSnowflake(mockSnowflake));
      const snowflake2 = { ...mockSnowflake, id: '2' };
      state = snowflakeReducer(state, addSnowflake(snowflake2));

      expect(state.snowflakes).toHaveLength(2);
      expect(state.snowflakes[0].id).toBe('1');
      expect(state.snowflakes[1].id).toBe('2');
    });

    it('should preserve other state when adding snowflake', () => {
      const state = snowflakeReducer(initialState, addSnowflake(mockSnowflake));
      expect(state.selectedId).toBeNull();
      expect(state.animationSpeed).toBe(1);
      expect(state.isAnimating).toBe(true);
    });
  });

  describe('removeSnowflake', () => {
    it('should remove a snowflake by id', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(stateWithSnowflake, removeSnowflake('1'));
      expect(state.snowflakes).toHaveLength(0);
    });

    it('should not remove if id does not exist', () => {
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

    it('should remove correct snowflake from multiple', () => {
      const snowflake2 = { ...mockSnowflake, id: '2' };
      const snowflake3 = { ...mockSnowflake, id: '3' };
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [mockSnowflake, snowflake2, snowflake3],
      };
      const state = snowflakeReducer(stateWithSnowflakes, removeSnowflake('2'));

      expect(state.snowflakes).toHaveLength(2);
      expect(state.snowflakes[0].id).toBe('1');
      expect(state.snowflakes[1].id).toBe('3');
    });

    it('should preserve other state when removing snowflake', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
        selectedId: '1',
      };
      const state = snowflakeReducer(stateWithSnowflake, removeSnowflake('1'));
      expect(state.selectedId).toBe('1');
      expect(state.animationSpeed).toBe(1);
    });
  });

  describe('updateSnowflake', () => {
    it('should update snowflake properties', () => {
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
      expect(state.snowflakes[0].id).toBe('1');
    });

    it('should update multiple properties', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [mockSnowflake],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        updateSnowflake({
          id: '1',
          x: 300,
          y: 400,
          rotation: 45,
          scale: 1.5,
        })
      );

      expect(state.snowflakes[0].x).toBe(300);
      expect(state.snowflakes[0].y).toBe(400);
      expect(state.snowflakes[0].rotation).toBe(45);
      expect(state.snowflakes[0].scale).toBe(1.5);
    });

    it('should not update if id does not exist', () => {
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

    it('should preserve other snowflakes when updating', () => {
      const snowflake2 = { ...mockSnowflake, id: '2', x: 200 };
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [mockSnowflake, snowflake2],
      };
      const state = snowflakeReducer(
        stateWithSnowflakes,
        updateSnowflake({ id: '1', x: 500 })
      );

      expect(state.snowflakes[0].x).toBe(500);
      expect(state.snowflakes[1].x).toBe(200);
    });
  });

  describe('selectSnowflake', () => {
    it('should select a snowflake by id', () => {
      const state = snowflakeReducer(initialState, selectSnowflake('1'));
      expect(state.selectedId).toBe('1');
    });

    it('should deselect when setting to null', () => {
      const stateWithSelected = { ...initialState, selectedId: '1' };
      const state = snowflakeReducer(stateWithSelected, selectSnowflake(null));
      expect(state.selectedId).toBeNull();
    });

    it('should change selection to different id', () => {
      const stateWithSelected = { ...initialState, selectedId: '1' };
      const state = snowflakeReducer(stateWithSelected, selectSnowflake('2'));
      expect(state.selectedId).toBe('2');
    });

    it('should preserve other state when selecting', () => {
      const state = snowflakeReducer(initialState, selectSnowflake('1'));
      expect(state.snowflakes).toHaveLength(0);
      expect(state.animationSpeed).toBe(1);
    });
  });

  describe('clearSnowflakes', () => {
    it('should clear all snowflakes and selection', () => {
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [mockSnowflake, { ...mockSnowflake, id: '2' }],
        selectedId: '1',
      };
      const state = snowflakeReducer(stateWithSnowflakes, clearSnowflakes());

      expect(state.snowflakes).toHaveLength(0);
      expect(state.selectedId).toBeNull();
    });

    it('should preserve animation settings', () => {
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [mockSnowflake],
        animationSpeed: 1.5,
        isAnimating: false,
      };
      const state = snowflakeReducer(stateWithSnowflakes, clearSnowflakes());

      expect(state.animationSpeed).toBe(1.5);
      expect(state.isAnimating).toBe(false);
    });
  });

  describe('setAnimationSpeed', () => {
    it('should set animation speed to valid value', () => {
      const state = snowflakeReducer(initialState, setAnimationSpeed(1.5));
      expect(state.animationSpeed).toBe(1.5);
    });

    it('should clamp animation speed to minimum', () => {
      const state = snowflakeReducer(initialState, setAnimationSpeed(-1));
      expect(state.animationSpeed).toBe(0);
    });

    it('should clamp animation speed to maximum', () => {
      const state = snowflakeReducer(initialState, setAnimationSpeed(3));
      expect(state.animationSpeed).toBe(2);
    });

    it('should handle edge values', () => {
      const state1 = snowflakeReducer(initialState, setAnimationSpeed(0));
      expect(state1.animationSpeed).toBe(0);

      const state2 = snowflakeReducer(initialState, setAnimationSpeed(2));
      expect(state2.animationSpeed).toBe(2);
    });

    it('should preserve other state when setting speed', () => {
      const state = snowflakeReducer(initialState, setAnimationSpeed(1.5));
      expect(state.snowflakes).toHaveLength(0);
      expect(state.selectedId).toBeNull();
      expect(state.isAnimating).toBe(true);
    });
  });

  describe('toggleAnimation', () => {
    it('should toggle animation from true to false', () => {
      const state = snowflakeReducer(initialState, toggleAnimation());
      expect(state.isAnimating).toBe(false);
    });

    it('should toggle animation from false to true', () => {
      const stateWithAnimationOff = { ...initialState, isAnimating: false };
      const state = snowflakeReducer(stateWithAnimationOff, toggleAnimation());
      expect(state.isAnimating).toBe(true);
    });

    it('should preserve other state when toggling', () => {
      const state = snowflakeReducer(initialState, toggleAnimation());
      expect(state.snowflakes).toHaveLength(0);
      expect(state.selectedId).toBeNull();
      expect(state.animationSpeed).toBe(1);
    });
  });

  describe('loadSnowflakes', () => {
    it('should load snowflakes array', () => {
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

    it('should handle empty array', () => {
      const state = snowflakeReducer(initialState, loadSnowflakes([]));
      expect(state.snowflakes).toHaveLength(0);
    });
  });

  describe('animateSnowflakes', () => {
    it('should update snowflake position and rotation', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [{ ...mockSnowflake, isFalling: true, fallSpeed: 50 }],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].y).toBeGreaterThan(100);
      expect(state.snowflakes[0].rotation).toBeGreaterThan(0);
    });

    it('should reset snowflake position when it reaches bottom', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [
          { ...mockSnowflake, y: 1100, isFalling: true, fallSpeed: 50 },
        ],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].y).toBeLessThan(0);
    });

    it('should handle drift movement', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [
          {
            ...mockSnowflake,
            x: 400,
            isFalling: true,
            fallSpeed: 50,
            driftSpeed: 10,
            driftPhase: 0,
          },
        ],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].x).toBeDefined();
    });

    it('should clamp x position to canvas boundaries', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [
          {
            ...mockSnowflake,
            x: 50,
            isFalling: true,
            driftSpeed: -100,
            driftPhase: 0,
          },
        ],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].x).toBeGreaterThanOrEqual(50);
    });

    it('should not animate non-falling snowflakes', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [
          { ...mockSnowflake, isFalling: false, y: 100, fallSpeed: 50 },
        ],
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].y).toBe(100);
    });

    it('should handle rotation wrapping at 360 degrees', () => {
      const stateWithSnowflake = {
        ...initialState,
        snowflakes: [
          {
            ...mockSnowflake,
            rotation: 350,
            isFalling: true,
            fallSpeed: 50,
          },
        ],
        animationSpeed: 1,
      };
      const state = snowflakeReducer(
        stateWithSnowflake,
        animateSnowflakes({
          deltaTime: 1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].rotation).toBeLessThan(360);
      expect(state.snowflakes[0].rotation).toBeGreaterThanOrEqual(0);
    });

    it('should update multiple snowflakes independently', () => {
      const stateWithSnowflakes = {
        ...initialState,
        snowflakes: [
          { ...mockSnowflake, id: '1', y: 100, isFalling: true, fallSpeed: 50 },
          { ...mockSnowflake, id: '2', y: 200, isFalling: true, fallSpeed: 30 },
        ],
      };
      const state = snowflakeReducer(
        stateWithSnowflakes,
        animateSnowflakes({
          deltaTime: 0.1,
          canvasHeight: 1000,
          canvasWidth: 800,
        })
      );

      expect(state.snowflakes[0].y).toBeGreaterThan(100);
      expect(state.snowflakes[1].y).toBeGreaterThan(200);
      expect(state.snowflakes[0].y).not.toBe(state.snowflakes[1].y);
    });
  });
});
