import { theme } from '../theme';

describe('theme', () => {
  it('should have palette configuration', () => {
    expect(theme.palette).toBeDefined();
    expect(theme.palette.primary).toBeDefined();
    expect(theme.palette.secondary).toBeDefined();
  });

  it('should have typography configuration', () => {
    expect(theme.typography).toBeDefined();
  });

  it('should have shape configuration', () => {
    expect(theme.shape).toBeDefined();
  });
});
