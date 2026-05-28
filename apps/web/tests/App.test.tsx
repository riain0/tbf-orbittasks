import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';

describe('App', () => {
  it('renders the login form when not authenticated', () => {
    render(<App />);
    // No token in localStorage → Login renders
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});
