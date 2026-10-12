/**
 * Password Policy and Strength Validation Utility for Nova
 * Requirements:
 * - 6 to 12 characters length (can also accept longer safely if needed)
 * - Must include lowercase, uppercase, and special symbol
 */

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  requirements: PasswordRequirement[];
  isValid: boolean;
  message?: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      label: "6 to 12 characters",
      met: password.length >= 6 && password.length <= 12,
    },
    {
      id: "lower",
      label: "Lowercase letter (a-z)",
      met: hasLower,
    },
    {
      id: "upper",
      label: "Uppercase letter (A-Z)",
      met: hasUpper,
    },
    {
      id: "symbol",
      label: "Special symbol (!@#$%^&*...)",
      met: hasSymbol,
    },
  ];

  let passedCount = 0;
  if (password.length >= 6) passedCount++;
  if (hasLower) passedCount++;
  if (hasUpper) passedCount++;
  if (hasSymbol) passedCount++;

  const isValid = password.length >= 6 && password.length <= 12 && hasLower && hasUpper && hasSymbol;

  let score = 0;
  let label: PasswordStrengthResult["label"] = "Too short";
  let color = "#ef4444"; // red

  if (password.length === 0) {
    score = 0;
    label = "Too short";
    color = "#9ca3af";
  } else if (passedCount === 1 || password.length < 6) {
    score = 1;
    label = "Weak";
    color = "#ef4444";
  } else if (passedCount === 2) {
    score = 2;
    label = "Fair";
    color = "#f59e0b";
  } else if (passedCount === 3) {
    score = 3;
    label = "Good";
    color = "#3b82f6";
  } else if (passedCount === 4 && isValid) {
    score = 4;
    label = "Strong";
    color = "#10b981";
  } else {
    score = 3;
    label = "Good";
    color = "#3b82f6";
  }

  return {
    score,
    label,
    color,
    requirements,
    isValid,
    message: isValid
      ? undefined
      : "Password must be 6 to 12 characters and contain uppercase, lowercase, and a symbol.",
  };
}
