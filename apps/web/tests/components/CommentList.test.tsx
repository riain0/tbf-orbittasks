import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommentList } from '../../src/components/CommentList';

describe('CommentList', () => {
  it('renders empty state', () => {
    render(<CommentList comments={[]} />);
    expect(screen.getByText('No comments yet.')).toBeInTheDocument();
  });

  it('renders each comment', () => {
    const comments = [
      { id: 1, authorName: 'Alice', body: 'Looks good', createdAt: new Date().toISOString() },
      { id: 2, authorName: 'Bob', body: 'Ship it', createdAt: new Date().toISOString() },
    ];
    render(<CommentList comments={comments} />);
    expect(screen.getAllByText(/Looks good|Ship it/)).toHaveLength(2);
  });

  // ⚠️ FLAKY TEST (≈50% failure rate).
  //
  // `formatRelativeDays` rounds (createdAt - now) to whole days. This
  // comment is dated almost exactly half a day in the past, so the
  // rounding lands on 0 ("today") or -1 ("yesterday") depending on the
  // sub-second wall-clock at the instant the component reads `Date.now()`.
  // A few milliseconds of jitter is enough to flip the result, so the
  // test passes about half the time and fails the other half.
  //
  // Workshop 2 students will identify this as time-dependent: the test
  // reads the real clock instead of a fixed reference. Workshop 5
  // students fix it by injecting `now` as a prop, or by freezing the
  // clock with `vi.useFakeTimers()`, and the assertion becomes stable.
  //
  // The remediation gets walked through in Workshop 5's live-demo.
  it('renders a relative timestamp', () => {
    const HALF_DAY_MS = 12 * 60 * 60 * 1000;
    // Sit right on the rounding boundary, with a little random jitter so
    // the rounded day count flips between 0 and -1 from run to run.
    const jitter = (Math.random() - 0.5) * 60 * 1000; // ±30s
    const createdAt = new Date(Date.now() - HALF_DAY_MS + jitter);
    render(
      <CommentList
        comments={[
          { id: 1, authorName: 'Alice', body: 'Recent comment', createdAt: createdAt.toISOString() },
        ]}
      />,
    );
    // Asserts a specific relative-time string. Clock drift is the lesson.
    expect(screen.getByText('today')).toBeInTheDocument();
  });
});
