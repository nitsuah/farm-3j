'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags — it replaces the root layout
    <html>
      <body>
        <h1>Something went wrong</h1>
        <pre>{error.message}</pre>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
