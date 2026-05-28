import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../src/components/Sidebar';

const links = [
  { label: 'Dashboard', href: '#dashboard', active: true },
  { label: 'Reports', href: '#reports' },
  { label: 'Settings', href: '#settings' },
];

describe('Sidebar', () => {
  it('renders all links', () => {
    render(<Sidebar links={links} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('marks the active link', () => {
    render(<Sidebar links={links} />);
    const dashboard = screen.getByTestId('sidebar-link-dashboard');
    expect(dashboard).toHaveClass('nav-link--active');
    expect(screen.getByTestId('sidebar-link-reports')).not.toHaveClass('nav-link--active');
  });

  it('renders link hrefs', () => {
    render(<Sidebar links={links} />);
    expect(screen.getByTestId('sidebar-link-reports')).toHaveAttribute('href', '#reports');
  });
});
