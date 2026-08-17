export const MIN_PASSWORD_LENGTH = 10;

/**
 * Returns an error message if the password is unacceptable, or null if it's fine.
 * Deliberately modest: length does more for resistance to guessing than character-class
 * rules do, so the only composition requirement is that it isn't purely one class.
 */
export function validatePassword(password) {
  if (typeof password !== "string" || password.length === 0) {
    return "A new password is required";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > 200) {
    return "Password must be 200 characters or fewer";
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
}
