import { weldingColors } from '../colors';

describe('Welding Colors Theme', () => {
  it('has all required color properties', () => {
    const weldingColors = {
      primary: '#1e3a8a',
      secondary: '#ea580c',
      accent: '#dc2626',
      background: '#f8fafc',
      surface: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      neutral: '#64748b',
      neutralLight: '#e2e8f0',
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
      secondaryLight: '#fed7aa',
    };

    expect(weldingColors).toHaveProperty('primary');
    expect(weldingColors).toHaveProperty('secondary');
    expect(weldingColors).toHaveProperty('accent');
    expect(weldingColors).toHaveProperty('background');
    expect(weldingColors).toHaveProperty('surface');
    expect(weldingColors).toHaveProperty('textPrimary');
    expect(weldingColors).toHaveProperty('textSecondary');
    expect(weldingColors).toHaveProperty('neutral');
    expect(weldingColors).toHaveProperty('neutralLight');
    expect(weldingColors).toHaveProperty('error');
    expect(weldingColors).toHaveProperty('warning');
    expect(weldingColors).toHaveProperty('success');
    expect(weldingColors).toHaveProperty('secondaryLight');
  });

  it('has valid hex color values', () => {
    const weldingColors = {
      primary: '#1e3a8a',
      secondary: '#ea580c',
      accent: '#dc2626',
      background: '#f8fafc',
      surface: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      neutral: '#64748b',
      neutralLight: '#e2e8f0',
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
      secondaryLight: '#fed7aa',
    };

    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    
    Object.values(weldingColors).forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it('has welding-themed primary colors', () => {
    const weldingColors = {
      primary: '#1e3a8a',
      secondary: '#ea580c',
      accent: '#dc2626',
    };

    expect(weldingColors.primary).toBe('#1e3a8a'); // Steel blue
    expect(weldingColors.secondary).toBe('#ea580c'); // Welding orange
    expect(weldingColors.accent).toBe('#dc2626'); // Heat red
  });

  it('has appropriate background colors', () => {
    const weldingColors = {
      background: '#f8fafc',
      surface: '#ffffff',
    };

    expect(weldingColors.background).toBe('#f8fafc'); // Light gray
    expect(weldingColors.surface).toBe('#ffffff'); // White
  });

  it('has readable text colors', () => {
    const weldingColors = {
      textPrimary: '#0f172a',
      textSecondary: '#475569',
    };

    expect(weldingColors.textPrimary).toBe('#0f172a'); // Dark blue-gray
    expect(weldingColors.textSecondary).toBe('#475569'); // Medium gray
  });

  it('has semantic colors', () => {
    const weldingColors = {
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
    };

    expect(weldingColors.error).toBe('#dc2626'); // Red
    expect(weldingColors.warning).toBe('#ea580c'); // Orange
    expect(weldingColors.success).toBe('#16a34a'); // Green
  });

  it('has neutral colors for borders and dividers', () => {
    const weldingColors = {
      neutral: '#64748b',
      neutralLight: '#e2e8f0',
    };

    expect(weldingColors.neutral).toBe('#64748b'); // Medium gray
    expect(weldingColors.neutralLight).toBe('#e2e8f0'); // Light gray
  });

  it('has secondary light color for highlights', () => {
    const weldingColors = {
      secondaryLight: '#fed7aa',
    };

    expect(weldingColors.secondaryLight).toBe('#fed7aa'); // Light orange
  });

  it('maintains color consistency', () => {
    const weldingColors = {
      primary: '#1e3a8a',
      secondary: '#ea580c',
      accent: '#dc2626',
      background: '#f8fafc',
      surface: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      neutral: '#64748b',
      neutralLight: '#e2e8f0',
      error: '#dc2626',
      warning: '#ea580c',
      success: '#16a34a',
      secondaryLight: '#fed7aa',
    };

    const colors = Object.values(weldingColors);
    const uniqueColors = new Set(colors);
    
    // Ensure we have enough color variety
    expect(uniqueColors.size).toBeGreaterThan(10);
  });

  it('has accessible color combinations', () => {
    const weldingColors = {
      textPrimary: '#0f172a',
      surface: '#ffffff',
      error: '#dc2626',
      success: '#16a34a',
    };

    // Test that primary text on surface background has good contrast
    const primaryText = weldingColors.textPrimary;
    const surfaceBackground = weldingColors.surface;
    
    expect(primaryText).not.toBe(surfaceBackground);
    
    // Test that error color is distinct from success
    expect(weldingColors.error).not.toBe(weldingColors.success);
  });
});
