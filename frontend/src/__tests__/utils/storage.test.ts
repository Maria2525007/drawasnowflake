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
    jest.clearAllMocks();
  });

  describe('saveToLocalStorage', () => {
    it('should save data to localStorage', () => {
      saveToLocalStorage(mockData);

      const saved = localStorage.getItem('drawasnowflake_data');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual(mockData);
    });

    it('should save data with correct key', () => {
      saveToLocalStorage(mockData);

      expect(localStorage.getItem('drawasnowflake_data')).toBeTruthy();
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

    it('should handle localStorage quota exceeded error', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new DOMException('QuotaExceededError');
      });

      expect(() => saveToLocalStorage(mockData)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      Storage.prototype.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });

    it('should handle other localStorage errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => saveToLocalStorage(mockData)).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      Storage.prototype.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
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

    it('should return null if data is invalid JSON', () => {
      localStorage.setItem('drawasnowflake_data', 'invalid json');

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const loaded = loadFromLocalStorage();

      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle localStorage read errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage read error');
      });

      const loaded = loadFromLocalStorage();

      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      Storage.prototype.getItem = originalGetItem;
      consoleErrorSpy.mockRestore();
    });

    it('should load data with complex snowflakes array', () => {
      const complexData: SavedData = {
        snowflakes: [
          { id: '1', x: 100, y: 100, rotation: 45 },
          { id: '2', x: 200, y: 200, rotation: 90 },
        ],
        timestamp: 1234567890,
      };

      localStorage.setItem('drawasnowflake_data', JSON.stringify(complexData));

      const loaded = loadFromLocalStorage();

      expect(loaded).toEqual(complexData);
      expect(loaded?.snowflakes).toHaveLength(2);
    });
  });

  describe('clearLocalStorage', () => {
    it('should remove data from localStorage', () => {
      localStorage.setItem('drawasnowflake_data', JSON.stringify(mockData));

      clearLocalStorage();

      expect(localStorage.getItem('drawasnowflake_data')).toBeNull();
    });

    it('should not throw if data does not exist', () => {
      expect(() => clearLocalStorage()).not.toThrow();
    });

    it('should handle localStorage remove errors', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const originalRemoveItem = Storage.prototype.removeItem;
      Storage.prototype.removeItem = jest.fn(() => {
        throw new Error('Storage remove error');
      });

      expect(() => clearLocalStorage()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      Storage.prototype.removeItem = originalRemoveItem;
      consoleErrorSpy.mockRestore();
    });

    it('should only remove the specific key', () => {
      localStorage.setItem('drawasnowflake_data', JSON.stringify(mockData));
      localStorage.setItem('other_key', 'other_value');

      clearLocalStorage();

      expect(localStorage.getItem('drawasnowflake_data')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('other_value');
    });
  });

  describe('Integration', () => {
    it('should save and load data correctly', () => {
      saveToLocalStorage(mockData);
      const loaded = loadFromLocalStorage();

      expect(loaded).toEqual(mockData);
    });

    it('should save, clear, and load null', () => {
      saveToLocalStorage(mockData);
      clearLocalStorage();
      const loaded = loadFromLocalStorage();

      expect(loaded).toBeNull();
    });

    it('should overwrite existing data', () => {
      const firstData: SavedData = {
        snowflakes: [{ id: '1' }],
        timestamp: 1000,
      };
      const secondData: SavedData = {
        snowflakes: [{ id: '2' }],
        timestamp: 2000,
      };

      saveToLocalStorage(firstData);
      saveToLocalStorage(secondData);

      const loaded = loadFromLocalStorage();

      expect(loaded).toEqual(secondData);
      expect(loaded?.timestamp).toBe(2000);
    });
  });
});