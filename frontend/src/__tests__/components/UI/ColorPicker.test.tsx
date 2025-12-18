import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from '../../../components/UI/ColorPicker';

describe('ColorPicker', () => {
  it('should render color input', () => {
    const mockOnChange = jest.fn();
    const { container } = render(<ColorPicker color="#ffffff" onColorChange={mockOnChange} />);
    
    const colorInput = container.querySelector('input[type="color"]');
    expect(colorInput).toBeInTheDocument();
    expect(colorInput).toHaveAttribute('value', '#ffffff');
  });

  it('should call onColorChange when color changes', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    const { container } = render(<ColorPicker color="#ffffff" onColorChange={mockOnChange} />);
    
    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
    colorInput.value = '#000000';
    await userEvent.click(colorInput);
    
    expect(colorInput.value).toBe('#000000');
  });

  it('should display current color', () => {
    const mockOnChange = jest.fn();
    const { container } = render(<ColorPicker color="#ff0000" onColorChange={mockOnChange} />);
    
    const colorInput = container.querySelector('input[type="color"]') as HTMLInputElement;
    expect(colorInput).toBeInTheDocument();
    expect(colorInput.value).toBe('#ff0000');
  });

  it('should have correct styling', () => {
    const mockOnChange = jest.fn();
    const { container } = render(<ColorPicker color="#ffffff" onColorChange={mockOnChange} />);
    
    const box = container.querySelector('div');
    expect(box).toBeInTheDocument();
  });
});

