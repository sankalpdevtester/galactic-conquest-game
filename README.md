# Galactic Conquest Game

A web-based 3D space strategy game built with Three.js and vanilla JavaScript.

## Features

- 🚀 3D space environment with realistic star fields
- 🪐 Multiple planetary systems to conquer
- ⚔️ Real-time space combat
- 🏗️ Base building and resource management
- 🎮 Mouse and keyboard controls
- 📊 Strategic gameplay with fleet management

## Tech Stack

- **Three.js** - 3D graphics rendering
- **JavaScript (ES6+)** - Game logic
- **HTML5 Canvas** - 2D UI overlays
- **CSS3** - Styling

## Installation

No build step required! Simply open `index.html` in a modern browser.

For development server:
```bash
npx http-server . -p 8080
```

Then visit: http://localhost:8080

## How to Play

1. **Camera Controls**: Click and drag to rotate, scroll to zoom
2. **Select Units**: Click on ships or planets
3. **Move Ships**: Right-click destination after selecting a ship
4. **Build**: Click on your planets to access build menu
5. **Attack**: Select your fleet and right-click enemy units

## Game Objective

Conquer all enemy planets by:
- Building a powerful fleet
- Managing resources efficiently
- Strategic positioning and attacks
- Defending your territory

## File Structure

```
├── index.html              # Main entry point
├── src/
│   ├── game.js            # Core game engine
│   ├── scene.js           # Three.js scene setup
│   ├── entities/
│   │   ├── Planet.js      # Planet class
│   │   ├── Ship.js        # Spaceship class
│   │   └── StarField.js   # Background stars
│   ├── systems/
│   │   ├── Combat.js      # Combat system
│   │   ├── Resources.js   # Resource management
│   │   └── AI.js          # AI player logic
│   └── ui/
│       ├── HUD.js         # Heads-up display
│       └── Controls.js    # Input handling
├── assets/
│   └── models/            # 3D models
└── styles/
    └── main.css           # Styling
```

## Controls

- **Left Click**: Select unit/planet
- **Right Click**: Move/Attack command
- **Mouse Drag**: Rotate camera
- **Mouse Wheel**: Zoom in/out
- **Space**: Pause game
- **1-5 Keys**: Quick select unit groups
- **ESC**: Deselect all

## Development

To modify game parameters:
- Edit `src/game.js` for game rules
- Edit `src/entities/*.js` for unit stats
- Edit `src/systems/Combat.js` for combat mechanics

## Credits

Built with Three.js and modern web technologies.

## License

MIT License - Feel free to use for learning and projects!
