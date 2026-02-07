/**
 * Generates a random invoice number in the format: FM-INV-<8_random_chars>
 * Example: FM-INV-aB3x9Km2
 */
export function generateInvoiceNumber(): string {
  const prefix = "FM-INV-";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let suffix = "";

  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    suffix += chars[randomIndex];
  }

  return prefix + suffix;
}
