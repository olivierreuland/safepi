/**
 * SafePI Test Suite
 * Comprehensive tests for all parameters and functionality using Vitest
 * 
 * @author Olivier Reuland
 * @license MIT
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { spawn, exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

/**
 * Executes a SafePI command and returns the result
 * @param {string} args - Command arguments (without 'node safepi.js')
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
async function runSafePI(args, timeout = 20000) {
  try {
    const { stdout, stderr } = await execAsync(`node safepi.js ${args}`, { 
      timeout,
      cwd: process.cwd()
    })
    return { stdout, stderr, exitCode: 0 }
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1
    }
  }
}

/**
 * Helper to check if output contains expected text
 * @param {string} output - Output to search in
 * @param {string} text - Text to search for
 * @returns {boolean}
 */
function contains(output, text) {
  return output.includes(text)
}

/**
 * Helper to clean up test artifacts
 */
function cleanupTestFiles() {
  const testDirs = ['./test-reports', './test-output']
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })
}

describe('SafePI CLI Tool', () => {
  beforeAll(() => {
    // Ensure clean state
    cleanupTestFiles()
  })

  afterAll(() => {
    // Clean up after tests
    cleanupTestFiles()
  })

  describe('Help Parameter', () => {
    it('should show help with -h flag', async () => {
      const result = await runSafePI('-h')
      
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Usage: node safepi.js [options]')
      expect(result.stdout).toContain('--domain')
      expect(result.stdout).toContain('--fail [true|false]')
      expect(result.stdout).toContain('Examples:')
    })

    it('should show help with --help flag', async () => {
      const result = await runSafePI('--help')
      
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Usage: node safepi.js [options]')
      expect(result.stdout).toContain('--domain')
    })
  })

  describe('Domain Parameter', () => {
    it('should require domain parameter', async () => {
      const result = await runSafePI('')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--domain is required')
    })

    it('should accept domain with -d flag', async () => {
      const result = await runSafePI('-d example.com')
      
      expect([0, 1]).toContain(result.exitCode) // Can succeed or fail based on actual scan
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept domain with --domain flag', async () => {
      const result = await runSafePI('--domain example.com')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should handle multiple domains', async () => {
      const result = await runSafePI('-d example.com,httpbin.org', 30000)
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
      expect(result.stdout).toContain('Scanning httpbin.org')
      expect(result.stdout).toContain('SCAN SUMMARY')
    })

    it('should reject empty domain', async () => {
      const result = await runSafePI('-d ""')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--domain is required')
    })

    it('should require domain value', async () => {
      const result = await runSafePI('-d')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--domain requires a value')
    })
  })

  describe('Score Parameter', () => {
    it('should accept score with -s flag', async () => {
      const result = await runSafePI('-d example.com -s 50')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/50')
    })

    it('should accept score with --score flag', async () => {
      const result = await runSafePI('--domain example.com --score 75')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/75')
    })

    it('should reject non-numeric score', async () => {
      const result = await runSafePI('-d example.com -s abc')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('must be a number')
    })

    it('should require score value', async () => {
      const result = await runSafePI('-d example.com -s')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--score requires a value')
    })

    it('should use default score of 100', async () => {
      const result = await runSafePI('-d example.com')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/100')
    })
  })

  describe('Report Format Parameter', () => {
    it('should accept text format', async () => {
      const result = await runSafePI('-d example.com -r text')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Security Scan Results for')
      // Text format should not contain ANSI escape codes
      expect(result.stdout).not.toMatch(/\x1b\[[0-9;]*m/)
    })

    it('should accept pretty format', async () => {
      const result = await runSafePI('-d example.com -r pretty')
      
      expect([0, 1]).toContain(result.exitCode)
      // Pretty format should contain ANSI escape codes for colors
      expect(result.stdout).toMatch(/\x1b\[[0-9;]*m/)
    })

    it('should accept html format', async () => {
      // Create test directory
      const testDir = './test-reports'
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true })
      }

      const result = await runSafePI(`-d example.com -r html -o ${testDir}/`)
      
      expect([0, 1]).toContain(result.exitCode)
      if (result.stdout.includes('HTML report saved')) {
        expect(result.stdout).toContain('HTML report saved to:')
        expect(result.stdout).toContain('test-reports')
      }
    })

    it('should reject invalid format', async () => {
      const result = await runSafePI('-d example.com -r invalid')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('must be one of: text, pretty, html')
    })

    it('should require report value', async () => {
      const result = await runSafePI('-d example.com -r')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--report requires a value')
    })

    it('should use pretty format by default', async () => {
      const result = await runSafePI('-d example.com')
      
      expect([0, 1]).toContain(result.exitCode)
      // Should contain ANSI codes (pretty format default)
      expect(result.stdout).toMatch(/\x1b\[[0-9;]*m/)
    })
  })

  describe('Output Parameter', () => {
    it('should accept output directory', async () => {
      const testDir = './test-output'
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true })
      }

      const result = await runSafePI(`-d example.com -r html -o ${testDir}/`)
      
      expect([0, 1]).toContain(result.exitCode)
      if (result.stdout.includes('HTML report saved')) {
        expect(result.stdout).toContain('test-output')
      }
    })

    it('should require output value', async () => {
      const result = await runSafePI('-d example.com -o')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--output requires a value')
    })
  })

  describe('Fail Parameter', () => {
    it('should accept --fail without value (defaults to true)', async () => {
      const result = await runSafePI('-d example.com --fail')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept --fail true', async () => {
      const result = await runSafePI('-d example.com --fail true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept --fail false', async () => {
      const result = await runSafePI('-d example.com --fail false')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept -f flag', async () => {
      const result = await runSafePI('-d example.com -f true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should reject invalid fail value', async () => {
      const result = await runSafePI('-d example.com --fail maybe')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('must be either true or false')
    })
  })

  describe('Hidden Parameter', () => {
    it('should accept --hidden true', async () => {
      const result = await runSafePI('-d example.com --hidden true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept --hidden false', async () => {
      const result = await runSafePI('-d example.com --hidden false')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should reject invalid hidden value', async () => {
      const result = await runSafePI('-d example.com --hidden maybe')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('must be either true or false')
    })

    it('should require hidden value', async () => {
      const result = await runSafePI('-d example.com --hidden')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--hidden requires a value')
    })
  })

  describe('Rescan Parameter', () => {
    it('should accept --rescan true', async () => {
      const result = await runSafePI('-d example.com --rescan true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should accept --rescan false', async () => {
      const result = await runSafePI('-d example.com --rescan false')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
    })

    it('should reject invalid rescan value', async () => {
      const result = await runSafePI('-d example.com --rescan maybe')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('must be either true or false')
    })

    it('should require rescan value', async () => {
      const result = await runSafePI('-d example.com --rescan')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('--rescan requires a value')
    })
  })

  describe('Unknown Parameters', () => {
    it('should reject unknown parameters', async () => {
      const result = await runSafePI('-d example.com --unknown-param value')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Unknown option')
    })

    it('should show usage on unknown parameter', async () => {
      const result = await runSafePI('-d example.com --invalid')
      
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Unknown option')
    })
  })

  describe('Combined Parameters', () => {
    it('should handle multiple parameters together', async () => {
      const result = await runSafePI('-d example.com -s 80 -r text --fail --hidden false --rescan true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
      expect(result.stdout).toContain('/80')
    })

    it('should handle short and long flags mixed', async () => {
      const result = await runSafePI('--domain example.com -s 90 --report pretty -f true')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
      expect(result.stdout).toContain('/90')
    })
  })

  describe('Output Format Validation', () => {
    it('should produce valid text output structure', async () => {
      const result = await runSafePI('-d example.com -r text')
      
      if (result.stdout.includes('Security Scan Results')) {
        expect(result.stdout).toContain('Status:')
        expect(result.stdout).toContain('Grade:')
        expect(result.stdout).toContain('Score:')
        expect(result.stdout).toContain('Tests Passed:')
        expect(result.stdout).toContain('Tests Failed:')
      }
    })

    it('should produce valid pretty output structure', async () => {
      const result = await runSafePI('-d example.com -r pretty')
      
      if (result.stdout.includes('Security Scan Results')) {
        expect(result.stdout).toContain('Domain:')
        expect(result.stdout).toContain('Status:')
        expect(result.stdout).toContain('Grade:')
        expect(result.stdout).toContain('Score:')
      }
    })

    it('should create HTML file with correct naming pattern', async () => {
      const testDir = './test-html-output'
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true })
      }

      const result = await runSafePI(`-d example.com -r html -o ${testDir}/`)
      
      if (result.stdout.includes('HTML report saved')) {
        const files = fs.readdirSync(testDir)
        const htmlFiles = files.filter(f => f.endsWith('.html') && f.startsWith('safepi_'))
        expect(htmlFiles.length).toBeGreaterThan(0)
        
        // Clean up
        fs.rmSync(testDir, { recursive: true, force: true })
      }
    })
  })

  describe('Exit Code Behavior', () => {
    it('should exit with 0 on help', async () => {
      const result = await runSafePI('--help')
      expect(result.exitCode).toBe(0)
    })

    it('should exit with 1 on invalid parameters', async () => {
      const result = await runSafePI('--invalid')
      expect(result.exitCode).toBe(1)
    })

    it('should exit with 1 when domain is missing', async () => {
      const result = await runSafePI('')
      expect(result.exitCode).toBe(1)
    })

    it('should handle scan results appropriately', async () => {
      const result = await runSafePI('-d example.com')
      // Should exit with 0 or 1 depending on scan results and fail setting
      expect([0, 1]).toContain(result.exitCode)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid domain gracefully', async () => {
      const result = await runSafePI('-d invalid-domain-that-does-not-exist.invalid')
      
      // Should not crash, should handle error gracefully
      expect([0, 1]).toContain(result.exitCode)
      if (result.exitCode === 1) {
        expect(result.stdout).toContain('Scanning invalid-domain-that-does-not-exist.invalid')
      }
    })

    it('should handle network errors gracefully', async () => {
      // Test with a domain that might cause network issues
      const result = await runSafePI('-d 192.0.2.1') // RFC 3330 test address
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning 192.0.2.1')
    })
  })

  describe('Parameter Edge Cases', () => {
    it('should handle domain list with spaces', async () => {
      const result = await runSafePI('-d "example.com, httpbin.org"', 25000)
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('Scanning example.com')
      expect(result.stdout).toContain('Scanning httpbin.org')
    })

    it('should handle very high score threshold', async () => {
      const result = await runSafePI('-d example.com -s 999')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/999')
    })

    it('should handle zero score threshold', async () => {
      const result = await runSafePI('-d example.com -s 0')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/0')
    })

    it('should handle negative score threshold', async () => {
      const result = await runSafePI('-d example.com -s -1')
      
      expect([0, 1]).toContain(result.exitCode)
      expect(result.stdout).toContain('/-1')
    })
  })
})
