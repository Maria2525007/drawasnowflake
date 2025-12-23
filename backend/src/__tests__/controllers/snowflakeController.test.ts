import { Request, Response } from 'express';
import { snowflakeController } from '../../controllers/snowflakeController';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    snowflake: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('snowflakeController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
    mockRequest = {
      body: {},
      params: {},
    };
  });

  it('should create snowflake', async () => {
    const mockSnowflake = {
      id: '1',
      x: 100,
      y: 100,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
    };

    const prisma = new PrismaClient();
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);

    mockRequest.body = mockSnowflake;
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should get all snowflakes', async () => {
    const mockSnowflakes = [
      { id: '1', x: 100, y: 100, rotation: 0, scale: 1, pattern: 'custom' },
    ];

    const prisma = new PrismaClient();
    (prisma.snowflake.findMany as jest.Mock).mockResolvedValue(mockSnowflakes);

    await snowflakeController.getAll(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflakes);
  });

  it('should get snowflake by id', async () => {
    const mockSnowflake = { id: '1', x: 100, y: 100 };

    const prisma = new PrismaClient();
    (prisma.snowflake.findUnique as jest.Mock).mockResolvedValue(mockSnowflake);

    mockRequest.params = { id: '1' };
    await snowflakeController.getById(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should return 404 if snowflake not found', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.findUnique as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    await snowflakeController.getById(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(404);
  });

  it('should update snowflake', async () => {
    const mockSnowflake = { id: '1', x: 200, y: 200 };

    const prisma = new PrismaClient();
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);

    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200, y: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should delete snowflake', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.delete as jest.Mock).mockResolvedValue({});

    mockRequest.params = { id: '1' };
    await snowflakeController.delete(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith({ success: true });
  });

  it('should handle error in getAll', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.findMany as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    await snowflakeController.getAll(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Failed to get snowflakes',
    });
  });

  it('should handle error in create', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.create as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    mockRequest.body = { x: 100, y: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Failed to create snowflake',
    });
  });

  it('should handle error in getById', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.findUnique as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    mockRequest.params = { id: '1' };
    await snowflakeController.getById(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to get snowflake' });
  });

  it('should handle error in update', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.update as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Failed to update snowflake',
    });
  });

  it('should handle error in delete', async () => {
    const prisma = new PrismaClient();
    (prisma.snowflake.delete as jest.Mock).mockRejectedValue(
      new Error('Database error')
    );

    mockRequest.params = { id: '1' };
    await snowflakeController.delete(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Failed to delete snowflake',
    });
  });

  it('should create snowflake with default values', async () => {
    const mockSnowflake = {
      id: '1',
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      pattern: 'custom',
    };

    const prisma = new PrismaClient();
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);

    mockRequest.body = {};
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update snowflake with partial data', async () => {
    const mockSnowflake = { id: '1', x: 200 };

    const prisma = new PrismaClient();
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);

    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with imageData as string', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', imageData: 'data:image/png' };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { imageData: 'data:image/png' };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with imageData as null', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', imageData: null };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { imageData: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with imageData as empty string', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', imageData: null };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { imageData: '' };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with x undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { y: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with y undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', y: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with rotation undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', rotation: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with scale undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', scale: 1 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with pattern undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', pattern: 'custom' };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with fallSpeed undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', fallSpeed: null };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with driftSpeed undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', driftSpeed: null };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with driftPhase undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', driftPhase: null };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: 100 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with y undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with rotation defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', rotation: 45 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { rotation: 45 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with rotation undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with scale defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', scale: 2 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { scale: 2 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with scale undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with pattern defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', pattern: 'star' };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { pattern: 'star' };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with pattern undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with imageData defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', imageData: 'data:image' };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { imageData: 'data:image' };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with imageData undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with fallSpeed defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', fallSpeed: 5 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { fallSpeed: 5 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with fallSpeed undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with driftSpeed defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', driftSpeed: 3 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { driftSpeed: 3 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with driftSpeed undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with driftPhase defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', driftPhase: 1.5 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { driftPhase: 1.5 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with driftPhase undefined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 200 };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = { x: 200 };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should update with all fields defined', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = {
      id: '1',
      x: 100,
      y: 200,
      rotation: 45,
      scale: 2,
      pattern: 'star',
      imageData: 'data',
      fallSpeed: 5,
      driftSpeed: 3,
      driftPhase: 1.5,
    };
    (prisma.snowflake.update as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.params = { id: '1' };
    mockRequest.body = {
      x: 100,
      y: 200,
      rotation: 45,
      scale: 2,
      pattern: 'star',
      imageData: 'data',
      fallSpeed: 5,
      driftSpeed: 3,
      driftPhase: 1.5,
    };
    await snowflakeController.update(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should create with all optional fields', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = {
      id: '1',
      fallSpeed: 5,
      driftSpeed: 3,
      driftPhase: 1.5,
    };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { fallSpeed: 5, driftSpeed: 3, driftPhase: 1.5 };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should test create with x nullish', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', x: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { x: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should test create with y nullish', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', y: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { y: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should test create with rotation nullish', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', rotation: 0 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { rotation: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should test create with scale nullish', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', scale: 1 };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { scale: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });

  it('should test create with pattern nullish', async () => {
    const prisma = new PrismaClient();
    const mockSnowflake = { id: '1', pattern: 'custom' };
    (prisma.snowflake.create as jest.Mock).mockResolvedValue(mockSnowflake);
    mockRequest.body = { pattern: null };
    await snowflakeController.create(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockJson).toHaveBeenCalledWith(mockSnowflake);
  });
});
