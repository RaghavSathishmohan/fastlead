export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; delay?: number } = {}
): Promise<T> {
  const { retries = 3, delay = 500 } = { retries: 3, delay: 500, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Retry failed');
}
