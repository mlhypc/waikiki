import { CartItem } from './context';

/**
 * Converts gender slug to display title
 * @param gender - Gender slug (e.g., 'erkek', 'kadin')
 * @returns Capitalized gender title
 */
export function getGenderTitle(gender: string): string {
  const genderMap: Record<string, string> = {
    erkek: 'Erkek',
    kadin: 'Kadın',
  };
  return genderMap[gender] || gender;
}

/**
 * Calculates total quantity of items in cart
 * @param cart - Array of cart items
 * @returns Total quantity
 */
export function getCartQuantity(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
