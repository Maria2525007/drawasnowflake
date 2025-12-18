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

  it('should add a snowflake', () => {
    const state = snowflakeReducer(undefined, addSnowflake(mockSnowflake));
    expect(state.snowflakes).toHaveLength(1);
    expect(state.snowflakes[0]).toEqual(mockSnowflake);
  });

  it('should remove a snowflake', () => {
    const initialState = {
      snowflakes: [mockSnowflake],
      selectedId: null,
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(initialState, removeSnowflake('1'));
    expect(state.snowflakes).toHaveLength(0);
  });

  it('should update a snowflake', () => {
    const initialState = {
      snowflakes: [mockSnowflake],
      selectedId: null,
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(
      initialState,
      updateSnowflake({ id: '1', x: 200, y: 200 })
    );
    expect(state.snowflakes[0].x).toBe(200);
    expect(state.snowflakes[0].y).toBe(200);
  });

  it('should select a snowflake', () => {
    const state = snowflakeReducer(undefined, selectSnowflake('1'));
    expect(state.selectedId).toBe('1');
  });

  it('should clear all snowflakes', () => {
    const initialState = {
      snowflakes: [mockSnowflake],
      selectedId: '1',
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(initialState, clearSnowflakes());
    expect(state.snowflakes).toHaveLength(0);
    expect(state.selectedId).toBeNull();
  });

  it('should set animation speed', () => {
    const state = snowflakeReducer(undefined, setAnimationSpeed(1.5));
    expect(state.animationSpeed).toBe(1.5);
  });

  it('should clamp animation speed to valid range', () => {
    const state1 = snowflakeReducer(undefined, setAnimationSpeed(-1));
    expect(state1.animationSpeed).toBe(0);

    const state2 = snowflakeReducer(undefined, setAnimationSpeed(3));
    expect(state2.animationSpeed).toBe(2);
  });

  it('should toggle animation', () => {
    const initialState = {
      snowflakes: [],
      selectedId: null,
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(initialState, toggleAnimation());
    expect(state.isAnimating).toBe(false);
  });

  it('should load snowflakes', () => {
    const snowflakes = [mockSnowflake, { ...mockSnowflake, id: '2' }];
    const state = snowflakeReducer(undefined, loadSnowflakes(snowflakes));
    expect(state.snowflakes).toHaveLength(2);
  });

  it('should animate snowflakes', () => {
    const initialState = {
      snowflakes: [{ ...mockSnowflake, isFalling: true, fallSpeed: 50 }],
      selectedId: null,
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(
      initialState,
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
    const initialState = {
      snowflakes: [
        { ...mockSnowflake, y: 1100, isFalling: true, fallSpeed: 50 },
      ],
      selectedId: null,
      animationSpeed: 1,
      isAnimating: true,
    };
    const state = snowflakeReducer(
      initialState,
      animateSnowflakes({
        deltaTime: 0.1,
        canvasHeight: 1000,
        canvasWidth: 800,
      })
    );
    expect(state.snowflakes[0].y).toBeLessThan(0);
  });
});
