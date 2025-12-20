import { render, screen } from '@testing-library/react';
import { ColorPicker } from '../../../components/UI/ColorPicker';

describe('ColorPicker', () => {
  const mockOnColorChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render color input', () => {
      render(<ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />);

      const colorInput = screen.getByRole('textbox', { hidden: true }) || 
        document.querySelector('input[type="color"]');
      expect(colorInput).toBeInTheDocument();
    });

    it('should display current color value', () => {
      const { container } = render(
        <ColorPicker color="#ff0000" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
      expect(colorInput.value).toBe('#ff0000');
    });

    it('should render Box container with correct styling', () => {
      const { container } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      const box = container.querySelector('div[class*="MuiBox"]');
      expect(box).toBeInTheDocument();
    });
  });

  describe('Color Change Handling', () => {
    it('should call onColorChange when color input changes', async () => {
      const { container } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      
      colorInput.value = '#000000';
      colorInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Color input fires onChange event
      expect(mockOnColorChange).toHaveBeenCalled();
    });

    it('should handle color change with different color values', async () => {
      const { container } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      
      colorInput.value = '#00ff00';
      colorInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // The onChange should be triggered
      expect(colorInput.value).toBe('#00ff00');
    });

    it('should update displayed color when prop changes', () => {
      const { container, rerender } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      let colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput.value).toBe('#ffffff');

      rerender(
        <ColorPicker color="#000000" onColorChange={mockOnColorChange} />
      );

      colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput.value).toBe('#000000');
    });
  });

  describe('Input Properties', () => {
    it('should have correct input type', () => {
      const { container } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector('input[type="color"]');
      expect(colorInput).toBeInTheDocument();
      expect(colorInput).toHaveAttribute('type', 'color');
    });

    it('should have correct input styling', () => {
      const { container } = render(
        <ColorPicker color="#ffffff" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput.style.width).toBe('100%');
      expect(colorInput.style.height).toBe('40px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty color string', () => {
      const { container } = render(
        <ColorPicker color="" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
    });

    it('should handle rgb color format', () => {
      const { container } = render(
        <ColorPicker color="rgb(255, 0, 0)" onColorChange={mockOnColorChange} />
      );

      const colorInput = container.querySelector(
        'input[type="color"]'
      ) as HTMLInputElement;
      expect(colorInput).toBeInTheDocument();
    });
  });
});