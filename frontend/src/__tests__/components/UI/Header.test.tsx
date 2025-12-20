import { render, screen } from '@testing-library/react';
import { Header } from '../../../components/UI/Header';

describe('Header', () => {
  it('should render title', () => {
    render(<Header />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Draw a Snowflake');
  });

  it('should render description', () => {
    render(<Header />);
    const description = screen.getByText(/Draw a snowflake and watch it fall/i);
    expect(description).toBeInTheDocument();
  });
});
