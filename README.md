# DrawMeABacteria

A p5.js application for procedurally generating cute, customizable cartoon bacteria.

![Cute bacteria](asset/DrawMeBacteria_Banner.png)

## Features

- **Multiple Bacteria Shapes**: Rod, Coccus, Bacillus, Spirillum, and Vibrio
- **Customizable Appearance**: Adjust body size, eye count, eye size, and blob density
- **Visual Effects**: Gradient fills, glow effects, and pili (hair-like structures)
- **Flagella**: Toggle top and/or bottom flagella with animation
- **Presets**: Quick-apply styles like Cute, Creepy, Classic, Tiny, Giant, and Spiral
- **Seed System**: Reproducible bacteria - save and share seeds to recreate exact bacteria
- **Export**: Save your bacteria as PNG images

## Live Demo

Open `index.html` in a browser or host on any static web server (GitHub Pages, Netlify, Vercel, etc.)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Randomize bacteria |
| `S` | Save as PNG |
| `F` | Toggle flagella |
| `A` | Toggle animation |
| `1` | Set 1 eye |
| `2` | Set 2 eyes |

## Project Structure

```
DrawMeABacteria/
├── index.html           # Main HTML file
├── libraries/
│   └── p5.js           # p5.js library
└── src/
    ├── main.js         # Application entry point
    ├── state.js        # Global state management
    ├── bacteriaRenderer.js  # Drawing functions
    ├── controlPanel.js # UI controls
    └── presets.js      # Preset configurations
```

## Usage

1. Clone or download the repository
2. Open `index.html` in a web browser
3. Use the control panel to customize your bacteria
4. Press `R` or click "Randomize" to generate new bacteria
5. Press `S` or click "Save PNG" to download your creation

## Hosting

This is a fully client-side application with no server dependencies. Simply deploy the files to any static hosting service:

- **GitHub Pages**: Push to a `gh-pages` branch or enable Pages in repository settings
- **Netlify/Vercel**: Connect your repository for automatic deployments
- **Local**: Open `index.html` directly in your browser
