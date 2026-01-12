/**
 * Main Entry Point
 * Initializes both p5 sketches and manages communication between them
 */

let bacteriaCanvas = null;
let bacteriaP5 = null;
let lastFrameTime = 0;

/**
 * Create the main bacteria drawing sketch
 * @returns {function} p5 sketch function
 */
function createBacteriaSketch() {
  return function(p) {
    bacteriaP5 = p;

    p.setup = function() {
      // Get dimensions from container
      const container = document.getElementById("Bacteria");
      BacteriaState.canvas.width = container.offsetWidth;
      BacteriaState.canvas.height = container.offsetHeight;

      bacteriaCanvas = p.createCanvas(
        BacteriaState.canvas.width,
        BacteriaState.canvas.height
      );

      // Generate initial bacteria
      generateBacteriaConstants(p);
      lastFrameTime = p.millis();

      // Update seed display with initial seed
      if (typeof updateSeedDisplay === 'function') {
        updateSeedDisplay(BacteriaState.currentSeed);
      }
    };

    p.draw = function() {
      // Calculate delta time for animation
      const currentTime = p.millis();
      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      // Update animation state
      updateAnimation(deltaTime);

      // Draw the bacteria
      drawBacteria(p);
    };

    // Handle window resize
    p.windowResized = function() {
      const container = document.getElementById("Bacteria");
      const newWidth = container.offsetWidth;
      const newHeight = container.offsetHeight;

      // Only resize if dimensions actually changed
      if (newWidth !== BacteriaState.canvas.width ||
          newHeight !== BacteriaState.canvas.height) {
        BacteriaState.canvas.width = newWidth;
        BacteriaState.canvas.height = newHeight;
        p.resizeCanvas(newWidth, newHeight);

        // Regenerate constants for new dimensions
        generateBacteriaConstants(p);
      }
    };
  };
}

/**
 * Redraw the bacteria with new random values (full randomization)
 */
function redrawBacteria() {
  if (bacteriaP5) {
    generateBacteriaConstants(bacteriaP5, resetSliders);
    resetAnimation();
    // Update seed display with new seed
    if (typeof updateSeedDisplay === 'function') {
      updateSeedDisplay(BacteriaState.currentSeed);
    }
  }
}

/**
 * Update bacteria dimensions without randomizing colors/rotation/etc
 */
function updateBacteriaDimensions() {
  if (bacteriaP5) {
    updateBodyDimensions(bacteriaP5);
  }
}

/**
 * Save the current bacteria as PNG
 */
function saveBacteriaImage() {
  if (bacteriaP5 && bacteriaCanvas) {
    saveBacteriaPNG(bacteriaP5, bacteriaCanvas);
  }
}

/**
 * Regenerate bacteria with a specific seed
 */
function regenerateWithSeed(seed) {
  if (bacteriaP5) {
    generateWithSeed(bacteriaP5, seed, resetSliders);
    resetAnimation();
    if (typeof updateSeedDisplay === 'function') {
      updateSeedDisplay(seed);
    }
  }
}

/**
 * Toggle flagella visibility
 */
function toggleFlagella() {
  BacteriaState.controls.showFlagella = !BacteriaState.controls.showFlagella;
  if (typeof updateFlagellaCheckbox === 'function') {
    updateFlagellaCheckbox(BacteriaState.controls.showFlagella);
  }
}

/**
 * Toggle animation
 */
function toggleAnimation() {
  BacteriaState.animation.enabled = !BacteriaState.animation.enabled;
  if (!BacteriaState.animation.enabled) {
    resetAnimation();
  }
  if (typeof updateAnimationCheckbox === 'function') {
    updateAnimationCheckbox(BacteriaState.animation.enabled);
  }
}

/**
 * Set eye count
 */
function setEyeCount(count) {
  BacteriaState.controls.eyeCount = count;
  if (typeof updateEyeSelector === 'function') {
    updateEyeSelector(count);
  }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'r':
        redrawBacteria();
        break;
      case 's':
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          saveBacteriaImage();
        }
        break;
      case 'f':
        toggleFlagella();
        break;
      case 'a':
        toggleAnimation();
        break;
      case '1':
        setEyeCount(1);
        break;
      case '2':
        setEyeCount(2);
        break;
    }
  });
}

/**
 * Initialize the application
 */
function initApp() {
  // Create and mount the control panel
  const controlPanelSketch = createControlPanel(redrawBacteria, saveBacteriaImage, updateBacteriaDimensions);
  new p5(controlPanelSketch, 'Control');

  // Create and mount the bacteria canvas
  const bacteriaSketch = createBacteriaSketch();
  new p5(bacteriaSketch, 'Bacteria');

  // Setup keyboard shortcuts
  setupKeyboardShortcuts();
}

// Export functions for control panel to use
window.regenerateWithSeed = regenerateWithSeed;

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
