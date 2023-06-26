import { render, screen } from '@testing-library/react';
import App from './App';

test('renders general info component', () => {
  render(<App />);
  const nameSubscript = screen.getByText("character name");
  expect(nameSubscript).toBeInTheDocument();
});

test('renders primary skills component', () => {
  render(<App />);
  const statTitle = screen.getByText("charisma");
  expect(statTitle).toBeInTheDocument();
});