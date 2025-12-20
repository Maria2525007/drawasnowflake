import {
  getAllSnowflakes,
  saveSnowflakeToServer,
  updateSnowflakeOnServer,
  deleteSnowflakeFromServer,
} from '../../services/api';

jest.mock('../../config/apiConfig', () => ({
  getApiUrl: jest.fn(() => 'http://localhost:3001/api'),
}));

global.fetch = jest.fn();

describe('api service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSnowflakes', () => {
    it('should fetch all snowflakes', async () => {
      const mockSnowflakes = [
        { id: '1', x: 100, y: 100 },
        { id: '2', x: 200, y: 200 },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnowflakes,
      });

      const result = await getAllSnowflakes();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/snowflakes'
      );
      expect(result).toEqual(mockSnowflakes);
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getAllSnowflakes()).rejects.toThrow();
    });
  });

  describe('saveSnowflakeToServer', () => {
    it('should create snowflake', async () => {
      const mockSnowflake = { id: '1', x: 100, y: 100 };
      const newSnowflake = {
        x: 100,
        y: 100,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnowflake,
      });

      const result = await saveSnowflakeToServer(newSnowflake);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/snowflakes',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSnowflake),
        })
      );
      expect(result).toEqual(mockSnowflake);
    });
  });

  describe('updateSnowflakeOnServer', () => {
    it('should update snowflake', async () => {
      const mockSnowflake = { id: '1', x: 200, y: 200 };
      const updates = { x: 200, y: 200 };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSnowflake,
      });

      const result = await updateSnowflakeOnServer('1', updates);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/snowflakes/1',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })
      );
      expect(result).toEqual(mockSnowflake);
    });
  });

  describe('deleteSnowflakeFromServer', () => {
    it('should delete snowflake', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteSnowflakeFromServer('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/snowflakes/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
