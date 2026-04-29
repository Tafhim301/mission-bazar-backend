/**
 * Generates a unique transaction ID safe for SSLCommerz.
 * Format: MB-<timestamp>-<4-digit random>
 * Example: MB-1714389012345-4821
 */
export const getTransactionId = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MB-${Date.now()}-${random}`;
};
