global.fetch = jest.fn();

const mockApiUrl = 'http://localhost:3001/api';

jest.mock('../../config/apiConfig', () => ({
  getApiUrl: jest.fn(() => mockApiUrl),
}));

jest.mock('../../config/constants', () => ({
  API_CONFIG: {
    DEFAULT_URL: mockApiUrl,
    CONTENT_TYPE_JSON: 'application/json',
  },
}));

import {
  saveSnowflakeToServer,
  getAllSnowflakes,
  loadSnowflakeFromServer,
  updateSnowflakeOnServer,
  deleteSnowflakeFromServer,
} from '../../services/api';

describe('api', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should save snowflake to server', async () => {
    const mockSnowflake = {
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
      imageData: 'data:image/png;base64,test',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', ...mockSnowflake }),
    });

    const result = await saveSnowflakeToServer(mockSnowflake);
    expect(result.id).toBe('1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/snowflakes'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should get all snowflakes', async () => {
    const mockSnowflakes = [
      { id: '1', x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSnowflakes,
    });

    const result = await getAllSnowflakes();
    expect(result).toEqual(mockSnowflakes);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/snowflakes'));
  });

  it('should load snowflake from server', async () => {
    const mockSnowflake = {
      id: '1',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSnowflake,
    });

    const result = await loadSnowflakeFromServer('1');
    expect(result).toEqual(mockSnowflake);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/snowflakes/1')
    );
  });

  it('should update snowflake on server', async () => {
    const mockUpdate = { x: 200, y: 200 };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        ...mockUpdate,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
      }),
    });

    const result = await updateSnowflakeOnServer('1', mockUpdate);
    expect(result.x).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/snowflakes/1'),
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('should delete snowflake from server', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    await deleteSnowflakeFromServer('1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/snowflakes/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('should handle errors when saving', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(
      saveSnowflakeToServer({
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
      })
    ).rejects.toThrow();
  });

  it('should handle errors when getting all snowflakes', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(getAllSnowflakes()).rejects.toThrow();
  });

  it('should handle errors when loading snowflake', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(loadSnowflakeFromServer('1')).rejects.toThrow();
  });

  it('should handle errors when updating snowflake', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(updateSnowflakeOnServer('1', { x: 100 })).rejects.toThrow();
  });

  it('should handle errors when deleting snowflake', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    await expect(deleteSnowflakeFromServer('1')).rejects.toThrow();
  });

  it('should exclude isFalling when saving', async () => {
    const mockSnowflake = {
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
      isFalling: true,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', ...mockSnowflake }),
    });

    await saveSnowflakeToServer(mockSnowflake);

    const callArgs = (fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.isFalling).toBeUndefined();
  });

  it('should exclude isFalling when updating', async () => {
    const mockUpdate = { x: 200, isFalling: true };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: '1',
        ...mockUpdate,
        rotation: 0,
        scale: 1,
        pattern: 'custom',
      }),
    });

    await updateSnowflakeOnServer('1', mockUpdate);

    const callArgs = (fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.isFalling).toBeUndefined();
  });
});
