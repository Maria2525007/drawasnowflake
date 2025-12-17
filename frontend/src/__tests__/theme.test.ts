import { createTheme } from '@mui/material/styles';
import { theme } from '../theme';

describe('theme', () => {
  it('should export a theme object', () => {
    expect(theme).toBeDefined();
    expect(typeof theme).toBe('object');
  });

  it('should be a valid MUI theme', () => {
    const muiTheme = createTheme(theme);
    expect(muiTheme).toBeDefined();
    expect(muiTheme.palette).toBeDefined();
  });

  it('should have palette configuration', () => {
    expect(theme.palette).toBeDefined();
  });
});

