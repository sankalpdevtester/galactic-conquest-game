import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { Planet } from './entities/Planet.js';
import { Ship } from './entities/Ship.js';
import { StarField } from './entities/StarField.js';
import { HUD } from './ui/HUD.js';
import { Controls } from './ui/Controls.js';

class GalacticConquest {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = [];
        this.ships = [];
        this.selectedEntities = [];
        
        this.resources = {
            energy: 1000,
            metal: 500,
            crystals: 100
        };
        
        this.gameTime = 0;
        this.lastUpdate = Date.now();
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupLights();
        this.createStarField();
        this.createPlanets();
        this.createInitialFleet();
        
        this.hud = new HUD(this);
        this.controls = new Controls(this);
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2000);
        
        this.animate();
    }
    
    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000510);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            3000
        );
        this.camera.position.set(0, 100, 150);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(ambient);
        
        // Directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(200, 200, 100);
        this.scene.add(sun);
        
        // Point lights for atmosphere
        const light1 = new THREE.PointLight(0x4444ff, 0.5, 500);
        light1.position.set(100, 50, 100);
        this.scene.add(light1);
        
        const light2 = new THREE.PointLight(0xff4444, 0.5, 500);
        light2.position.set(-100, 50, -100);
        this.scene.add(light2);
    }
    
    createStarField() {
        const starField = new StarField(3000);
        this.scene.add(starField.getMesh());
        this.starField = starField;
    }
    
    createPlanets() {
        // Home planet (player)
        const homePlanet = new Planet(-50, 0, 0, 8, 'player', 'Terra Prime');
        this.planets.push(homePlanet);
        this.scene.add(homePlanet.mesh);
        
        // Enemy planet
        const enemyPlanet = new Planet(50, 0, 50, 8, 'enemy', 'Xenos Prime');
        this.planets.push(enemyPlanet);
        this.scene.add(enemyPlanet.mesh);
        
        // Neutral planets
        const neutral1 = new Planet(0, 0, -60, 6, 'neutral', 'Outpost Alpha');
        this.planets.push(neutral1);
        this.scene.add(neutral1.mesh);
        
        const neutral2 = new Planet(70, 0, -30, 5, 'neutral', 'Mining Station Beta');
        this.planets.push(neutral2);
        this.scene.add(neutral2.mesh);
        
        const neutral3 = new Planet(-70, 0, 40, 5, 'neutral', 'Research Base Gamma');
        this.planets.push(neutral3);
        this.scene.add(neutral3.mesh);
    }
    
    createInitialFleet() {
        // Player starting ships
        for (let i = 0; i < 3; i++) {
            const ship = new Ship(-40 + i * 5, 0, -10, 'scout', 'player');
            this.ships.push(ship);
            this.scene.add(ship.mesh);
        }
        
        // Enemy starting ships
        for (let i = 0; i < 3; i++) {
            const ship = new Ship(40 + i * 5, 0, 60, 'scout', 'enemy');
            this.ships.push(ship);
            this.scene.add(ship.mesh);
        }
    }
    
    buildShip(type, planet) {
        const costs = {
            scout: { energy: 50, metal: 25, crystals: 0 },
            fighter: { energy: 100, metal: 50, crystals: 0 },
            cruiser: { energy: 200, metal: 100, crystals: 20 },
            battleship: { energy: 500, metal: 250, crystals: 50 }
        };
        
        const cost = costs[type];
        
        // Check if can afford
        if (this.resources.energy >= cost.energy &&
            this.resources.metal >= cost.metal &&
            this.resources.crystals >= cost.crystals) {
            
            // Deduct resources
            this.resources.energy -= cost.energy;
            this.resources.metal -= cost.metal;
            this.resources.crystals -= cost.crystals;
            
            // Create ship near planet
            const offset = (Math.random() - 0.5) * 20;
            const ship = new Ship(
                planet.position.x + offset,
                planet.position.y,
                planet.position.z + offset,
                type,
                'player'
            );
            this.ships.push(ship);
            this.scene.add(ship.mesh);
            
            this.hud.updateResources();
            return true;
        }
        
        return false;
    }
    
    update() {
        const now = Date.now();
        const deltaTime = now - this.lastUpdate;
        this.lastUpdate = now;
        
        this.gameTime += deltaTime;
        
        // Update star field
        if (this.starField) {
            this.starField.update();
        }
        
        // Update planets
        this.planets.forEach(planet => {
            planet.update(deltaTime);
            
            // Transfer resources from player planets
            if (planet.owner === 'player') {
                this.resources.energy += planet.resources.energy * 0.1;
                this.resources.metal += planet.resources.metal * 0.1;
                this.resources.crystals += planet.resources.crystals * 0.1;
            }
        });
        
        // Update ships
        this.ships = this.ships.filter(ship => {
            ship.update(deltaTime);
            
            // Remove destroyed ships
            if (ship.health <= 0) {
                this.scene.remove(ship.mesh);
                return false;
            }
            return true;
        });
        
        // Check win/lose conditions
        this.checkGameState();
        
        // Update HUD
        if (this.hud) {
            this.hud.update();
        }
    }
    
    checkGameState() {
        const playerPlanets = this.planets.filter(p => p.owner === 'player').length;
        const enemyPlanets = this.planets.filter(p => p.owner === 'enemy').length;
        const playerShips = this.ships.filter(s => s.owner === 'player').length;
        const enemyShips = this.ships.filter(s => s.owner === 'enemy').length;
        
        if (enemyPlanets === 0 && enemyShips === 0) {
            this.gameOver('victory');
        } else if (playerPlanets === 0 && playerShips === 0) {
            this.gameOver('defeat');
        }
    }
    
    gameOver(result) {
        const screen = document.getElementById('game-over-screen');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');
        
        if (result === 'victory') {
            title.textContent = '🎉 Victory! 🎉';
            message.textContent = 'You have conquered the galaxy!';
        } else {
            title.textContent = '💀 Defeat 💀';
            title.style.color = '#ff3333';
            message.textContent = 'Your empire has fallen...';
        }
        
        screen.classList.remove('hidden');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GalacticConquest();
});
