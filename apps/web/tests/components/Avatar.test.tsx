import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../../src/components/Avatar';

describe('Avatar', () => {
  it('renders initials', () => {
    render(<Avatar name="Riain Condon" />);
    expect(screen.getByTestId('avatar')).toHaveTextContent('RC');
  });

  it('exposes name as tooltip', () => {
    render(<Avatar name="Alice Bob" />);
    expect(screen.getByTestId('avatar')).toHaveAttribute('title', 'Alice Bob');
  });

  it('respects size prop', () => {
    const { container } = render(<Avatar name="X" size={64} />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('64px');
  });
});
