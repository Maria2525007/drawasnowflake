import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  SavedData,
} from '../../utils/storage';

describe('storage utilities', () => {
  const mockData: SavedData = {
    snowflakes: [{ id: '1', x: 100, y: 100 }],
    timestamp: Date.now(),
  };

  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToLocalStorage', () => {
    it('should save data to localStorage', () => {
      saveToLocalStorage(mockData);

      const saved = localStorage.getItem('drawasnowflake_data');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(mockData);
    });

    it('should handle empty data', () => {
      const emptyData: SavedData = {
        snowflakes: [],
        timestamp: Date.now(),
      };

      saveToLocalStorage(emptyData);

      const saved = localStorage.getItem('drawasnowflake_data');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.snowflakes).toEqual([]);
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load data from localStorage', () => {
      localStorage.setItem('drawasnowflake_data', JSON.stringify(mockData));

      const loaded = loadFromLocalStorage();

      expect(loaded).toEqual(mockData);
    });

    it('should return null if no data exists', () => {
      const loaded = loadFromLocalStorage();
      expect(loaded).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorage.setItem('drawasnowflake_data', 'invalid json');

      const loaded = loadFromLocalStorage();
      expect(loaded).toBeNull();
    });
  });

  describe('clearLocalStorage', () => {
    it('should clear data from localStorage', () => {
      localStorage.setItem('drawasnowflake_data', JSON.stringify(mockData));

      clearLocalStorage();

      const saved = localStorage.getItem('drawasnowflake_data');
      expect(saved).toBeNull();
    });
  });
});
