import { render, screen } from '@testing-library/react';
import App from './App';

// Mock axios to prevent API calls during tests
jest.mock('axios', () => ({
  defaults: { baseURL: '', headers: { common: {} } },
  get: jest.fn(),
  post: jest.fn(),
}));

test('renders crypto credits app', () => {
  render(<App />);
  // Check for login form elements that should be present
  const welcomeText = screen.getByText(/welcome back/i);
  expect(welcomeText).toBeInTheDocument();
});
