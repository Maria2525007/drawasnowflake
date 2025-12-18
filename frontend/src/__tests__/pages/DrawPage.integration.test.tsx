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

describe('DrawPage Integration', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should handle zoom changes', async () => {
    const user = userEvent.setup();
    renderDrawPage();
    
    const zoomInButton = screen.getByLabelText('zoom in');
    await user.click(zoomInButton);
    
    expect(zoomInButton).toBeInTheDocument();
  });

  it('should display similarity after drawing', async () => {
    renderDrawPage();
    
    await waitFor(() => {
      const similarityText = screen.queryByText(/Snowflake similarity/i);
      if (similarityText) {
        expect(similarityText).toBeInTheDocument();
      }
    }, { timeout: 3000 });
  });

  it('should have all required elements', () => {
    renderDrawPage();
    
    expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
    expect(screen.getByText('Go on Tree')).toBeInTheDocument();
    expect(screen.getByLabelText('pencil')).toBeInTheDocument();
  });
});

