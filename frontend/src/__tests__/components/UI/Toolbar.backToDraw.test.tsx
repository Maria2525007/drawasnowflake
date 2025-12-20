import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';

jest.mock('../../../utils/export', () => ({
  exportCanvasAsImage: jest.fn(),
  copyCanvasToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utils/analytics', () => ({
  trackImageExported: jest.fn(),
  trackToolUsed: jest.fn(),
}));

describe('Toolbar BackToDraw', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call onBackToDraw when provided', async () => {
    const user = userEvent.setup();
    const onBackToDraw = jest.fn();

    render(
      <Provider store={store}>
        <Toolbar currentTab={1} onBackToDraw={onBackToDraw} />
      </Provider>
    );

    const backButton = screen.getByLabelText(/back to draw/i);
    await user.click(backButton);

    expect(onBackToDraw).toHaveBeenCalled();
  });

  it('should navigate to /draw when onBackToDraw is not provided', async () => {
    const user = userEvent.setup();
    const originalHref = Object.getOwnPropertyDescriptor(window, 'location')?.value?.href;
    const mockLocation = {
      href: '',
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    render(
      <Provider store={store}>
        <Toolbar currentTab={1} />
      </Provider>
    );

    const backButton = screen.getByLabelText(/back to draw/i);
    await user.click(backButton);

    expect(mockLocation.href).toBe('/draw');

    if (originalHref !== undefined) {
      Object.defineProperty(window, 'location', {
        value: { href: originalHref },
        writable: true,
        configurable: true,
      });
    }
  });
});
