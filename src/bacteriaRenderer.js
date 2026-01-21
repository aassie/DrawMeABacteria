/**
 * Bacteria Renderer Module
 * Handles all drawing operations for the bacteria
 */

/**
 * Draw the complete bacteria
 * @param {p5} p - p5 instance
 */
function drawBacteria(p) {
  const state = BacteriaState;
  const canvas = state.canvas;
  const anim = state.animation;
  const controls = state.controls;

  p.clear();

  // Draw background
  drawBackground(p);

  p.push();

  // Center and rotate - offset by body.yOffset to center the body (not the eyes)
  const body = state.generated.bodyDimensions;
  p.translate(canvas.width / 2, canvas.height / 2 - body.yOffset);
  p.rotate(state.generated.rotation);

  // Apply breathing animation
  const breathScale = 1 + anim.breathingPhase;
  p.scale(breathScale);

  // Draw glow effect behind everything
  if (controls.showGlow) {
    drawGlow(p);
  }

  // Draw in order: flagella (back), pili, body, eyes (front)
  if (controls.showFlagella) {
    drawFlagella(p);
  }

  // Draw pili before body (they go behind)
  if (controls.showPili) {
    drawPili(p);
  }

  drawBody(p);
  drawEyes(p);

  p.pop();
}

/**
 * Draw the background based on selected style
 * @param {p5} p - p5 instance
 */
function drawBackground(p) {
  const bgType = BacteriaState.controls.background || 'plain';

  switch (bgType) {
    case 'petri':
      drawPetriDishBackground(p);
      break;
    case 'grid':
      drawMicroscopeGridBackground(p);
      break;
    case 'gradient':
      drawGradientBackground(p);
      break;
    case 'plain':
    default:
      // Plain transparent background (CSS handles it)
      break;
  }
}

/**
 * Draw petri dish circular gradient background
 * @param {p5} p - p5 instance
 */
function drawPetriDishBackground(p) {
  const canvas = BacteriaState.canvas;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxRadius = Math.max(canvas.width, canvas.height) * 0.7;

  // Draw concentric circles for gradient effect
  p.noStroke();
  for (let r = maxRadius; r > 0; r -= 5) {
    const t = r / maxRadius;
    const gray = 200 + (1 - t) * 40; // Lighter in center
    p.fill(gray, gray, gray - 10);
    p.ellipse(cx, cy, r * 2, r * 2);
  }

  // Add random round texture spots (using seeded positions for consistency)
  drawPetriTexture(p, cx, cy, maxRadius);

  // Add subtle dish rim
  p.noFill();
  p.stroke(180, 180, 170);
  p.strokeWeight(3);
  p.ellipse(cx, cy, maxRadius * 1.9, maxRadius * 1.9);
}

/**
 * Draw texture spots on petri dish (static, no animation)
 * Uses seeded random for varied but consistent positions
 */
function drawPetriTexture(p, cx, cy, maxRadius) {
  p.noStroke();

  // Use a separate seeded random for petri dish texture
  const petriRng = new SeededRandom(54321);

  // Generate random spots with higher contrast
  const spotCount = 70;

  for (let i = 0; i < spotCount; i++) {
    // Random positioning
    const angle = petriRng.random(0, Math.PI * 2);
    const dist = petriRng.random(0, maxRadius * 0.9);

    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    // Random size
    const size = petriRng.random(4, 16);

    // Calculate base gray at this position (lighter toward center)
    const posRatio = dist / maxRadius;
    const baseGray = 200 + (1 - posRatio) * 40;

    // Higher contrast variations - darker or lighter spots
    const variation = petriRng.random(-35, 25);
    const spotGray = Math.max(150, Math.min(250, baseGray + variation));

    // Higher opacity for better visibility
    p.fill(spotGray, spotGray, spotGray - 8, 120);
    p.ellipse(x, y, size, size);
  }

  // Add some smaller scattered dots with more contrast
  for (let i = 0; i < 50; i++) {
    const angle = petriRng.random(0, Math.PI * 2);
    const dist = petriRng.random(0, maxRadius * 0.95);

    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    const posRatio = dist / maxRadius;
    const baseGray = 200 + (1 - posRatio) * 40;
    const variation = petriRng.random(-25, 20);
    const dotGray = Math.max(160, Math.min(245, baseGray + variation));

    p.fill(dotGray, dotGray, dotGray - 5, 100);
    const dotSize = petriRng.random(2, 6);
    p.ellipse(x, y, dotSize, dotSize);
  }
}

/**
 * Draw microscope grid overlay background
 * @param {p5} p - p5 instance
 */
function drawMicroscopeGridBackground(p) {
  const canvas = BacteriaState.canvas;

  // Light background
  p.background(240, 240, 235);

  // Draw grid lines
  p.stroke(200, 200, 195);
  p.strokeWeight(1);

  const gridSize = 40;

  // Vertical lines
  for (let x = 0; x < canvas.width; x += gridSize) {
    p.line(x, 0, x, canvas.height);
  }

  // Horizontal lines
  for (let y = 0; y < canvas.height; y += gridSize) {
    p.line(0, y, canvas.width, y);
  }

  // Thicker lines every 4 cells
  p.stroke(180, 180, 175);
  p.strokeWeight(2);
  for (let x = 0; x < canvas.width; x += gridSize * 4) {
    p.line(x, 0, x, canvas.height);
  }
  for (let y = 0; y < canvas.height; y += gridSize * 4) {
    p.line(0, y, canvas.width, y);
  }

  // Add vignette effect at corners
  const ctx = p.drawingContext;
  const vignette = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw simple gradient background
 * @param {p5} p - p5 instance
 */
function drawGradientBackground(p) {
  const canvas = BacteriaState.canvas;
  const ctx = p.drawingContext;

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#e8e8e8');
  gradient.addColorStop(0.5, '#f5f5f5');
  gradient.addColorStop(1, '#d8d8d8');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw glow/shadow effect around the bacteria
 * @param {p5} p - p5 instance
 */
function drawGlow(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;
  const shape = BacteriaState.controls.shape || 'rod';

  // Use canvas drawing context for shadow/glow
  const ctx = p.drawingContext;
  ctx.save();

  // Set up glow effect
  ctx.shadowBlur = 50;
  ctx.shadowColor = `rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.7)`;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw the glow shape (needs to be filled for shadow to appear)
  ctx.fillStyle = `rgba(${colors.r}, ${colors.g}, ${colors.b}, 0.3)`;

  // Draw shape-appropriate glow
  switch (shape) {
    case 'coccus': {
      const size = Math.min(body.width, body.height);
      ctx.beginPath();
      ctx.ellipse(0, body.yOffset, size / 2, size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'spirillum': {
      // Draw glow following the wave pattern
      const centerY = body.yOffset;
      const halfH = body.height / 2;
      const amplitude = body.width * 0.3;
      const thickness = body.width * 0.3;
      const waves = 2.5;

      ctx.beginPath();
      // Left edge
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const y = centerY - halfH + t * body.height;
        const x = Math.sin(t * Math.PI * 2 * waves) * amplitude - thickness / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Right edge
      for (let i = 30; i >= 0; i--) {
        const t = i / 30;
        const y = centerY - halfH + t * body.height;
        const x = Math.sin(t * Math.PI * 2 * waves) * amplitude + thickness / 2;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'bacillus': {
      // Draw tapered ellipse glow
      const halfW = body.width / 2;
      const halfH = body.height / 2;
      const centerY = body.yOffset;

      ctx.beginPath();
      ctx.ellipse(0, centerY, halfW * 0.9, halfH, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'vibrio': {
      // Draw C-shaped glow using same parametric curve as body
      const segments = 30;

      ctx.beginPath();
      // Outer edge (top to bottom)
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const pt = getVibrioPoint(body, t, true);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      // Inner edge (bottom to top)
      for (let i = segments; i >= 0; i--) {
        const t = i / segments;
        const pt = getVibrioPoint(body, t, false);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'rod':
    default: {
      // Rounded rectangle glow
      const x = -body.width / 2;
      const y = -body.height / 8;
      const w = body.width;
      const h = body.height;
      const r = body.border;

      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

/**
 * Draw pili (hair-like structures) around the bacteria
 * @param {p5} p - p5 instance
 */
function drawPili(p) {
  const state = BacteriaState;
  const colors = getDisplayColors();
  const body = state.generated.bodyDimensions;
  const piliFactors = state.generated.piliRandomFactors;
  const shape = state.controls.shape || 'rod';

  if (!piliFactors) return;

  // Use push/pop to preserve drawing state
  p.push();
  p.stroke(Math.max(0, colors.r - 30), Math.max(0, colors.g - 30), Math.max(0, colors.b - 20));
  p.strokeWeight(1.5);
  p.noFill();

  const count = piliFactors.count;

  for (let i = 0; i < count; i++) {
    const angle = piliFactors.angles[i];
    const length = piliFactors.lengths[i] + body.width * 0.1;
    const curvature = piliFactors.curves[i];

    // Calculate starting point on body edge based on shape
    let startX, startY;

    if (shape === 'coccus') {
      const size = Math.min(body.width, body.height) / 2;
      startX = Math.cos(angle) * size;
      startY = body.yOffset + Math.sin(angle) * size;
    } else if (shape === 'spirillum') {
      // Place along the wavy edge
      const t = (angle / (Math.PI * 2));
      const yPos = body.yOffset - body.height / 2 + t * body.height;
      const waveX = Math.sin(t * Math.PI * 2 * 2.5) * body.width * 0.3;
      const side = (i % 2 === 0) ? 1 : -1;
      startX = waveX + side * body.width * 0.125;
      startY = yPos;
    } else if (shape === 'bacillus') {
      // Place along the tapered ellipse shape
      const halfW = body.width / 2;
      const halfH = body.height / 2;
      const centerY = body.yOffset;
      // Parametric position along the bacillus edge
      const t = angle / (Math.PI * 2);
      const theta = t * Math.PI * 2;
      // Bacillus is wider in middle, narrower at ends
      const yOffset = Math.sin(theta) * halfH;
      const xScale = 1 - Math.abs(Math.sin(theta)) * 0.3; // Taper at top/bottom
      startX = Math.cos(theta) * halfW * xScale;
      startY = centerY + yOffset;
    } else if (shape === 'vibrio') {
      // Place along the C-shaped outline using same parametric curve as body
      const t = angle / (Math.PI * 2);

      // Map t to go around the whole shape: outer edge then inner edge
      // t 0-0.5 = outer edge (top to bottom), t 0.5-1 = inner edge (bottom to top)
      let pt;
      if (t < 0.5) {
        // Outer edge
        pt = getVibrioPoint(body, t * 2, true);
      } else {
        // Inner edge (reversed)
        pt = getVibrioPoint(body, (1 - t) * 2, false);
      }
      startX = pt.x;
      startY = pt.y;
    } else {
      // Rod - place around rectangle edge
      const perimeter = 2 * (body.width + body.height);
      const pos = (angle / (Math.PI * 2)) * perimeter;

      if (pos < body.width) {
        // Top edge
        startX = -body.width / 2 + pos;
        startY = -body.height / 8;
      } else if (pos < body.width + body.height) {
        // Right edge
        startX = body.width / 2;
        startY = -body.height / 8 + (pos - body.width);
      } else if (pos < 2 * body.width + body.height) {
        // Bottom edge
        startX = body.width / 2 - (pos - body.width - body.height);
        startY = body.height * 7 / 8;
      } else {
        // Left edge
        startX = -body.width / 2;
        startY = body.height * 7 / 8 - (pos - 2 * body.width - body.height);
      }
    }

    // Calculate end point
    const outwardAngle = Math.atan2(startY - body.yOffset, startX);
    const endX = startX + Math.cos(outwardAngle) * length;
    const endY = startY + Math.sin(outwardAngle) * length;

    // Draw curved pilus
    const ctrlX = (startX + endX) / 2 + curvature * length;
    const ctrlY = (startY + endY) / 2 + curvature * length;

    p.beginShape();
    p.vertex(startX, startY);
    p.quadraticVertex(ctrlX, ctrlY, endX, endY);
    p.endShape();
  }
  p.pop();
}

/**
 * Draw the bacteria body based on selected shape
 * @param {p5} p - p5 instance
 */
function drawBody(p) {
  const state = BacteriaState;
  const shape = state.controls.shape || 'rod';

  switch (shape) {
    case 'coccus':
      drawCoccusBody(p);
      break;
    case 'bacillus':
      drawBacillusBody(p);
      break;
    case 'vibrio':
      drawVibrioBody(p);
      break;
    case 'spirillum':
      drawSpirillumBody(p);
      break;
    case 'rod':
    default:
      drawRodBody(p);
      break;
  }
}

/**
 * Apply gradient fill if enabled, otherwise solid fill
 * @param {p5} p - p5 instance
 * @param {object} colors - RGB color object
 * @param {number} x1 - Start x
 * @param {number} y1 - Start y
 * @param {number} x2 - End x
 * @param {number} y2 - End y
 */
function applyFill(p, colors, x1, y1, x2, y2) {
  if (BacteriaState.controls.useGradient) {
    const ctx = p.drawingContext;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

    // Lighter color at top, darker at bottom
    const lighterR = Math.min(255, colors.r + 40);
    const lighterG = Math.min(255, colors.g + 40);
    const lighterB = Math.min(255, colors.b + 40);
    const darkerR = Math.max(0, colors.r - 40);
    const darkerG = Math.max(0, colors.g - 40);
    const darkerB = Math.max(0, colors.b - 40);

    gradient.addColorStop(0, `rgb(${lighterR}, ${lighterG}, ${lighterB})`);
    gradient.addColorStop(0.5, `rgb(${colors.r}, ${colors.g}, ${colors.b})`);
    gradient.addColorStop(1, `rgb(${darkerR}, ${darkerG}, ${darkerB})`);

    ctx.fillStyle = gradient;
  } else {
    p.fill(colors.r, colors.g, colors.b);
  }
}

/**
 * Draw rod-shaped bacteria (original shape)
 * @param {p5} p - p5 instance
 */
function drawRodBody(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;

  // Main body fill
  p.noStroke();
  applyFill(p, colors, 0, -body.height / 8, 0, body.height * 7 / 8);
  p.rect(-body.width / 2, -body.height / 8, body.width, body.height, body.border);

  // Background decoration (blobs)
  drawBackgroundDecoration(p);

  // Body border
  p.stroke(Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b);
  p.strokeWeight(8);
  p.noFill();
  p.rect(-body.width / 2, -body.height / 8, body.width, body.height, body.border);
}

/**
 * Draw coccus (spherical) bacteria
 * @param {p5} p - p5 instance
 */
function drawCoccusBody(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;
  const size = Math.min(body.width, body.height);

  // Main body fill - circle
  p.noStroke();
  applyFill(p, colors, 0, body.yOffset - size / 2, 0, body.yOffset + size / 2);
  p.ellipse(0, body.yOffset, size, size);

  // Background decoration (blobs)
  drawBackgroundDecoration(p, 'coccus');

  // Body border
  p.stroke(Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b);
  p.strokeWeight(8);
  p.noFill();
  p.ellipse(0, body.yOffset, size, size);
}

/**
 * Draw bacillus (elongated rod with pointed ends) bacteria
 * @param {p5} p - p5 instance
 */
function drawBacillusBody(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;

  // Draw capsule shape (elongated with rounded ends)
  p.noStroke();
  applyFill(p, colors, 0, body.yOffset - body.height / 2, 0, body.yOffset + body.height / 2);

  // Draw as a shape with pointed/tapered ends
  p.beginShape();
  const halfW = body.width / 2;
  const halfH = body.height / 2;
  const centerY = body.yOffset;
  const taper = body.width * 0.15; // How much to taper the ends

  // Top point
  p.vertex(0, centerY - halfH);
  // Right side curve
  p.bezierVertex(halfW - taper, centerY - halfH * 0.6,
                  halfW, centerY - halfH * 0.3,
                  halfW, centerY);
  p.bezierVertex(halfW, centerY + halfH * 0.3,
                  halfW - taper, centerY + halfH * 0.6,
                  0, centerY + halfH);
  // Bottom point
  // Left side curve
  p.bezierVertex(-halfW + taper, centerY + halfH * 0.6,
                  -halfW, centerY + halfH * 0.3,
                  -halfW, centerY);
  p.bezierVertex(-halfW, centerY - halfH * 0.3,
                  -halfW + taper, centerY - halfH * 0.6,
                  0, centerY - halfH);
  p.endShape(p.CLOSE);

  // Background decoration (blobs)
  drawBackgroundDecoration(p, 'bacillus');

  // Body border
  p.stroke(Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b);
  p.strokeWeight(8);
  p.noFill();
  p.beginShape();
  p.vertex(0, centerY - halfH);
  p.bezierVertex(halfW - taper, centerY - halfH * 0.6,
                  halfW, centerY - halfH * 0.3,
                  halfW, centerY);
  p.bezierVertex(halfW, centerY + halfH * 0.3,
                  halfW - taper, centerY + halfH * 0.6,
                  0, centerY + halfH);
  p.bezierVertex(-halfW + taper, centerY + halfH * 0.6,
                  -halfW, centerY + halfH * 0.3,
                  -halfW, centerY);
  p.bezierVertex(-halfW, centerY - halfH * 0.3,
                  -halfW + taper, centerY - halfH * 0.6,
                  0, centerY - halfH);
  p.endShape(p.CLOSE);
}

/**
 * Get vibrio shape parameters for consistent use across drawing and pili
 */
function getVibrioParams(body) {
  const thickness = body.width * 0.28; // Slightly thinner tube
  const halfH = body.height / 2;
  const centerY = body.yOffset;
  // Elliptical arc - wider than tall for flattened C shape
  const arcRadiusX = body.width * 0.35; // Horizontal radius (how far it curves out)
  const arcRadiusY = halfH * 0.75; // Vertical radius (height of the C)
  const arcCenterX = arcRadiusX * 0.1; // Slight offset to the left

  return { thickness, halfH, centerY, arcRadiusX, arcRadiusY, arcCenterX };
}

/**
 * Get point on vibrio outline at parameter t (0 to 1)
 * t=0 is top, t=1 is bottom
 * Includes rounded caps at the ends
 */
function getVibrioPoint(body, t, isOuter) {
  const { thickness, centerY, arcRadiusX, arcRadiusY, arcCenterX } = getVibrioParams(body);
  const halfThick = thickness / 2;

  // Reserve some of t for the rounded caps
  const capT = 0.08; // How much of t is used for each cap

  let cx, cy, nx, ny;

  if (t < capT) {
    // Top rounded cap
    const capAngle = Math.PI + (t / capT) * (Math.PI / 2); // PI to PI/2
    const capCenterX = arcCenterX + Math.cos(-Math.PI / 2) * arcRadiusX;
    const capCenterY = centerY + Math.sin(-Math.PI / 2) * arcRadiusY;
    cx = capCenterX + Math.cos(capAngle) * halfThick;
    cy = capCenterY + Math.sin(capAngle) * halfThick;
    nx = Math.cos(capAngle);
    ny = Math.sin(capAngle);
  } else if (t > 1 - capT) {
    // Bottom rounded cap
    const localT = (t - (1 - capT)) / capT;
    const capAngle = Math.PI / 2 + localT * (Math.PI / 2); // PI/2 to PI
    const capCenterX = arcCenterX + Math.cos(Math.PI / 2) * arcRadiusX;
    const capCenterY = centerY + Math.sin(Math.PI / 2) * arcRadiusY;
    cx = capCenterX + Math.cos(capAngle) * halfThick;
    cy = capCenterY + Math.sin(capAngle) * halfThick;
    nx = Math.cos(capAngle);
    ny = Math.sin(capAngle);
  } else {
    // Main arc section (elliptical)
    const mainT = (t - capT) / (1 - 2 * capT);
    const arcAngle = -Math.PI / 2 + mainT * Math.PI;

    // Center of the tube at this point (elliptical)
    cx = arcCenterX + Math.cos(arcAngle) * arcRadiusX;
    cy = centerY + Math.sin(arcAngle) * arcRadiusY;

    // Normal direction for ellipse (not simple cos/sin)
    // Tangent is (-arcRadiusX*sin, arcRadiusY*cos), normal is perpendicular
    const tx = -arcRadiusX * Math.sin(arcAngle);
    const ty = arcRadiusY * Math.cos(arcAngle);
    const tLen = Math.sqrt(tx * tx + ty * ty);
    nx = ty / tLen; // Normal is perpendicular to tangent
    ny = -tx / tLen;
  }

  // Offset by thickness
  const offset = isOuter ? halfThick : -halfThick;

  return {
    x: cx + nx * offset,
    y: cy + ny * offset,
    nx: nx,
    ny: ny
  };
}

/**
 * Draw vibrio (comma-shaped) bacteria - smooth C/bean shape
 * @param {p5} p - p5 instance
 */
function drawVibrioBody(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;
  const { halfH, centerY } = getVibrioParams(body);

  p.noStroke();
  applyFill(p, colors, 0, centerY - halfH, 0, centerY + halfH);

  const segments = 30;

  // Draw smooth C shape by tracing outer edge, then inner edge
  p.beginShape();

  // Outer edge (top to bottom)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = getVibrioPoint(body, t, true);
    p.vertex(pt.x, pt.y);
  }

  // Inner edge (bottom to top)
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const pt = getVibrioPoint(body, t, false);
    p.vertex(pt.x, pt.y);
  }

  p.endShape(p.CLOSE);

  // Background decoration (blobs)
  drawBackgroundDecoration(p, 'vibrio');

  // Body border - same shape
  p.stroke(Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b);
  p.strokeWeight(8);
  p.noFill();

  p.beginShape();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pt = getVibrioPoint(body, t, true);
    p.vertex(pt.x, pt.y);
  }
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const pt = getVibrioPoint(body, t, false);
    p.vertex(pt.x, pt.y);
  }
  p.endShape(p.CLOSE);
}

/**
 * Draw spirillum (spiral/corkscrew) bacteria
 * @param {p5} p - p5 instance
 */
function drawSpirillumBody(p) {
  const colors = getDisplayColors();
  const body = BacteriaState.generated.bodyDimensions;

  const centerY = body.yOffset;
  const halfH = body.height / 2;
  const amplitude = body.width * 0.3;
  const thickness = body.width * 0.25;
  const waves = 2.5;

  // Draw spiral as a thick wavy shape
  p.noStroke();
  applyFill(p, colors, 0, centerY - halfH, 0, centerY + halfH);

  p.beginShape();
  // Left edge (going down)
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const y = centerY - halfH + t * body.height;
    const x = Math.sin(t * Math.PI * 2 * waves) * amplitude - thickness / 2;
    p.vertex(x, y);
  }
  // Right edge (going up)
  for (let i = 30; i >= 0; i--) {
    const t = i / 30;
    const y = centerY - halfH + t * body.height;
    const x = Math.sin(t * Math.PI * 2 * waves) * amplitude + thickness / 2;
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);

  // Background decoration (blobs)
  drawBackgroundDecoration(p, 'spirillum');

  // Body border
  p.stroke(Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b);
  p.strokeWeight(8);
  p.noFill();
  p.beginShape();
  for (let i = 0; i <= 30; i++) {
    const t = i / 30;
    const y = centerY - halfH + t * body.height;
    const x = Math.sin(t * Math.PI * 2 * waves) * amplitude - thickness / 2;
    p.vertex(x, y);
  }
  for (let i = 30; i >= 0; i--) {
    const t = i / 30;
    const y = centerY - halfH + t * body.height;
    const x = Math.sin(t * Math.PI * 2 * waves) * amplitude + thickness / 2;
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);
}

/**
 * Draw background decoration blobs inside the bacteria
 * @param {p5} p - p5 instance
 * @param {string} shape - Optional shape type for adjusted positioning
 */
function drawBackgroundDecoration(p, shape) {
  const colors = getDisplayColors();
  const blobs = BacteriaState.generated.blobs;
  const body = BacteriaState.generated.bodyDimensions;

  p.noStroke();
  p.fill(Math.max(0, colors.r - 60), Math.max(0, colors.g - 30), Math.max(0, colors.b - 50));

  // Use pre-generated blob positions, with shape-specific adjustments
  for (const blob of blobs) {
    let x = blob.x;
    let y = blob.y;

    // Adjust blob positions for different shapes
    if (shape === 'spirillum') {
      // Follow the wave pattern
      const t = (y - body.yOffset + body.height / 2) / body.height;
      const waveOffset = Math.sin(t * Math.PI * 2 * 2.5) * body.width * 0.3;
      x = x * 0.3 + waveOffset;
    } else if (shape === 'vibrio') {
      // Place blobs along the C-shape curve centerline using parametric approach
      const { thickness, centerY, arcRadiusX, arcRadiusY, arcCenterX } = getVibrioParams(body);

      // Map y position to arc parameter t (0 at top, 1 at bottom)
      const yNorm = (y - (centerY - arcRadiusY)) / (2 * arcRadiusY);
      const t = Math.max(0, Math.min(1, yNorm));

      // Get the centerline position at this t (elliptical)
      const arcAngle = -Math.PI / 2 + t * Math.PI;
      const centerLineX = arcCenterX + Math.cos(arcAngle) * arcRadiusX;
      const centerLineY = centerY + Math.sin(arcAngle) * arcRadiusY;

      // Spread blobs around the centerline
      const halfThick = thickness / 2;
      x = centerLineX + (x / (body.width * 0.4)) * halfThick * 0.6;
      y = centerLineY;

      // Clamp to stay within the shape
      x = Math.max(centerLineX - halfThick * 0.7, Math.min(centerLineX + halfThick * 0.7, x));
    } else if (shape === 'coccus') {
      // Keep blobs within circular bounds
      const dist = Math.sqrt(x * x + (y - body.yOffset) * (y - body.yOffset));
      const maxDist = Math.min(body.width, body.height) * 0.35;
      if (dist > maxDist) {
        const scale = maxDist / dist;
        x *= scale;
        y = body.yOffset + (y - body.yOffset) * scale;
      }
    }

    p.ellipse(x, y, blob.size, blob.size);
  }
}

/**
 * Draw flagella (tail-like structures) with sinusoidal wave shape
 * @param {p5} p - p5 instance
 */
function drawFlagella(p) {
  const state = BacteriaState;
  const controls = state.controls;
  const colors = getDisplayColors();
  const body = state.generated.bodyDimensions;
  const flag = state.generated.flagella;
  const anim = state.animation;

  const flagellaColor = [Math.max(0, colors.r - 40), Math.max(0, colors.g - 40), colors.b];

  // Animation phase for waving effect
  const animPhase = anim.time * 0.004;

  // Adjust flagella positions based on shape
  // For coccus (circular), flagella should start from the top/bottom of the circle
  // Coccus is centered at body.yOffset, so we need to offset from there
  const isCoccus = controls.shape === 'coccus';
  const size = Math.min(body.width, body.height);
  const topStartY = isCoccus ? body.yOffset - size / 2 : -body.height / 8;
  const bottomStartY = isCoccus ? body.yOffset + size / 2 : body.height * 7 / 8;

  // Top flagella - wavy sinusoidal shape going upward
  if (controls.showTopFlagella) {
    drawSinusoidalFlagellum(p, {
      startX: 0,
      startY: topStartY,
      length: flag.h,
      amplitude: flag.amplitude1,
      wavelength: flag.wavelength1,
      thickness: 12,
      direction: -1, // Going up
      animPhase: animPhase,
      color: flagellaColor
    });
  }

  // Bottom flagella - wavy sinusoidal shape going downward (symmetric to top)
  if (controls.showBottomFlagella) {
    drawSinusoidalFlagellum(p, {
      startX: 0,
      startY: bottomStartY,
      length: flag.h,
      amplitude: flag.amplitude2,
      wavelength: flag.wavelength2,
      thickness: 10,
      direction: 1, // Going down
      animPhase: animPhase + Math.PI,
      color: flagellaColor
    });
  }
}

/**
 * Draw a single sinusoidal flagellum
 * @param {p5} p - p5 instance
 * @param {object} opts - Configuration options
 */
function drawSinusoidalFlagellum(p, opts) {
  const { startX, startY, length, amplitude, wavelength, thickness, direction, animPhase, color } = opts;
  const segments = 30;

  p.noStroke();
  p.fill(...color);

  // Draw as a filled shape by tracing one side and then the other
  p.beginShape();

  // First side (left edge of flagellum)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = startY + direction * t * length;
    const wave = Math.sin(t * Math.PI * 2 * wavelength + animPhase) * amplitude * t;
    const currentThickness = thickness * (1 - t * 0.7); // Taper towards end
    p.vertex(startX + wave - currentThickness / 2, y);
  }

  // Second side (right edge of flagellum) - trace back
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const y = startY + direction * t * length;
    const wave = Math.sin(t * Math.PI * 2 * wavelength + animPhase) * amplitude * t;
    const currentThickness = thickness * (1 - t * 0.7);
    p.vertex(startX + wave + currentThickness / 2, y);
  }

  p.endShape(p.CLOSE);
}

/**
 * Draw eyes
 * @param {p5} p - p5 instance
 */
function drawEyes(p) {
  const state = BacteriaState;
  const eyeCount = parseInt(state.controls.eyeCount);

  if (eyeCount === 1) {
    drawSingleEye(p, 0);
  } else {
    const body = state.generated.bodyDimensions;
    const offset = body.width / 3;
    drawSingleEye(p, -offset);
    drawSingleEye(p, offset);
  }
}

/**
 * Draw a single eye at specified x position
 * @param {p5} p - p5 instance
 * @param {number} xPos - X position offset
 */
function drawSingleEye(p, xPos) {
  const colors = getDisplayColors();
  const eyes = BacteriaState.generated.eyes;

  // White of eye
  p.noStroke();
  p.fill(255, 255, 255, 255);
  p.ellipse(xPos, 0, eyes.whiteSize, eyes.whiteSizeY);

  // Iris (complementary color using HSL shift)
  const baseHsl = rgbToHsl(colors.r, colors.g, colors.b);
  const irisHsl = { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l };
  const irisRgb = hslToRgb(irisHsl.h, irisHsl.s, irisHsl.l);
  p.fill(irisRgb.r, irisRgb.g, irisRgb.b);
  p.ellipse(
    xPos + eyes.lookOffset,
    eyes.lookOffset,
    eyes.irisSize,
    eyes.irisSizeY
  );

  // Pupil
  p.fill(10);
  p.ellipse(
    xPos + eyes.lookOffset,
    eyes.lookOffset,
    eyes.pupilSize,
    eyes.pupilSizeY
  );

  // Highlight reflection
  p.fill(255, 255, 255);
  p.ellipse(
    xPos + eyes.pupilOffset,
    -eyes.pupilOffset,
    10,
    10
  );
}

/**
 * Save the canvas as PNG
 * @param {p5} p - p5 instance
 * @param {object} canvas - p5 canvas reference
 */
function saveBacteriaPNG(p, canvas) {
  p.saveCanvas(canvas, 'Bacteria', 'png');
}

// Export for use in other modules
window.drawBacteria = drawBacteria;
window.saveBacteriaPNG = saveBacteriaPNG;
