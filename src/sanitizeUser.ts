import { Document } from 'mongoose';

/**
 * Utility to sanitize user data by removing sensitive fields.
 * @param user - The user object (plain object or Mongoose document).
 * @param fieldsToExclude - Array of sensitive fields to exclude.
 * @returns Sanitized user object.
 */
export const sanitizeUser = <T extends Record<string, unknown>>(
  user: T | Document,
  fieldsToExclude: (keyof T)[] = []
): Partial<T> => {
  const userObject = user instanceof Document ? user.toObject() : { ...user };

  // Ensure timestamps are always returned as ISO strings
  if (userObject.createdAt) {
    userObject.createdAt = new Date(
      userObject.createdAt as string | number
    ).toISOString();
  }
  if (userObject.updatedAt) {
    userObject.updatedAt = new Date(
      userObject.updatedAt as string | number
    ).toISOString();
  }

  fieldsToExclude.forEach((field) => delete userObject[field]);

  return userObject;
};
