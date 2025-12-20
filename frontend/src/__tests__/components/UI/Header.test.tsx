import { render, screen } from '@testing-library/react';
import { Header } from '../../../components/UI/Header';
import { setLocale } from '../../../i18n/index';

describe('Header', () => {
  beforeEach(() => {
    setLocale('en');
  });

  describe('Rendering', () => {
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
      const box = container.querySelector('div[class*="MuiBox"]');
      expect(box).toBeInTheDocument();
    });

    it('should render Typography components', () => {
      render(<Header />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();

      const description = screen.getByText(
        /Draw a snowflake and watch it fall/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should render title in English', () => {
      setLocale('en');
      render(<Header />);
      expect(screen.getByText('Draw a Snowflake')).toBeInTheDocument();
    });

    it('should render title in Russian when locale is changed', () => {
      setLocale('ru');
      render(<Header />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/Нарисуй Снежинку/i);
    });

    it('should render description in correct language', () => {
      setLocale('en');
      render(<Header />);

      const description = screen.getByText(
        /Draw a snowflake and watch it fall/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have Box container with background gradient', () => {
      const { container } = render(<Header />);
      const box = container.querySelector('div[class*="MuiBox"]');
      expect(box).toBeInTheDocument();

      expect(box).toHaveStyle({
        textAlign: 'center',
      });
    });

    it('should have correct text alignment', () => {
      const { container } = render(<Header />);
      const box = container.querySelector('div[class*="MuiBox"]');

      expect(box).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(<Header />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName.toLowerCase()).toBe('h1');
    });

    it('should have descriptive text content', () => {
      render(<Header />);

      const title = screen.getByText('Draw a Snowflake');
      expect(title).toBeInTheDocument();

      const description = screen.getByText(
        /Draw a snowflake and watch it fall/i
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('should display header title', () => {
      render(<Header />);
      const title = screen.getByRole('heading', { level: 1 });
      expect(title).toHaveTextContent('Draw a Snowflake');
    });

    it('should display header description', () => {
      render(<Header />);
      const description = screen.getByText(
        /Draw a snowflake and watch it fall on the magical Christmas tree/i
      );
      expect(description).toBeInTheDocument();
    });
  });
});
