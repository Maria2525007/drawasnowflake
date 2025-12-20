import { createTheme } from '@mui/material/styles';
import { theme } from '../theme';

describe('theme', () => {
  describe('Theme Object', () => {
    it('should export a theme object', () => {
      expect(theme).toBeDefined();
      expect(typeof theme).toBe('object');
    });

    it('should be a valid MUI theme', () => {
      expect(theme).toBeDefined();
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.shape).toBeDefined();
    });
  });

  describe('Palette Configuration', () => {
    it('should have dark mode palette', () => {
      expect(theme.palette.mode).toBe('dark');
    });

    it('should have primary color configuration', () => {
      expect(theme.palette.primary).toBeDefined();
      expect(theme.palette.primary.main).toBe('#4fc3f7');
      expect(theme.palette.primary.light).toBe('#81d4fa');
      expect(theme.palette.primary.dark).toBe('#29b6f6');
    });

    it('should have secondary color configuration', () => {
      expect(theme.palette.secondary).toBeDefined();
      expect(theme.palette.secondary.main).toBe('#f06292');
      expect(theme.palette.secondary.light).toBe('#f48fb1');
      expect(theme.palette.secondary.dark).toBe('#ec407a');
    });

    it('should have background colors', () => {
      expect(theme.palette.background).toBeDefined();
      expect(theme.palette.background.default).toBe('#0a1929');
      expect(theme.palette.background.paper).toBe('#132f4c');
    });

    it('should have text colors', () => {
      expect(theme.palette.text).toBeDefined();
      expect(theme.palette.text.primary).toBe('#ffffff');
      expect(theme.palette.text.secondary).toBe('#b0bec5');
    });
  });

  describe('Typography Configuration', () => {
    it('should have font family configuration', () => {
      expect(theme.typography.fontFamily).toBeDefined();
      expect(typeof theme.typography.fontFamily).toBe('string');
      expect(theme.typography.fontFamily).toContain('Roboto');
    });

    it('should include system fonts', () => {
      const fontFamily = theme.typography.fontFamily;
      expect(fontFamily).toContain('-apple-system');
      expect(fontFamily).toContain('BlinkMacSystemFont');
    });
  });

  describe('Shape Configuration', () => {
    it('should have border radius configuration', () => {
      expect(theme.shape.borderRadius).toBe(8);
    });
  });

  describe('Theme Validation', () => {
    it('should be compatible with MUI createTheme', () => {
      const muiTheme = createTheme(theme);
      expect(muiTheme).toBeDefined();
      expect(muiTheme.palette).toBeDefined();
    });

    it('should have all required theme properties', () => {
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.shape).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
    });
  });
});