import { render, screen } from '@testing-library/react';
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

describe('Toolbar Update', () => {
  it('should update zoom when zoomProp changes', () => {
    const { rerender } = render(
      <Provider store={store}>
        <Toolbar currentTab={0} zoom={1.0} />
      </Provider>
    );

    rerender(
      <Provider store={store}>
        <Toolbar currentTab={0} zoom={1.5} />
      </Provider>
    );

    expect(screen.getByLabelText('zoom')).toBeInTheDocument();
  });

  it('should render with default zoom', () => {
    render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    expect(screen.getByLabelText('zoom')).toBeInTheDocument();
  });

  it('should render with custom zoom', () => {
    render(
      <Provider store={store}>
        <Toolbar currentTab={0} zoom={2.0} />
      </Provider>
    );

    expect(screen.getByLabelText('zoom')).toBeInTheDocument();
  });

  it('should render hideGoToTreeButton when true', () => {
    render(
      <Provider store={store}>
        <Toolbar currentTab={0} hideGoToTreeButton={true} />
      </Provider>
    );

    const goToTreeButton = screen.queryByText(/go on tree/i);
    expect(goToTreeButton).not.toBeInTheDocument();
  });
});
