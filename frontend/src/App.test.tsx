import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App Component', () => {
  it('renders "Staff Login" heading by default', () => {
    render(<App />);
    expect(screen.getByText(/Staff Login/i)).toBeInTheDocument();
  });
});
