import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address').transform(val => val.toLowerCase().trim());

/**
 * Validate email format
 * @throws {Error} if email is invalid
 */
export function validateEmail(email: string): string {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error('Invalid email format');
  }
  return result.data;
}

/**
 * Check if email is valid without throwing
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Store name validation - allows letters, numbers, spaces, and common punctuation
 * Supports Unicode characters for international names
 */
export const storeNameSchema = z
  .string()
  .min(1, 'Store name cannot be empty')
  .max(100, 'Store name too long (maximum 100 characters)')
  .regex(
    /^[\p{L}\p{N}\p{M}\s\-.,&'!?()#@%+=/\\:;"]+$/u,
    'Store name contains invalid characters'
  )
  .transform(val => val.trim());

/**
 * Validate store name
 * @throws {Error} if store name is invalid
 */
export function validateStoreName(name: string): string {
  const result = storeNameSchema.safeParse(name);
  if (!result.success) {
    const issues = result.error.issues || [];
    throw new Error(issues[0]?.message || 'Invalid store name');
  }
  return result.data;
}

/**
 * Item name validation - allows letters, numbers, spaces, and common punctuation
 * Supports Unicode characters for international names
 */
export const itemNameSchema = z
  .string()
  .min(1, 'Item name cannot be empty')
  .max(500, 'Item name too long (maximum 500 characters)')
  .regex(
    /^[\p{L}\p{N}\p{M}\s\-.,&'!?()#@%+=/\\:;"]+$/u,
    'Item name contains invalid characters'
  )
  .transform(val => val.trim());

/**
 * Validate item name
 * @throws {Error} if item name is invalid
 */
export function validateItemName(name: string): string {
  const result = itemNameSchema.safeParse(name);
  if (!result.success) {
    // Zod v4 uses result.error.issues instead of result.error.errors
    const issues = result.error.issues || [];
    throw new Error(issues[0]?.message || 'Invalid item name');
  }
  return result.data;
}
