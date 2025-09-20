// Function to generate color variations
export function generateColorVariations(baseColor: string): string[] {
  try {
    // Remove # if present and normalize to 6-digit hex
    let hex = baseColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    
    // Parse the base color
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const variations: string[] = [];
    
    // Generate lighter variations (tints)
    for (let i = 1; i <= 3; i++) {
      const factor = 0.2 * i;
      const newR = Math.round(r + (255 - r) * factor);
      const newG = Math.round(g + (255 - g) * factor);
      const newB = Math.round(b + (255 - b) * factor);
      variations.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`.toLowerCase());
    }
    
    // Add the base color
    variations.push(`#${hex}`.toLowerCase());
    
    // Generate darker variations (shades)
    for (let i = 1; i <= 3; i++) {
      const factor = 0.2 * i;
      const newR = Math.round(r * (1 - factor));
      const newG = Math.round(g * (1 - factor));
      const newB = Math.round(b * (1 - factor));
      variations.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`.toLowerCase());
    }
    
    return variations;
  } catch (e) {
    console.error('Error generating color variations:', e);
    // Return default swatches if there's an error
    return [
      '#FFFFFF', '#F5F5F5', '#EEEEEE', '#E0E0E0',
      '#BDBDBD', '#9E9E9E', '#757575', '#616161',
      '#424242', '#212121', '#000000'
    ];
  }
}
