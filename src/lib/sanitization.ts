/**
 * Input sanitization utilities to prevent XSS and ensure data consistency
 */

import { z } from "zod";

/**
 * HTML sanitization - removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove dangerous HTML tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, "");
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, "");
  });
  
  // Remove dangerous attributes from any remaining tags
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, "");
  });
  
  return sanitized.trim();
}

/**
 * Text sanitization - basic cleaning for plain text fields
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/\s+/g, " ") // Replace multiple whitespace with single space
    .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
}

/**
 * Email sanitization
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w.@+-]/g, ""); // Only allow word chars, dots, @, +, -
}

/**
 * URL sanitization - ensures URLs are safe
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== "string") return "";
  
  const url = input.trim().toLowerCase();
  
  // Only allow http, https, and mailto protocols
  if (!url.match(/^https?:\/\//) && !url.match(/^mailto:/)) {
    return "";
  }
  
  return input.trim();
}

/**
 * Recursively sanitize an object's string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizer: (value: string) => string = sanitizeText
): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizer(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === "string" ? sanitizer(item) : 
        typeof item === "object" && item !== null ? sanitizeObject(item, sanitizer) : item
      ) as T[keyof T];
    } else if (typeof value === "object" && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value, sanitizer) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitization schemas for common input types
 */
export const SanitizationSchemas = {
  text: z.string().transform(sanitizeText),
  html: z.string().transform(sanitizeHtml),
  email: z.string().transform(sanitizeEmail),
  url: z.string().transform(sanitizeUrl),
} as const;

/**
 * Common field sanitizers
 */
export const FieldSanitizers = {
  name: sanitizeText,
  title: sanitizeText,
  description: sanitizeHtml,
  email: sanitizeEmail,
  url: sanitizeUrl,
} as const;