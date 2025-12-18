import { render, screen } from '@testing-library/react';
import { Header } from '../../../components/UI/Header';

describe('Header', () => {
  it('should render title', () => {
    render(<Header />);
    expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<Header />);
    expect(
      screen.getByText(/Draw a snowflake and watch it fall/i)
    ).toBeInTheDocument();
  });

  it('should have correct heading level', () => {
    render(<Header />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Draw a Snowflake');
  });

  it('should render with correct structure', () => {
    const { container } = render(<Header />);
    const box = container.querySelector('div');
    expect(box).toBeInTheDocument();
  });
});
