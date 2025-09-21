// Gemini Validation - Input validation and safety checks
// Max 80 lines, validation logic only

import { smartCache } from './geminiCache';
import { SafetyCheckResult, ValidationResult } from './geminiTypes';

/**
 * Normalize text for consistent processing
 */
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-.,!?;:()'"/&@#$%]/g, '') // Remove weird encodings
    .replace(/\u00a0/g, ' ') // Replace non-breaking spaces
    .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
    .replace(/[\u201c\u201d]/g, '"') // Replace smart quotes
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Remove accents
}

/**
 * Basic safety check without API calls
 */
export function basicSafetyCheck(input: string): SafetyCheckResult {
  const issues: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  const lowerInput = input.toLowerCase();
  
  // Check for prompt injection attempts
  const injectionPatterns = [
    'ignore all instructions',
    'ignore previous',
    'disregard all',
    'forget everything',
    'act as if',
    'pretend to be'
  ];

  for (const pattern of injectionPatterns) {
    if (lowerInput.includes(pattern)) {
      issues.push(`Potential prompt injection: "${pattern}"`);
      severity = 'high';
    }
  }

  // Check for excessive length
  if (input.length > 5000) {
    issues.push('Input exceeds maximum length');
    severity = severity === 'high' ? 'high' : 'medium';
  }

  return {
    isSafe: issues.length === 0,
    issues,
    severity
  };
}

/**
 * Validate and sanitize user input
 */
export async function validateAndSanitizeInput(input: string): Promise<ValidationResult> {
  try {
    // Check cache first
    const cacheKey = btoa(input).substring(0, 32);
    const cached = smartCache.get<ValidationResult>(`validation_${cacheKey}`);
    if (cached) return cached;

    const normalizedInput = normalizeText(input);
    const violations: string[] = [];

    // Basic validation
    if (normalizedInput.length > 5000) {
      violations.push('Input too long (max 5000 characters)');
    }
    if (normalizedInput.length < 3) {
      violations.push('Input too short (min 3 characters)');
    }

    // Safety check
    const safetyResult = basicSafetyCheck(normalizedInput);
    if (!safetyResult.isSafe) {
      violations.push(...safetyResult.issues);
    }

    const result: ValidationResult = {
      isValid: violations.length === 0,
      errors: violations,
      warnings: []
    };

    // Cache result
    smartCache.set(`validation_${cacheKey}`, result, 1000 * 60 * 15);
    return result;

  } catch (error) {
    return {
      isValid: false,
      errors: ['Validation failed'],
      warnings: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}