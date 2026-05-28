import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagPicker } from '../../src/components/TagPicker';

const tags = [
  { id: 1, name: 'urgent', color: '#FF0000' },
  { id: 2, name: 'review', color: '#00FF00' },
  { id: 3, name: 'low-priority', color: '#0000FF' },
];

describe('TagPicker', () => {
  it('renders every available tag', () => {
    render(<TagPicker available={tags} selected={[]} onChange={() => {}} />);
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('review')).toBeInTheDocument();
  });

  it('filters tags by input', () => {
    render(<TagPicker available={tags} selected={[]} onChange={() => {}} />);
    fireEvent.change(screen.getByLabelText('filter tags'), { target: { value: 'rev' } });
    expect(screen.getByText('review')).toBeInTheDocument();
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
  });

  it('marks selected tags', () => {
    render(<TagPicker available={tags} selected={[tags[0]]} onChange={() => {}} />);
    expect(screen.getByTestId('tag-1')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('tag-2')).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles a tag when clicked', () => {
    const onChange = vi.fn();
    render(<TagPicker available={tags} selected={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('tag-1'));
    expect(onChange).toHaveBeenCalledWith([tags[0]]);
  });
});
