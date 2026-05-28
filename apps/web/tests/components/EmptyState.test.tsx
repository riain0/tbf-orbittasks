import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../src/components/EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(<EmptyState title="Nothing here" description="Try again later" />);
    expect(screen.getByText('Try again later')).toBeInTheDocument();
  });

  it('renders a custom action node', () => {
    render(<EmptyState title="Empty" action={<button>Add one</button>} />);
    expect(screen.getByRole('button', { name: 'Add one' })).toBeInTheDocument();
  });
});
