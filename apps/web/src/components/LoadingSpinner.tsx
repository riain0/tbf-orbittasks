export function LoadingSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div data-testid="loading-spinner" role="status" className="spinner">
      {label}…
    </div>
  );
}
