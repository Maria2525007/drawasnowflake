import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
} from '../../utils/storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load data', () => {
    const data = {
      snowflakes: [{ id: '1', x: 100, y: 100 }],
      timestamp: Date.now(),
    };
    saveToLocalStorage(data);
    const loaded = loadFromLocalStorage();
    expect(loaded).toEqual(data);
  });

  it('should return null when no data exists', () => {
    const loaded = loadFromLocalStorage();
    expect(loaded).toBeNull();
  });

  it('should clear localStorage', () => {
    const data = {
      snowflakes: [{ id: '1' }],
      timestamp: Date.now(),
    };
    saveToLocalStorage(data);
    clearLocalStorage();
    const loaded = loadFromLocalStorage();
    expect(loaded).toBeNull();
  });
});

