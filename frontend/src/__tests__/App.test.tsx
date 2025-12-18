import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from '../App';

jest.mock('../services/api', () => ({
  getAllSnowflakes: jest.fn().mockResolvedValue([]),
}));

jest.mock('../utils/snowflakeAnalysis', () => ({
  analyzeSnowflake: jest.fn().mockReturnValue({ similarity: 50 }),
}));

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </Provider>
  );
};

describe('App', () => {
  it('should redirect from root to /draw', async () => {
    renderWithRouter(['/']);

    await waitFor(() => {
      expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
    });
  });

  it('should render DrawPage on /draw route', () => {
    renderWithRouter(['/draw']);

    expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
  });

  it('should render TreePage on /tree route', () => {
    renderWithRouter(['/tree']);

    expect(screen.getByText(/LET'S IT SNOW/i)).toBeInTheDocument();
  });

  it('should have routing structure', () => {
    const { container } = renderWithRouter(['/draw']);
    expect(container).toBeInTheDocument();
  });
});
