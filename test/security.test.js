/**
 * SafePI Security Tests
 * Tests for security-related functions and edge cases
 *
 * @author Olivier Reuland
 * @license MIT
 */

import { describe, it, expect } from "vitest";
import { escapeHtml, isValidUrl, isValidDomain, rateLimit } from "../safepi.js";

describe("Security Functions", () => {
  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      const input = '<script>alert("XSS")</script>';
      const expected = "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });

    it("should escape ampersands", () => {
      expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should escape quotes", () => {
      expect(escapeHtml('He said "Hello"')).toBe("He said &quot;Hello&quot;");
      expect(escapeHtml("It's working")).toBe("It&#39;s working");
    });

    it("should handle null and undefined", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
    });

    it("should handle empty strings", () => {
      expect(escapeHtml("")).toBe("");
    });
  });

  describe("isValidUrl", () => {
    it("should accept valid HTTPS URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://example.com/path")).toBe(true);
    });

    it("should accept valid HTTP URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
    });

    it("should reject invalid protocols", () => {
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
      expect(isValidUrl("data:text/html,<script>alert(1)</script>")).toBe(
        false
      );
    });

    it("should reject malformed URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("http://")).toBe(false);
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe("isValidDomain", () => {
    it("should accept valid domains", () => {
      expect(isValidDomain("example.com")).toBe(true);
      expect(isValidDomain("sub.example.com")).toBe(true);
      expect(isValidDomain("example-site.com")).toBe(true);
      expect(isValidDomain("123.com")).toBe(true);
    });

    it("should reject invalid domains", () => {
      expect(isValidDomain("localhost")).toBe(false);
      expect(isValidDomain("127.0.0.1")).toBe(false);
      expect(isValidDomain("0.0.0.0")).toBe(false);
      expect(isValidDomain("file://example.com")).toBe(false);
      expect(isValidDomain("javascript:alert(1)")).toBe(false);
    });

    it("should reject malformed domains", () => {
      expect(isValidDomain("")).toBe(false);
      expect(isValidDomain(null)).toBe(false);
      expect(isValidDomain(undefined)).toBe(false);
      expect(isValidDomain("a".repeat(254))).toBe(false); // Too long
      expect(isValidDomain("example..com")).toBe(false); // Double dot
      expect(isValidDomain(".example.com")).toBe(false); // Leading dot
      expect(isValidDomain("example.com.")).toBe(false); // Trailing dot
    });

    it("should reject domains with invalid characters", () => {
      expect(isValidDomain("example.com/path")).toBe(false);
      expect(isValidDomain("example.com?query")).toBe(false);
      expect(isValidDomain("example.com#fragment")).toBe(false);
      expect(isValidDomain("example.com:8080")).toBe(false);
    });
  });

  describe("rateLimit", () => {
    it("should introduce delay", async () => {
      const start = Date.now();
      await rateLimit(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90); // Allow for some variance
    });

    it("should use default delay", async () => {
      const start = Date.now();
      await rateLimit();
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(990); // Default 1000ms
    });
  });
});

describe("Security Edge Cases", () => {
  describe("Path Traversal Patterns", () => {
    // These would need to be tested in the actual path validation function
    // when it's available in the exports
    const maliciousPathPatterns = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "....//....//....//etc/passwd",
      "..%252f..%252f..%252fetc%252fpasswd",
    ];

    it("should be aware of various path traversal patterns", () => {
      // This test documents the patterns we should protect against
      expect(maliciousPathPatterns.length).toBeGreaterThan(0);
    });
  });

  describe("XSS Vectors", () => {
    const xssVectors = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      "';alert('XSS');//",
      "<iframe src=\"javascript:alert('XSS')\"></iframe>",
    ];

    it("should properly escape all XSS vectors", () => {
      xssVectors.forEach((vector) => {
        const escaped = escapeHtml(vector);

        // The key is that HTML tags and attributes should be escaped
        // so they can't be interpreted as executable code
        if (vector.includes("<script>")) {
          expect(escaped).toContain("&lt;script&gt;");
        }
        if (vector.includes("<iframe")) {
          expect(escaped).toContain("&lt;iframe");
        }
        if (vector.includes("<img")) {
          expect(escaped).toContain("&lt;img");
        }

        // Ensure dangerous HTML characters are escaped
        if (vector.includes("<")) {
          expect(escaped).not.toContain("<");
          expect(escaped).toContain("&lt;");
        }
        if (vector.includes(">")) {
          expect(escaped).not.toContain(">");
          expect(escaped).toContain("&gt;");
        }
        if (vector.includes('"')) {
          expect(escaped).not.toContain('"');
          expect(escaped).toContain("&quot;");
        }
      });
    });
  });
});
