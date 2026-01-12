/**
 * Presets Module
 * Pre-configured bacteria styles for quick application
 */

const BacteriaPresets = {
  cute: {
    name: 'Cute',
    description: 'Friendly round bacteria with big eyes',
    settings: {
      shape: 'coccus',
      eyeCount: 2,
      bodyLength: 0.7,
      bodyWidth: 0.7,
      eyeSize: 0.8,
      blobDensity: 0.3,
      showFlagella: false,
      showPili: false,
      showGlow: true,
      useGradient: true
    }
  },

  creepy: {
    name: 'Creepy',
    description: 'Unsettling bacteria with pili and one eye',
    settings: {
      shape: 'vibrio',
      eyeCount: 1,
      bodyLength: 0.6,
      bodyWidth: 0.4,
      eyeSize: 0.6,
      blobDensity: 0.8,
      showFlagella: true,
      showTopFlagella: true,
      showBottomFlagella: false,
      showPili: true,
      showGlow: false,
      useGradient: false
    }
  },

  classic: {
    name: 'Classic',
    description: 'Traditional rod-shaped bacteria',
    settings: {
      shape: 'rod',
      eyeCount: 2,
      bodyLength: 0.5,
      bodyWidth: 0.5,
      eyeSize: 0.5,
      blobDensity: 0.5,
      showFlagella: true,
      showTopFlagella: true,
      showBottomFlagella: true,
      showPili: false,
      showGlow: false,
      useGradient: false
    }
  },

  tiny: {
    name: 'Tiny',
    description: 'Small compact bacteria',
    settings: {
      shape: 'coccus',
      eyeCount: 2,
      bodyLength: 0.2,
      bodyWidth: 0.2,
      eyeSize: 0.3,
      blobDensity: 0.2,
      showFlagella: false,
      showPili: false,
      showGlow: false,
      useGradient: true
    }
  },

  giant: {
    name: 'Giant',
    description: 'Large impressive bacteria',
    settings: {
      shape: 'bacillus',
      eyeCount: 2,
      bodyLength: 0.9,
      bodyWidth: 0.8,
      eyeSize: 0.7,
      blobDensity: 0.7,
      showFlagella: true,
      showTopFlagella: true,
      showBottomFlagella: true,
      showPili: true,
      showGlow: true,
      useGradient: true
    }
  },

  spiral: {
    name: 'Spiral',
    description: 'Wavy spirillum bacteria',
    settings: {
      shape: 'spirillum',
      eyeCount: 1,
      bodyLength: 0.8,
      bodyWidth: 0.5,
      eyeSize: 0.4,
      blobDensity: 0.4,
      showFlagella: true,
      showTopFlagella: true,
      showBottomFlagella: true,
      showPili: false,
      showGlow: true,
      useGradient: true
    }
  }
};

/**
 * Apply a preset to the bacteria state
 * @param {string} presetName - Name of the preset to apply
 * @param {function} onUpdate - Callback to update UI controls
 */
function applyPreset(presetName, onUpdate) {
  const preset = BacteriaPresets[presetName];
  if (!preset) return;

  const settings = preset.settings;
  const controls = BacteriaState.controls;

  // Apply all settings
  if (settings.shape !== undefined) controls.shape = settings.shape;
  if (settings.eyeCount !== undefined) controls.eyeCount = settings.eyeCount;
  if (settings.bodyLength !== undefined) controls.bodyLength = settings.bodyLength;
  if (settings.bodyWidth !== undefined) controls.bodyWidth = settings.bodyWidth;
  if (settings.eyeSize !== undefined) controls.eyeSize = settings.eyeSize;
  if (settings.blobDensity !== undefined) controls.blobDensity = settings.blobDensity;
  if (settings.showFlagella !== undefined) controls.showFlagella = settings.showFlagella;
  if (settings.showTopFlagella !== undefined) controls.showTopFlagella = settings.showTopFlagella;
  if (settings.showBottomFlagella !== undefined) controls.showBottomFlagella = settings.showBottomFlagella;
  if (settings.showPili !== undefined) controls.showPili = settings.showPili;
  if (settings.showGlow !== undefined) controls.showGlow = settings.showGlow;
  if (settings.useGradient !== undefined) controls.useGradient = settings.useGradient;

  // Callback to sync UI
  if (onUpdate) {
    onUpdate(settings);
  }
}

/**
 * Get list of available presets
 * @returns {Array} Array of preset info objects
 */
function getPresetList() {
  return Object.entries(BacteriaPresets).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description
  }));
}

// Export for use in other modules
window.BacteriaPresets = BacteriaPresets;
window.applyPreset = applyPreset;
window.getPresetList = getPresetList;
