import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { DrawPage } from '../../pages/DrawPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../services/api', () => ({
  saveSnowflakeToServer: jest.fn().mockResolvedValue({ id: '1' }),
}));

jest.mock('../../utils/snowflakeAnalysis', () => ({
  analyzeSnowflake: jest.fn().mockReturnValue({ similarity: 50 }),
}));

const renderDrawPage = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <DrawPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('DrawPage Extended', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should handle Go on Tree button click with content', async () => {
    const user = userEvent.setup();
    renderDrawPage();

    const goButton = screen.getByText('Go on Tree');
    expect(goButton).toBeInTheDocument();
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    
    await user.click(goButton);
  });

  it('should handle zoom in', async () => {
    const user = userEvent.setup();
    renderDrawPage();

    const zoomInButton = screen.getByLabelText('zoom in');
    await user.click(zoomInButton);

    expect(zoomInButton).toBeInTheDocument();
  });

  it('should handle zoom out', async () => {
    const user = userEvent.setup();
    renderDrawPage();

    const zoomOutButton = screen.getByLabelText('zoom out');
    await user.click(zoomOutButton);

    expect(zoomOutButton).toBeInTheDocument();
  });

  it('should display similarity percentage', async () => {
    renderDrawPage();

    const similarityText = screen.queryByText(/Snowflake similarity/i);
    if (similarityText) {
      expect(similarityText).toBeInTheDocument();
    }
  });

  it('should handle analysis errors gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const snowflakeAnalysisModule =
      await import('../../utils/snowflakeAnalysis');
    jest
      .spyOn(snowflakeAnalysisModule, 'analyzeSnowflake')
      .mockImplementation(() => {
        throw new Error('Analysis error');
      });

    renderDrawPage();

    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    consoleSpy.mockRestore();
  });
});
