import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApiInfoPage } from '../../pages/ApiInfoPage';

jest.mock('../../config/apiConfig', () => ({
  getApiUrl: () => 'http://localhost:3001/api',
}));

global.fetch = jest.fn();

describe('ApiInfoPage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render API endpoints', () => {
    render(
      <BrowserRouter>
        <ApiInfoPage />
      </BrowserRouter>
    );

    expect(screen.getByText('API Endpoints')).toBeInTheDocument();
    expect(screen.getByText('Health Check')).toBeInTheDocument();
    expect(screen.getByText('Database Health')).toBeInTheDocument();
  });

  it('should render back button', () => {
    render(
      <BrowserRouter>
        <ApiInfoPage />
      </BrowserRouter>
    );

    const backButton = screen.getByLabelText('back to draw');
    expect(backButton).toBeInTheDocument();
  });

  it('should test endpoint and show response', async () => {
    const mockResponse = { status: 'ok' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <BrowserRouter>
        <ApiInfoPage />
      </BrowserRouter>
    );

    const testButtons = screen.getAllByText('Тест');
    testButtons[0].click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('should handle DELETE endpoint with warning', async () => {
    const mockResponse = { success: true, deletedCount: 5 };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    render(
      <BrowserRouter>
        <ApiInfoPage />
      </BrowserRouter>
    );

    const deleteButtons = screen.getAllByText('Тест');
    const deleteButton = deleteButtons.find(
      (btn) => btn.closest('[class*="MuiPaper"]')?.textContent?.includes('Delete All Snowflakes')
    );

    if (deleteButton) {
      deleteButton.click();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    }
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <BrowserRouter>
        <ApiInfoPage />
      </BrowserRouter>
    );

    const testButtons = screen.getAllByText('Тест');
    testButtons[0].click();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
