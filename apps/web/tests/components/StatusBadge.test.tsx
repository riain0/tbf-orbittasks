import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status label', () => {
    render(<StatusBadge status="doing" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('In progress');
  });

  it('renders the "todo" label', () => {
    render(<StatusBadge status="todo" />);
    expect(screen.getByText('To do')).toBeInTheDocument();
  });

  it('renders the "done" label', () => {
    render(<StatusBadge status="done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
