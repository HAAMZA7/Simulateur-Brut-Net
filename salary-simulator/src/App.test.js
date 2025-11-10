import { render, screen } from '@testing-library/react';
import App from './App';

test('renders simulator title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Simulateur de Salaire Brut en Net/i);
  expect(titleElement).toBeInTheDocument();
});
