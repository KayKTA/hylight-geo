import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatRelativeTime, formatCoordinates, formatFileSize } from '../format';

describe('Format Utilities', () => {
  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Just now" for current time', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      expect(formatRelativeTime(now.toISOString())).toBe('Just now');
    });

    it('should format minutes correctly', () => {
      const thirtyMinsAgo = new Date('2024-01-15T11:30:00Z');
      expect(formatRelativeTime(thirtyMinsAgo.toISOString())).toBe('30m ago');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date('2024-01-15T10:00:00Z');
      expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h ago');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date('2024-01-12T12:00:00Z');
      expect(formatRelativeTime(threeDaysAgo.toISOString())).toBe('3d ago');
    });

    it('should format dates older than a week', () => {
      const tenDaysAgo = new Date('2024-01-05T12:00:00Z');
      const result = formatRelativeTime(tenDaysAgo.toISOString());
      expect(result).toMatch(/Jan/);
    });

    it('should include year for dates from different year', () => {
      const lastYear = new Date('2023-06-15T12:00:00Z');
      const result = formatRelativeTime(lastYear.toISOString());
      expect(result).toContain('2023');
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates with 4 decimal places', () => {
      expect(formatCoordinates(48.856614, 2.3522219)).toBe('48.8566, 2.3522');
    });

    it('should handle negative coordinates', () => {
      expect(formatCoordinates(-33.8688, 151.2093)).toBe('-33.8688, 151.2093');
    });

    it('should round correctly', () => {
      expect(formatCoordinates(48.85665, 2.35225)).toBe('48.8567, 2.3523');
    });

    it('should handle zero coordinates', () => {
      expect(formatCoordinates(0, 0)).toBe('0.0000, 0.0000');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512.00 B');
      expect(formatFileSize(999)).toBe('999.00 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(2048)).toBe('2.00 KB');
      expect(formatFileSize(1536)).toBe('1.50 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
      expect(formatFileSize(10.5 * 1024 * 1024)).toBe('10.50 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatFileSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB');
    });

    it('should handle large numbers', () => {
      const largeSize = 100 * 1024 * 1024 * 1024; // 100 GB
      expect(formatFileSize(largeSize)).toBe('100.00 GB');
    });
  });
});
