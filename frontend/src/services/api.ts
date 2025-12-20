import { getApiUrl } from '../config/apiConfig';

const API_URL = getApiUrl();

export interface SnowflakeData {
  id?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  pattern: string;
  imageData?: string;
  fallSpeed?: number;
  driftSpeed?: number;
  driftPhase?: number;
  isFalling?: boolean;
}

export const saveSnowflakeToServer = async (
  snowflake: SnowflakeData
): Promise<SnowflakeData> => {
  const { isFalling, ...dataToSave } = snowflake;
  void isFalling;
  const response = await fetch(`${API_URL}/snowflakes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSave),
  });

  if (!response.ok) {
    throw new Error('Failed to save snowflake');
  }

  return response.json();
};

export const getAllSnowflakes = async (): Promise<SnowflakeData[]> => {
  const response = await fetch(`${API_URL}/snowflakes`);

  if (!response.ok) {
    throw new Error('Failed to load snowflakes');
  }

  return response.json();
};

export const loadSnowflakeFromServer = async (
  id: string
): Promise<SnowflakeData> => {
  const response = await fetch(`${API_URL}/snowflakes/${id}`);

  if (!response.ok) {
    throw new Error('Failed to load snowflake');
  }

  return response.json();
};

export const updateSnowflakeOnServer = async (
  id: string,
  snowflake: Partial<SnowflakeData>
): Promise<SnowflakeData> => {
  const { isFalling, ...dataToUpdate } = snowflake;
  void isFalling;
  const response = await fetch(`${API_URL}/snowflakes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToUpdate),
  });

  if (!response.ok) {
    throw new Error('Failed to update snowflake');
  }

  return response.json();
};

export const deleteSnowflakeFromServer = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/snowflakes/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete snowflake');
  }
};
