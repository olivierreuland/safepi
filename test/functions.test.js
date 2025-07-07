/**
 * SafePI Function Unit Tests
 * Tests for individual functions with good coverage
 * 
 * @author Olivier Reuland
 * @license MIT
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

// Mock console.log and console.error to avoid output during tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

// Mock process.exit to avoid actually exiting during tests
const processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {})

// Import the functions from ES module
import {
  getGradeColor,
  formatTextOutput,
  formatPrettyOutput,
  formatHtmlOutput,
  generateTimestamp,
  colors
} from '../safepi.js'

describe('SafePI Function Units', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGradeColor', () => {
    it('should return green for A+ grade', () => {
      expect(getGradeColor('A+')).toBe(colors.green)
    })

    it('should return green for A grade', () => {
      expect(getGradeColor('A')).toBe(colors.green)
    })

    it('should return green for A- grade', () => {
      expect(getGradeColor('A-')).toBe(colors.green)
    })

    it('should return yellow for B+ grade', () => {
      expect(getGradeColor('B+')).toBe(colors.yellow)
    })

    it('should return yellow for B grade', () => {
      expect(getGradeColor('B')).toBe(colors.yellow)
    })

    it('should return yellow for B- grade', () => {
      expect(getGradeColor('B-')).toBe(colors.yellow)
    })

    it('should return red for C+ grade', () => {
      expect(getGradeColor('C+')).toBe(colors.red)
    })

    it('should return red for C grade', () => {
      expect(getGradeColor('C')).toBe(colors.red)
    })

    it('should return red for D grade', () => {
      expect(getGradeColor('D')).toBe(colors.red)
    })

    it('should return red for F grade', () => {
      expect(getGradeColor('F')).toBe(colors.red)
    })

    it('should return white for unknown grade', () => {
      expect(getGradeColor('X')).toBe(colors.white)
    })

    it('should handle null grade', () => {
      expect(getGradeColor(null)).toBe(colors.white)
    })

    it('should handle undefined grade', () => {
      expect(getGradeColor(undefined)).toBe(colors.white)
    })
  })

  describe('formatTextOutput', () => {
    const mockResult = {
      host: 'example.com',
      grade: 'A+',
      score: 95,
      tests_passed: 8,
      tests_quantity: 10,
      tests_failed: 2,
      scanned_at: '2024-01-01T12:00:00Z',
      details_url: 'https://example.com/details'
    }

    it('should format passing result correctly', () => {
      const output = formatTextOutput(mockResult, 90)
      
      expect(output).toContain('Security Scan Results for example.com')
      expect(output).toContain('Status: PASS')
      expect(output).toContain('Grade: A+')
      expect(output).toContain('Score: 95/90')
      expect(output).toContain('Tests Passed: 8/10')
      expect(output).toContain('Tests Failed: 2')
      expect(output).toContain('Details URL: https://example.com/details')
    })

    it('should format failing result correctly', () => {
      const output = formatTextOutput(mockResult, 100)
      
      expect(output).toContain('Status: FAIL')
      expect(output).toContain('Score: 95/100')
    })

    it('should handle missing host', () => {
      const resultWithoutHost = { ...mockResult, host: undefined }
      const output = formatTextOutput(resultWithoutHost, 90)
      
      expect(output).toContain('Security Scan Results for Unknown')
    })

    it('should handle missing details URL', () => {
      const resultWithoutUrl = { ...mockResult, details_url: undefined }
      const output = formatTextOutput(resultWithoutUrl, 90)
      
      expect(output).toContain('Details URL: N/A')
    })
  })

  describe('formatPrettyOutput', () => {
    const mockResult = {
      host: 'example.com',
      grade: 'A+',
      score: 95,
      tests_passed: 8,
      tests_quantity: 10,
      tests_failed: 2,
      scanned_at: '2024-01-01T12:00:00Z',
      details_url: 'https://example.com/details'
    }

    it('should format passing result with colors', () => {
      const output = formatPrettyOutput(mockResult, 90)
      
      expect(output).toContain('Security Scan Results')
      expect(output).toContain('Domain:')
      expect(output).toContain('example.com')
      expect(output).toContain('PASS')
      expect(output).toContain('A+')
      expect(output).toContain('95')
      expect(output).toContain('8 passed')
      expect(output).toContain('2 failed')
      // Should contain ANSI color codes
      expect(output).toMatch(/\x1b\[[0-9;]*m/)
    })

    it('should format failing result with colors', () => {
      const output = formatPrettyOutput(mockResult, 100)
      
      expect(output).toContain('FAIL')
      expect(output).toMatch(/\x1b\[[0-9;]*m/)
    })

    it('should handle zero failed tests', () => {
      const perfectResult = { ...mockResult, tests_failed: 0 }
      const output = formatPrettyOutput(perfectResult, 90)
      
      expect(output).toContain('0 failed')
    })

    it('should handle missing host', () => {
      const resultWithoutHost = { ...mockResult, host: null }
      const output = formatPrettyOutput(resultWithoutHost, 90)
      
      expect(output).toContain('Unknown')
    })
  })

  describe('formatHtmlOutput', () => {
    const mockResult = {
      host: 'example.com',
      grade: 'A+',
      score: 95,
      tests_passed: 8,
      tests_quantity: 10,
      tests_failed: 2,
      scanned_at: '2024-01-01T12:00:00Z',
      details_url: 'https://example.com/details',
      algorithm_version: '1.0'
    }

    it('should generate valid HTML structure', () => {
      const output = formatHtmlOutput(mockResult, 90)
      
      expect(output).toContain('<!DOCTYPE html>')
      expect(output).toContain('<html lang="en">')
      expect(output).toContain('<title>Security Scan Report - example.com</title>')
      expect(output).toContain('<body>')
      expect(output).toContain('</html>')
    })

    it('should include all result data', () => {
      const output = formatHtmlOutput(mockResult, 90)
      
      expect(output).toContain('example.com')
      expect(output).toContain('PASS')
      expect(output).toContain('A+')
      expect(output).toContain('95/90')
      expect(output).toContain('8')  // tests passed
      expect(output).toContain('2')  // tests failed
      expect(output).toContain('10') // total tests
      expect(output).toContain('1.0') // algorithm version
    })

    it('should include details link when available', () => {
      const output = formatHtmlOutput(mockResult, 90)
      
      expect(output).toContain('href="https://example.com/details"')
      expect(output).toContain('View Detailed Report')
    })

    it('should handle missing details URL', () => {
      const resultWithoutUrl = { ...mockResult, details_url: undefined }
      const output = formatHtmlOutput(resultWithoutUrl, 90)
      
      expect(output).not.toContain('View Detailed Report')
    })

    it('should handle failing result', () => {
      const output = formatHtmlOutput(mockResult, 100)
      
      expect(output).toContain('FAIL')
      expect(output).toContain('#dc3545') // Red color for fail
    })

    it('should handle different grade colors', () => {
      const bGradeResult = { ...mockResult, grade: 'B+' }
      const output = formatHtmlOutput(bGradeResult, 90)
      
      expect(output).toContain('#ffc107') // Yellow color for B grade
    })

    it('should handle missing host', () => {
      const resultWithoutHost = { ...mockResult, host: undefined }
      const output = formatHtmlOutput(resultWithoutHost, 90)
      
      expect(output).toContain('Unknown Domain')
    })
  })

  describe('generateTimestamp', () => {
    it('should generate timestamp in correct format', () => {
      const timestamp = generateTimestamp()
      
      // Should be YYYYMMDDHHMMSS format (14 characters)
      expect(timestamp).toHaveLength(14)
      expect(timestamp).toMatch(/^\d{14}$/)
    })

    it('should generate different timestamps when called multiple times', async () => {
      const timestamp1 = generateTimestamp()
      
      // Wait enough time to ensure different timestamp (1 second)
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      const timestamp2 = generateTimestamp()
      
      expect(timestamp1).not.toBe(timestamp2)
    })

    it('should generate timestamp with current year', () => {
      const timestamp = generateTimestamp()
      const currentYear = new Date().getFullYear().toString()
      
      expect(timestamp.startsWith(currentYear)).toBe(true)
    })
  })

  describe('colors object', () => {
    it('should contain all required color codes', () => {
      expect(colors.reset).toBe('\x1b[0m')
      expect(colors.bright).toBe('\x1b[1m')
      expect(colors.red).toBe('\x1b[31m')
      expect(colors.green).toBe('\x1b[32m')
      expect(colors.yellow).toBe('\x1b[33m')
      expect(colors.blue).toBe('\x1b[34m')
      expect(colors.magenta).toBe('\x1b[35m')
      expect(colors.cyan).toBe('\x1b[36m')
      expect(colors.white).toBe('\x1b[37m')
    })

    it('should have all colors as strings', () => {
      Object.values(colors).forEach(color => {
        expect(typeof color).toBe('string')
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle formatTextOutput with minimal result data', () => {
      const minimalResult = {
        score: 50,
        grade: 'C',
        tests_passed: 3,
        tests_quantity: 10,
        tests_failed: 7,
        scanned_at: '2024-01-01T12:00:00Z'
      }
      
      const output = formatTextOutput(minimalResult, 60)
      expect(output).toContain('Status: FAIL')
      expect(output).toContain('Security Scan Results for Unknown')
      expect(output).toContain('Details URL: N/A')
    })

    it('should handle formatPrettyOutput with null values', () => {
      const nullResult = {
        host: null,
        grade: null,
        score: 0,
        tests_passed: 0,
        tests_quantity: 0,
        tests_failed: 0,
        scanned_at: '2024-01-01T12:00:00Z',
        details_url: null
      }
      
      const output = formatPrettyOutput(nullResult, 50)
      expect(output).toContain('Unknown')
      expect(output).toContain('N/A')
    })

    it('should handle formatHtmlOutput with missing algorithm_version', () => {
      const result = {
        host: 'example.com',
        grade: 'B',
        score: 75,
        tests_passed: 6,
        tests_quantity: 10,
        tests_failed: 4,
        scanned_at: '2024-01-01T12:00:00Z'
      }
      
      const output = formatHtmlOutput(result, 80)
      expect(output).toContain('N/A') // Should show N/A for missing algorithm version
    })
  })
})
