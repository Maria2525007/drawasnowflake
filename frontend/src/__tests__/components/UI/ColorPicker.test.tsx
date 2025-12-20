import { render } from '@testing-library/react';
import { ColorPicker } from '../../../components/UI/ColorPicker';

describe('ColorPicker', () => {
  const mockOnColorChange = jest.fn();

  beforeEach(() => {
    mockOnColorChange.mockClear();
  });

  it('should render color input', () => {
    const { container } = render(
      <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
    );

    const colorInput = container.querySelector('input[type="color"]');
    expect(colorInput).toBeInTheDocument();
  });

  it('should call onColorChange when color changes', () => {
    const { container } = render(
      <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
    );

    const colorInput = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement;
    expect(colorInput).toBeInTheDocument();

    colorInput.value = '#00ff00';
    colorInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(mockOnColorChange).toHaveBeenCalledWith('#00ff00');
  });

  it('should display current color', () => {
    const { container } = render(
      <ColorPicker color="#ff0000" onColorChange={mockOnColorChange} />
    );

    const colorInput = container.querySelector(
      'input[type="color"]'
    ) as HTMLInputElement;
    expect(colorInput?.value).toBe('#ff0000');
  });
});
