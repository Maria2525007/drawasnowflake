import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import App from '../App';

jest.mock('../pages/DrawPage', () => ({
  DrawPage: () => <div>DrawPage</div>,
}));

jest.mock('../pages/TreePage', () => ({
  TreePage: () => <div>TreePage</div>,
}));

describe('App', () => {
  it('should render DrawPage on /draw route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/draw']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('DrawPage')).toBeInTheDocument();
  });

  it('should render TreePage on /tree route', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/tree']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('TreePage')).toBeInTheDocument();
  });

  it('should redirect to /draw from /', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('DrawPage')).toBeInTheDocument();
  });
});
