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
});
