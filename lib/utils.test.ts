import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('merges multiple class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBeTruthy();
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const condition1 = true;
      const condition2 = false;
      const result = cn(
        'base',
        condition1 && 'conditional',
        condition2 && 'hidden'
      );
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('hidden');
    });
    it('handles undefined and null values', () => {
      const result = cn('valid', undefined, null, 'another');
      expect(result).toBeTruthy();
    });
  });
});
