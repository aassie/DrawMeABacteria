/**
 * Control Panel Module
 * Handles all UI controls and user interactions
 */

// Store control references globally so they can be updated
let controlRefs = {};

/**
 * Reset sliders to specified values
 * @param {object} values - Object with slider values to set
 */
function resetSliders(values) {
  if (values.bodyLength !== undefined && controlRefs.lengthSlider) {
    controlRefs.lengthSlider.value(values.bodyLength);
  }
  if (values.bodyWidth !== undefined && controlRefs.widthSlider) {
    controlRefs.widthSlider.value(values.bodyWidth);
  }
  if (values.eyeSize !== undefined && controlRefs.eyeSizeSlider) {
    controlRefs.eyeSizeSlider.value(values.eyeSize);
  }
  if (values.blobDensity !== undefined && controlRefs.blobSlider) {
    controlRefs.blobSlider.value(values.blobDensity);
  }
  if (values.hueShift !== undefined && controlRefs.hueSlider) {
    controlRefs.hueSlider.value(values.hueShift);
  }
}

/**
 * Update seed display
 * @param {number} seed - The seed value
 * @param {boolean} modified - Whether the bacteria has been modified from the seed
 */
function updateSeedDisplay(seed, modified = false) {
  if (controlRefs.seedInput) {
    controlRefs.seedInput.value(seed);
  }
  // Track if bacteria has been modified from base seed
  BacteriaState.seedModified = modified;
}

/**
 * Update flagella checkbox from keyboard shortcut
 */
function updateFlagellaCheckbox(checked) {
  if (controlRefs.flagellaCheck) {
    controlRefs.flagellaCheck.checked(checked);
    // Also update sub-controls visibility
    if (controlRefs.updateFlagellaSubControls) {
      controlRefs.updateFlagellaSubControls(checked);
    }
  }
}

/**
 * Update animation checkbox from keyboard shortcut
 */
function updateAnimationCheckbox(checked) {
  if (controlRefs.animCheck) {
    controlRefs.animCheck.checked(checked);
  }
}

/**
 * Update eye selector from keyboard shortcut
 */
function updateEyeSelector(count) {
  if (controlRefs.eyeSelect) {
    controlRefs.eyeSelect.selected(String(count));
  }
}

/**
 * Create the control panel p5 sketch
 */
function createControlPanel(onRedraw, onSave, onUpdate) {
  return function(p) {
    let controlWidth, controlHeight;

    p.setup = function() {
      controlWidth = document.getElementById("Control").offsetWidth;
      controlHeight = document.getElementById("Control").offsetHeight;
      p.createCanvas(controlWidth, controlHeight);
      p.background(60, 60, 70);

      let yPos = 15;
      const xPos = 15;
      const spacing = 42;

      // Title with keyboard hint
      p.fill(255);
      p.noStroke();
      p.textSize(16);
      p.textStyle(p.BOLD);
      p.text("Controls", xPos, yPos);
      p.textSize(9);
      p.textStyle(p.NORMAL);
      p.fill(150);
      p.text("Keyboard: R S F A 1 2", xPos + 75, yPos);
      yPos += 25;

      // Seed display
      p.fill(200);
      p.textSize(10);
      p.text("Seed:", xPos, yPos);
      controlRefs.seedInput = p.createInput(String(BacteriaState.currentSeed || ''));
      controlRefs.seedInput.position(xPos + 35, yPos - 12);
      controlRefs.seedInput.size(100);
      controlRefs.seedInput.style('font-size', '11px');
      controlRefs.seedInput.style('padding', '2px 4px');
      controlRefs.seedInput.style('background', '#444');
      controlRefs.seedInput.style('color', 'white');
      controlRefs.seedInput.style('border', '1px solid #555');
      controlRefs.seedInput.style('border-radius', '3px');

      // Go button for seed
      controlRefs.seedBtn = p.createButton('Go');
      controlRefs.seedBtn.position(xPos + 145, yPos - 13);
      controlRefs.seedBtn.style('padding', '2px 8px');
      controlRefs.seedBtn.style('font-size', '11px');
      controlRefs.seedBtn.style('cursor', 'pointer');
      controlRefs.seedBtn.style('background', '#666');
      controlRefs.seedBtn.style('color', 'white');
      controlRefs.seedBtn.style('border', 'none');
      controlRefs.seedBtn.style('border-radius', '3px');
      controlRefs.seedBtn.mousePressed(() => {
        const seedVal = parseInt(controlRefs.seedInput.value());
        if (!isNaN(seedVal)) {
          regenerateWithSeed(seedVal);
        }
      });
      yPos += 22;

      // Buttons row
      controlRefs.redrawBtn = p.createButton('Randomize (R)');
      controlRefs.redrawBtn.position(xPos, yPos);
      controlRefs.redrawBtn.style('padding', '6px 12px');
      controlRefs.redrawBtn.style('cursor', 'pointer');
      controlRefs.redrawBtn.style('background', '#4CAF50');
      controlRefs.redrawBtn.style('color', 'white');
      controlRefs.redrawBtn.style('border', 'none');
      controlRefs.redrawBtn.style('border-radius', '4px');
      controlRefs.redrawBtn.style('font-size', '11px');
      controlRefs.redrawBtn.mousePressed(() => onRedraw());

      controlRefs.saveBtn = p.createButton('Save (S)');
      controlRefs.saveBtn.position(xPos + 105, yPos);
      controlRefs.saveBtn.style('padding', '6px 12px');
      controlRefs.saveBtn.style('cursor', 'pointer');
      controlRefs.saveBtn.style('background', '#2196F3');
      controlRefs.saveBtn.style('color', 'white');
      controlRefs.saveBtn.style('border', 'none');
      controlRefs.saveBtn.style('border-radius', '4px');
      controlRefs.saveBtn.style('font-size', '11px');
      controlRefs.saveBtn.mousePressed(() => onSave());
      yPos += spacing - 5;

      // Shape selector
      createLabel(p, "Shape", xPos, yPos);
      controlRefs.shapeSelect = p.createSelect();
      controlRefs.shapeSelect.position(xPos + 50, yPos - 15);
      controlRefs.shapeSelect.option('Rod', 'rod');
      controlRefs.shapeSelect.option('Coccus (Round)', 'coccus');
      controlRefs.shapeSelect.option('Bacillus', 'bacillus');
      controlRefs.shapeSelect.option('Vibrio (Comma)', 'vibrio');
      controlRefs.shapeSelect.option('Spirillum', 'spirillum');
      controlRefs.shapeSelect.selected('rod');
      controlRefs.shapeSelect.style('padding', '2px 4px');
      controlRefs.shapeSelect.style('font-size', '11px');
      controlRefs.shapeSelect.changed(() => {
        BacteriaState.controls.shape = controlRefs.shapeSelect.value();
        // When switching to coccus, sync width to length
        if (controlRefs.shapeSelect.value() === 'coccus') {
          const lengthVal = controlRefs.lengthSlider.value();
          BacteriaState.controls.bodyWidth = lengthVal / 100;
          controlRefs.widthSlider.value(lengthVal);
        }
      });
      yPos += spacing - 8;

      // Flagella checkbox
      p.fill(255);
      p.textSize(12);
      controlRefs.flagellaCheck = p.createCheckbox(' Flagella (F)', false);
      controlRefs.flagellaCheck.position(xPos, yPos);
      controlRefs.flagellaCheck.style('color', 'white');
      controlRefs.flagellaCheck.style('font-size', '12px');
      controlRefs.flagellaCheck.changed(() => {
        const checked = controlRefs.flagellaCheck.checked();
        BacteriaState.controls.showFlagella = checked;
        controlRefs.updateFlagellaSubControls(checked);
      });
      yPos += 20;

      // Flagella sub-checkboxes
      controlRefs.topFlagellaCheck = p.createCheckbox(' Top', true);
      controlRefs.topFlagellaCheck.position(xPos + 20, yPos);
      controlRefs.topFlagellaCheck.style('color', '#aaa');
      controlRefs.topFlagellaCheck.style('font-size', '11px');
      controlRefs.topFlagellaCheck.changed(() => {
        BacteriaState.controls.showTopFlagella = controlRefs.topFlagellaCheck.checked();
      });
      controlRefs.topFlagellaCheck.hide();

      controlRefs.bottomFlagellaCheck = p.createCheckbox(' Bottom', true);
      controlRefs.bottomFlagellaCheck.position(xPos + 70, yPos);
      controlRefs.bottomFlagellaCheck.style('color', '#aaa');
      controlRefs.bottomFlagellaCheck.style('font-size', '11px');
      controlRefs.bottomFlagellaCheck.changed(() => {
        BacteriaState.controls.showBottomFlagella = controlRefs.bottomFlagellaCheck.checked();
      });
      controlRefs.bottomFlagellaCheck.hide();

      controlRefs.updateFlagellaSubControls = function(show) {
        if (show) {
          controlRefs.topFlagellaCheck.show();
          controlRefs.bottomFlagellaCheck.show();
        } else {
          controlRefs.topFlagellaCheck.hide();
          controlRefs.bottomFlagellaCheck.hide();
        }
      };
      yPos += 22;

      // Animation and pili row
      controlRefs.animCheck = p.createCheckbox(' Anim (A)', true);
      controlRefs.animCheck.position(xPos, yPos);
      controlRefs.animCheck.style('color', 'white');
      controlRefs.animCheck.style('font-size', '11px');
      controlRefs.animCheck.changed(() => {
        BacteriaState.animation.enabled = controlRefs.animCheck.checked();
        if (!controlRefs.animCheck.checked()) resetAnimation();
      });

      controlRefs.piliCheck = p.createCheckbox(' Pili', false);
      controlRefs.piliCheck.position(xPos + 75, yPos);
      controlRefs.piliCheck.style('color', 'white');
      controlRefs.piliCheck.style('font-size', '11px');
      controlRefs.piliCheck.changed(() => {
        BacteriaState.controls.showPili = controlRefs.piliCheck.checked();
      });

      controlRefs.glowCheck = p.createCheckbox(' Glow', false);
      controlRefs.glowCheck.position(xPos + 125, yPos);
      controlRefs.glowCheck.style('color', 'white');
      controlRefs.glowCheck.style('font-size', '11px');
      controlRefs.glowCheck.changed(() => {
        BacteriaState.controls.showGlow = controlRefs.glowCheck.checked();
      });
      yPos += spacing - 12;

      // Eyes selector
      createLabel(p, "Eyes", xPos, yPos);
      controlRefs.eyeSelect = p.createSelect();
      controlRefs.eyeSelect.position(xPos + 40, yPos - 12);
      controlRefs.eyeSelect.option('1', '1');
      controlRefs.eyeSelect.option('2', '2');
      controlRefs.eyeSelect.selected('2');
      controlRefs.eyeSelect.style('padding', '2px 6px');
      controlRefs.eyeSelect.style('font-size', '11px');
      controlRefs.eyeSelect.changed(() => {
        BacteriaState.controls.eyeCount = parseInt(controlRefs.eyeSelect.value());
      });

      // Gradient checkbox
      controlRefs.gradientCheck = p.createCheckbox(' Gradient', false);
      controlRefs.gradientCheck.position(xPos + 90, yPos - 5);
      controlRefs.gradientCheck.style('color', 'white');
      controlRefs.gradientCheck.style('font-size', '11px');
      controlRefs.gradientCheck.changed(() => {
        BacteriaState.controls.useGradient = controlRefs.gradientCheck.checked();
      });
      yPos += spacing - 8;

      // Hue slider
      createLabel(p, "Hue", xPos, yPos);
      controlRefs.hueSlider = createSlider(p, xPos + 30, yPos - 8, 0, 360, 0, (val) => {
        BacteriaState.controls.hueShift = val;
        updateSeedDisplay(BacteriaState.currentSeed, true);
      });
      yPos += spacing - 8;

      // Body Length slider
      createLabel(p, "Length", xPos, yPos);
      controlRefs.lengthSlider = createSlider(p, xPos + 45, yPos - 8, 0, 100, 50, (val) => {
        BacteriaState.controls.bodyLength = val / 100;
        // Link width to length for coccus shape
        if (BacteriaState.controls.shape === 'coccus') {
          BacteriaState.controls.bodyWidth = val / 100;
          if (controlRefs.widthSlider) controlRefs.widthSlider.value(val);
        }
        updateSeedDisplay(BacteriaState.currentSeed, true);
        onUpdate();
      });
      yPos += spacing - 8;

      // Body Width slider
      createLabel(p, "Width", xPos, yPos);
      controlRefs.widthSlider = createSlider(p, xPos + 45, yPos - 8, 0, 100, 50, (val) => {
        BacteriaState.controls.bodyWidth = val / 100;
        // Link length to width for coccus shape
        if (BacteriaState.controls.shape === 'coccus') {
          BacteriaState.controls.bodyLength = val / 100;
          if (controlRefs.lengthSlider) controlRefs.lengthSlider.value(val);
        }
        updateSeedDisplay(BacteriaState.currentSeed, true);
        onUpdate();
      });
      yPos += spacing - 8;

      // Eye Size slider
      createLabel(p, "Eye Size", xPos, yPos);
      controlRefs.eyeSizeSlider = createSlider(p, xPos + 55, yPos - 8, 0, 100, 50, (val) => {
        BacteriaState.controls.eyeSize = val / 100;
        updateSeedDisplay(BacteriaState.currentSeed, true);
        onUpdate();
      });
      yPos += spacing - 8;

      // Blob Density slider
      createLabel(p, "Blobs", xPos, yPos);
      controlRefs.blobSlider = createSlider(p, xPos + 40, yPos - 8, 0, 100, 50, (val) => {
        BacteriaState.controls.blobDensity = val / 100;
        updateSeedDisplay(BacteriaState.currentSeed, true);
        onUpdate();
      });
      yPos += spacing - 8;

      // Background selector
      createLabel(p, "Background", xPos, yPos);
      controlRefs.bgSelect = p.createSelect();
      controlRefs.bgSelect.position(xPos + 75, yPos - 15);
      controlRefs.bgSelect.option('Plain', 'plain');
      controlRefs.bgSelect.option('Petri Dish', 'petri');
      controlRefs.bgSelect.option('Microscope Grid', 'grid');
      controlRefs.bgSelect.option('Gradient', 'gradient');
      controlRefs.bgSelect.selected('plain');
      controlRefs.bgSelect.style('padding', '2px 4px');
      controlRefs.bgSelect.style('font-size', '11px');
      controlRefs.bgSelect.changed(() => {
        BacteriaState.controls.background = controlRefs.bgSelect.value();
      });
      yPos += spacing - 5;

      // Presets section
      p.fill(255);
      p.textSize(11);
      p.text("Presets:", xPos, yPos);
      yPos += 18;

      // Create preset buttons in a row
      const presetBtnStyle = {
        padding: '3px 6px',
        fontSize: '9px',
        cursor: 'pointer',
        background: '#555',
        color: 'white',
        border: 'none',
        borderRadius: '3px',
        marginRight: '3px'
      };

      const presets = ['cute', 'creepy', 'classic', 'tiny', 'giant', 'spiral'];
      let presetX = xPos;
      presets.forEach((presetKey, idx) => {
        const preset = BacteriaPresets[presetKey];
        const btn = p.createButton(preset.name);
        btn.position(presetX, yPos);
        Object.entries(presetBtnStyle).forEach(([key, val]) => btn.style(key, val));
        btn.mousePressed(() => {
          applyPreset(presetKey, syncControlsFromPreset);
          onUpdate();
        });
        presetX += preset.name.length * 6 + 18;
        if (idx === 2) {
          // Wrap to next line after 3 buttons
          yPos += 22;
          presetX = xPos;
        }
      });
      yPos += 30;

      // Credits with link
      p.fill(150);
      p.textSize(9);
      p.text("Inspired by", xPos, yPos);
      controlRefs.creditLink = p.createA(
        'http://adrianavarro.net/projects/generative-play/',
        'Adria Navarro',
        '_blank'
      );
      controlRefs.creditLink.position(xPos + 55, yPos - 10);
      controlRefs.creditLink.style('color', '#64B5F6');
      controlRefs.creditLink.style('font-size', '9px');
      controlRefs.creditLink.style('text-decoration', 'none');

      // Function to sync control UI elements from preset
      function syncControlsFromPreset(settings) {
        if (settings.bodyLength !== undefined && controlRefs.lengthSlider) {
          controlRefs.lengthSlider.value(settings.bodyLength * 100);
        }
        if (settings.bodyWidth !== undefined && controlRefs.widthSlider) {
          controlRefs.widthSlider.value(settings.bodyWidth * 100);
        }
        if (settings.eyeSize !== undefined && controlRefs.eyeSizeSlider) {
          controlRefs.eyeSizeSlider.value(settings.eyeSize * 100);
        }
        if (settings.blobDensity !== undefined && controlRefs.blobSlider) {
          controlRefs.blobSlider.value(settings.blobDensity * 100);
        }
        if (settings.shape !== undefined && controlRefs.shapeSelect) {
          controlRefs.shapeSelect.selected(settings.shape);
        }
        if (settings.eyeCount !== undefined && controlRefs.eyeSelect) {
          controlRefs.eyeSelect.selected(String(settings.eyeCount));
        }
        if (settings.showFlagella !== undefined && controlRefs.flagellaCheck) {
          controlRefs.flagellaCheck.checked(settings.showFlagella);
          controlRefs.updateFlagellaSubControls(settings.showFlagella);
        }
        if (settings.showTopFlagella !== undefined && controlRefs.topFlagellaCheck) {
          controlRefs.topFlagellaCheck.checked(settings.showTopFlagella);
        }
        if (settings.showBottomFlagella !== undefined && controlRefs.bottomFlagellaCheck) {
          controlRefs.bottomFlagellaCheck.checked(settings.showBottomFlagella);
        }
        if (settings.showPili !== undefined && controlRefs.piliCheck) {
          controlRefs.piliCheck.checked(settings.showPili);
        }
        if (settings.showGlow !== undefined && controlRefs.glowCheck) {
          controlRefs.glowCheck.checked(settings.showGlow);
        }
        if (settings.useGradient !== undefined && controlRefs.gradientCheck) {
          controlRefs.gradientCheck.checked(settings.useGradient);
        }
      }

      p.noLoop();
    };

    p.draw = function() {};
  };
}

function createSlider(p, x, y, min, max, initial, onChange) {
  const slider = p.createSlider(min, max, initial);
  slider.position(x, y);
  slider.style('width', '120px');
  slider.style('cursor', 'pointer');
  slider.input(() => onChange(slider.value()));
  return slider;
}

function createLabel(p, text, x, y) {
  p.fill(200);
  p.noStroke();
  p.textSize(11);
  p.text(text, x, y);
}

// Export for use in other modules
window.createControlPanel = createControlPanel;
window.resetSliders = resetSliders;
window.updateSeedDisplay = updateSeedDisplay;
window.updateFlagellaCheckbox = updateFlagellaCheckbox;
window.updateAnimationCheckbox = updateAnimationCheckbox;
window.updateEyeSelector = updateEyeSelector;
