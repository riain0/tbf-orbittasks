import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from '../../src/pages/Settings';

describe('Settings page', () => {
  it('renders email input populated with initial value', () => {
    render(<Settings initialEmail="alice@example.com" />);
    expect(screen.getByLabelText('email')).toHaveValue('alice@example.com');
  });

  it('rejects a weak password', () => {
    render(<Settings />);
    fireEvent.change(screen.getByLabelText('new password'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('settings-save'));
    expect(screen.getByTestId('settings-message')).toHaveTextContent(/at least 8/);
  });

  it('saves when password is strong', () => {
    render(<Settings />);
    fireEvent.change(screen.getByLabelText('new password'), { target: { value: 'HunterPass1' } });
    fireEvent.click(screen.getByTestId('settings-save'));
    expect(screen.getByTestId('settings-message')).toHaveTextContent('Saved');
  });
});
