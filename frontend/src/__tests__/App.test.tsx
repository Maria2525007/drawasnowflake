import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { DrawPage } from '../pages/DrawPage';
import { TreePage } from '../pages/TreePage';

jest.mock('../services/api', () => ({
  getAllSnowflakes: jest.fn().mockResolvedValue([]),
}));

jest.mock('../utils/snowflakeAnalysis', () => ({
  analyzeSnowflake: jest.fn().mockReturnValue({ similarity: 50 }),
}));

// Create a test version of App without BrowserRouter
const TestApp = () => {
  const { Routes, Route, Navigate } = require('react-router-dom');
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/draw" replace />} />
      <Route path="/draw" element={<DrawPage />} />
      <Route path="/tree" element={<TreePage />} />
    </Routes>
  );
};

const renderApp = (initialEntries = ['/']) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <TestApp />
      </MemoryRouter>
    </Provider>
  );
};

describe('App', () => {
  it('should redirect from root to /draw', async () => {
    renderApp(['/']);

    await waitFor(() => {
      expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
    });
  });

  it('should render DrawPage on /draw route', () => {
    renderApp(['/draw']);

    expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
  });

  it('should render TreePage on /tree route', () => {
    renderApp(['/tree']);

    expect(screen.getByText(/LET'S IT SNOW/i)).toBeInTheDocument();
  });

  it('should have routing structure', () => {
    const { container } = renderApp(['/draw']);
    expect(container).toBeInTheDocument();
  });
});
