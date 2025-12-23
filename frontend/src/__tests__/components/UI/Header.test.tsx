import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../../components/UI/Header';

describe('Header', () => {
  it('should render title', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Draw a Snowflake');
  });

  it('should render description', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    const description = screen.getByText(/Draw a snowflake and watch it fall/i);
    expect(description).toBeInTheDocument();
  });
});
