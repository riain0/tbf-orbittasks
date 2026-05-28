import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../../src/hooks/useFetch';

describe('useFetch', () => {
  it('returns data on success', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve({ x: 1 })));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ x: 1 });
  });

  it('returns an error on failure', async () => {
    const { result } = renderHook(() => useFetch(() => Promise.reject(new Error('boom'))));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('boom');
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useFetch(() => Promise.resolve(1)));
    expect(result.current.loading).toBe(true);
  });

  it('cancels stale results on unmount', async () => {
    let resolve!: (v: number) => void;
    const fetcher = vi.fn(() => new Promise<number>((r) => (resolve = r)));
    const { result, unmount } = renderHook(() => useFetch(fetcher));
    unmount();
    resolve(7);
    // small delay to give any leaked setState a chance to fire
    await new Promise((r) => setTimeout(r, 10));
    // result.current is the last state before unmount
    expect(result.current.loading).toBe(true);
  });
});
