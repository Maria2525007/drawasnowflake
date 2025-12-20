import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';
import { Toolbar } from '../../../components/UI/Toolbar';
import { saveState, undo } from '../../../features/history/historySlice';

jest.mock('../../../utils/export', () => ({
  exportCanvasAsImage: jest.fn(),
  copyCanvasToClipboard: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utils/analytics', () => ({
  trackImageExported: jest.fn(),
  trackToolUsed: jest.fn(),
}));

describe('Toolbar Undo/Redo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should disable undo when past is empty', () => {
    render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const undoButton = screen.getByLabelText(/undo/i);
    expect(undoButton).toBeDisabled();
  });

  it('should enable undo when past has items', () => {
    act(() => {
      store.dispatch(saveState('state1'));
    });

    const { rerender } = render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    rerender(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const undoButton = screen.getByLabelText(/undo/i);
    expect(undoButton).not.toBeDisabled();
  });

  it('should handle undo click', async () => {
    const user = userEvent.setup();
    act(() => {
      store.dispatch(saveState('state1'));
    });

    const { rerender } = render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const undoButton = screen.getByLabelText(/undo/i);
    expect(undoButton).not.toBeDisabled();
    await user.click(undoButton);

    rerender(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const state = store.getState();
    expect(state.history.past).toHaveLength(0);
  });

  it('should disable redo when future is empty', () => {
    act(() => {
      const state = store.getState();
      if (state.history.future.length > 0) {
        while (state.history.future.length > 0) {
          store.dispatch({ type: 'history/redo' });
        }
      }
    });

    render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const redoButton = screen.getByLabelText(/redo/i);
    expect(redoButton).toBeDisabled();
  });

  it('should enable redo when future has items', () => {
    act(() => {
      store.dispatch(saveState('state1'));
      store.dispatch(saveState('state2'));
      store.dispatch(undo());
    });

    const { rerender } = render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    rerender(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const redoButton = screen.getByLabelText(/redo/i);
    expect(redoButton).not.toBeDisabled();
  });

  it('should handle redo click', async () => {
    const user = userEvent.setup();
    act(() => {
      store.dispatch(saveState('state1'));
      store.dispatch(saveState('state2'));
      store.dispatch(undo());
    });

    const { rerender } = render(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const redoButton = screen.getByLabelText(/redo/i);
    expect(redoButton).not.toBeDisabled();
    await user.click(redoButton);

    rerender(
      <Provider store={store}>
        <Toolbar currentTab={0} />
      </Provider>
    );

    const state = store.getState();
    expect(state.history.future).toHaveLength(0);
  });
});
