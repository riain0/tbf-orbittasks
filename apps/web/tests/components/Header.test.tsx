import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../src/components/Header';

describe('Header', () => {
  it('renders the brand', () => {
    render(<Header />);
    expect(screen.getByText('OrbitTasks')).toBeInTheDocument();
  });

  it('renders the user name when provided', () => {
    render(<Header userName="Riain Condon" />);
    expect(screen.getByText('Riain Condon')).toBeInTheDocument();
  });

  it('triggers onSignOut when sign-out is clicked', () => {
    const onSignOut = vi.fn();
    render(<Header userName="Riain" onSignOut={onSignOut} />);
    fireEvent.click(screen.getByTestId('signout-button'));
    expect(onSignOut).toHaveBeenCalled();
  });

  it('hides sign-out button when no user', () => {
    render(<Header />);
    expect(screen.queryByTestId('signout-button')).not.toBeInTheDocument();
  });
});
