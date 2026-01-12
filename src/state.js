/**
 * State Management Module
 * Centralized state for the bacteria generator
 */

/**
 * Seeded random number generator (Mulberry32)
 * Allows reproducible random sequences from a seed
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.state = seed;
  }

  // Generate next random number between 0 and 1
  next() {
    this.state |= 0;
    this.state = this.state + 0x6D2B79F5 | 0;
    let t = Math.imul(this.state ^ this.state >>> 15, 1 | this.state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  // Generate random number in range [min, max]
  random(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  // Generate random integer in range [min, max]
  randomInt(min, max) {
    return Math.floor(this.random(min, max + 1));
  }
}

// Current seeded random instance
let seededRng = null;

/**
 * Generate a random seed
 */
function generateRandomSeed() {
  return Math.floor(Math.random() * 2147483647);
}

const BacteriaState = {
  // Current seed for reproducibility
  currentSeed: 0,

  // User controls
  controls: {
    showFlagella: false,
    showTopFlagella: true,
    showBottomFlagella: true,
    eyeCount: 2,
    bodyLength: 0.5,
    bodyWidth: 0.5,
    blobDensity: 0.5,
    eyeSize: 0.5,
    hueShift: 0,
    shape: 'rod',
    useGradient: false,
    showGlow: false,
    showPili: false,
    piliDensity: 0.5,
    background: 'plain'
  },

  // Generated values (recalculated on each draw)
  generated: {
    baseColors: { r: 180, g: 150, b: 100 },
    rotation: 0,
    bodyDimensions: { width: 0, height: 0, border: 0, yOffset: 0 },
    flagella: {},
    eyes: {},
    blobs: []
  },

  // Canvas dimensions
  canvas: {
    width: 0,
    height: 0
  },

  // Animation state
  animation: {
    enabled: true,
    time: 0,
    flagellaPhase: 0,
    breathingPhase: 0
  }
};

/**
 * Generate random bacteria characteristics (called only on Randomize button)
 * @param {p5} p - p5 instance for random functions
 * @param {function} onControlsReset - Optional callback to sync UI sliders
 * @param {number} seed - Optional seed for reproducibility
 */
function generateBacteriaConstants(p, onControlsReset, seed) {
  const state = BacteriaState;

  // Generate or use provided seed
  state.currentSeed = seed !== undefined ? seed : generateRandomSeed();
  seededRng = new SeededRandom(state.currentSeed);

  // Use seeded random for all generation
  const rng = seededRng;

  // Generate random base colors
  state.generated.baseColors = {
    r: rng.random(100, 255),
    g: rng.random(100, 200),
    b: rng.random(0, 255)
  };

  // Generate random rotation
  state.generated.rotation = rng.random(-Math.PI / 10, Math.PI / 10);

  // Randomize body dimensions and reset controls to middle (0.5)
  // This allows user to adjust in either direction after randomization
  state.controls.bodyLength = 0.5;
  state.controls.bodyWidth = 0.5;
  state.controls.eyeSize = 0.5;
  state.controls.blobDensity = 0.5;
  state.controls.hueShift = 0;

  // Generate random eye characteristics (stored separately from size)
  state.generated.eyeRandomFactors = {
    pupilOffset: rng.random(-5, 5),
    elongation: rng.random(0.6, 1.5),
    sizeRatio: rng.random(0.3, 0.7),
    irisRatio: rng.random(0.5, 0.8),
    pupilRatio: rng.random(0.25, 0.4),
    pupilElongation: rng.random(0.6, 1.5),
    lookRatio: rng.random(-0.25, 0.25)
  };

  // Generate random body size factors (applied on top of slider values)
  state.generated.bodyRandomFactors = {
    widthFactor: rng.random(0.6, 1.4),
    heightFactor: rng.random(0.6, 1.4)
  };

  // Generate random flagella characteristics
  state.generated.flagellaRandomFactors = {
    hRatio: rng.random(0.5, 1.0),
    h1Ratio: rng.random(0.6, 0.8),
    h4Ratio: rng.random(0.5, 1.5),
    h5Ratio: rng.random(0.7, 1.2),
    h2Ratio: rng.random(0.5, 0.9),
    h2b: rng.random(0.2, 0.5),
    h2c: rng.random(0.2, 0.5),
    h3Ratio: rng.random(0.7, 1.2),
    h3b: rng.random(0.8, 0.9),
    amplitude1: rng.random(20, 40),
    amplitude2: rng.random(15, 35),
    wavelength1: rng.random(0.8, 1.2),
    wavelength2: rng.random(0.8, 1.2)
  };

  // Generate random pili characteristics
  state.generated.piliRandomFactors = {
    count: rng.randomInt(15, 40),
    lengths: [],
    angles: [],
    curves: []
  };
  for (let i = 0; i < 50; i++) {
    state.generated.piliRandomFactors.lengths.push(rng.random(5, 20));
    state.generated.piliRandomFactors.angles.push(rng.random(0, Math.PI * 2));
    state.generated.piliRandomFactors.curves.push(rng.random(-0.3, 0.3));
  }

  // Callback to sync UI sliders with reset values
  if (onControlsReset) {
    onControlsReset({
      bodyLength: 50,
      bodyWidth: 50,
      eyeSize: 50,
      blobDensity: 50,
      hueShift: 0
    });
  }

  // Now update dimensions based on controls
  updateBodyDimensions(p);
}

/**
 * Generate bacteria with a specific seed
 * @param {p5} p - p5 instance
 * @param {number} seed - Seed number
 * @param {function} onControlsReset - Optional callback to sync UI sliders
 */
function generateWithSeed(p, seed, onControlsReset) {
  generateBacteriaConstants(p, onControlsReset, seed);
}

/**
 * Update body dimensions based on current control values (no randomization)
 * @param {p5} p - p5 instance for random functions (only used for blobs)
 */
function updateBodyDimensions(p) {
  const state = BacteriaState;
  const controls = state.controls;
  const canvas = state.canvas;

  // Max size is half the screen height
  const maxRadius = canvas.height * 0.5;
  const border = canvas.height * 0.05;

  // Get random factors (defaults if not yet generated)
  const bf = state.generated.bodyRandomFactors || { widthFactor: 1, heightFactor: 1 };

  // Slider range: 0-1 maps to 0.2-1.0 of maxRadius
  // Then apply random factor for variety
  const widthMultiplier = (0.2 + (controls.bodyWidth * 0.8)) * bf.widthFactor;
  const lengthMultiplier = (0.2 + (controls.bodyLength * 0.8)) * bf.heightFactor;

  // Clamp to reasonable bounds (10% to 100% of maxRadius)
  const clampedWidth = Math.max(0.1, Math.min(1.0, widthMultiplier));
  const clampedLength = Math.max(0.1, Math.min(1.0, lengthMultiplier));

  // The body rect is drawn at y = -height/8, so center is offset
  const bodyHeight = clampedLength * maxRadius;
  const bodyWidth = clampedWidth * maxRadius;
  const yOffset = -bodyHeight / 8 + bodyHeight / 2;

  state.generated.bodyDimensions = {
    width: bodyWidth,
    height: bodyHeight,
    border: border,
    maxRadius: maxRadius,
    yOffset: yOffset
  };

  // Update flagella dimensions based on body size
  const rf = state.generated.flagellaRandomFactors || { hRatio: 0.75, h1Ratio: 0.7, h4Ratio: 1.0, h5Ratio: 0.95 };
  const h = bodyHeight * rf.hRatio;

  state.generated.flagella = {
    h: h,
    h1: h * rf.h1Ratio,
    h4: h * rf.h4Ratio,
    h5: h * rf.h5Ratio,
    BL2: bodyHeight * 0.7,
    h2: (bodyHeight * 0.7 + h) * rf.h2Ratio,
    h2b: rf.h2b || 0.35,
    h2c: rf.h2c || 0.35,
    h3: ((bodyHeight * 0.7 + h) * (rf.h2Ratio || 0.7)) * rf.h3Ratio,
    h3b: rf.h3b || 0.85,
    amplitude1: rf.amplitude1 || 30,
    amplitude2: rf.amplitude2 || 25,
    wavelength1: rf.wavelength1 || 1.0,
    wavelength2: rf.wavelength2 || 1.0
  };

  // Update eye dimensions based on body size and eye size control
  const eyeSizeMultiplier = 0.5 + (controls.eyeSize * 0.5);
  const ef = state.generated.eyeRandomFactors || { pupilOffset: 0, elongation: 1, sizeRatio: 0.4, irisRatio: 0.65, pupilRatio: 0.32, pupilElongation: 1, lookRatio: 0 };
  const baseEyeSize = bodyWidth * ef.sizeRatio * eyeSizeMultiplier;

  state.generated.eyes = {
    pupilOffset: ef.pupilOffset,
    elongation: ef.elongation,
    whiteSize: baseEyeSize,
    whiteSizeY: baseEyeSize * ef.elongation,
    irisSize: baseEyeSize * ef.irisRatio,
    irisSizeY: baseEyeSize * ef.irisRatio * ef.elongation,
    pupilSize: baseEyeSize * ef.pupilRatio,
    pupilSizeY: baseEyeSize * ef.pupilRatio * ef.elongation * ef.pupilElongation,
    lookOffset: baseEyeSize * ef.lookRatio
  };

  // Regenerate blobs with new dimensions
  generateBlobs(p);
}

/**
 * Pre-generate blob positions to avoid recalculating each frame
 * @param {p5} p - p5 instance for random functions
 */
function generateBlobs(p) {
  const state = BacteriaState;
  const controls = state.controls;
  const body = state.generated.bodyDimensions;

  // Calculate blob count based on density control (5-25 blobs)
  const blobCount = Math.floor(5 + controls.blobDensity * 20);

  state.generated.blobs = [];

  // Body rect is drawn from (-width/2, -height/8) to (width/2, height*7/8)
  // So the center of the body is at y = (-height/8 + height*7/8) / 2 = height * 3/8
  // We need blobs relative to the body center
  const bodyCenterY = body.yOffset;
  const halfWidth = body.width * 0.4;
  const halfHeight = body.height * 0.4;

  // Use seeded random if available, otherwise p5 random
  const randomFn = seededRng ? (min, max) => seededRng.random(min, max) : (min, max) => p.random(min, max);

  for (let i = 0; i < blobCount; i++) {
    state.generated.blobs.push({
      x: randomFn(-halfWidth, halfWidth),
      y: bodyCenterY + randomFn(-halfHeight, halfHeight),
      size: randomFn(5, 25)
    });
  }
}

/**
 * Get the current display colors with hue shift applied
 * @returns {object} RGB color values
 */
function getDisplayColors() {
  const state = BacteriaState;
  const base = state.generated.baseColors;
  const hueShift = state.controls.hueShift;

  if (hueShift === 0) {
    return { r: base.r, g: base.g, b: base.b };
  }

  // Convert RGB to HSL, shift hue, convert back
  const hsl = rgbToHsl(base.r, base.g, base.b);
  hsl.h = (hsl.h + hueShift) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    h *= 360;
  }
  return { h, s, l };
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Update animation state
 * @param {number} deltaTime - Time since last frame
 */
function updateAnimation(deltaTime) {
  const anim = BacteriaState.animation;
  if (!anim.enabled) return;

  anim.time += deltaTime;
  anim.flagellaPhase = Math.sin(anim.time * 0.003) * 0.1;
  anim.breathingPhase = Math.sin(anim.time * 0.002) * 0.02;
}

/**
 * Reset animation state
 */
function resetAnimation() {
  BacteriaState.animation.time = 0;
  BacteriaState.animation.flagellaPhase = 0;
  BacteriaState.animation.breathingPhase = 0;
}

// Export for use in other modules
window.BacteriaState = BacteriaState;
window.generateBacteriaConstants = generateBacteriaConstants;
window.generateWithSeed = generateWithSeed;
window.generateRandomSeed = generateRandomSeed;
window.updateBodyDimensions = updateBodyDimensions;
window.generateBlobs = generateBlobs;
window.getDisplayColors = getDisplayColors;
window.updateAnimation = updateAnimation;
window.resetAnimation = resetAnimation;
