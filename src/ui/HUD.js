export class HUD {
    constructor(game) {
        this.game = game;
        this.setupElements();
        this.setupBuildMenu();
        this.updateResources();
    }
    
    setupElements() {
        this.energyEl = document.getElementById('energy');
        this.metalEl = document.getElementById('metal');
        this.crystalsEl = document.getElementById('crystals');
        this.gameTimeEl = document.getElementById('game-time');
        this.populationEl = document.getElementById('population');
        this.selectionDetailsEl = document.getElementById('selection-details');
        this.buildMenuEl = document.getElementById('build-menu');
    }
    
    setupBuildMenu() {
        const buildButtons = document.querySelectorAll('.build-btn');
        buildButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const unitType = btn.dataset.unit;
                this.handleBuild(unitType);
            });
        });
        
        // Restart button
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });
    }
    
    handleBuild(unitType) {
        const selected = this.game.selectedEntities[0];
        
        if (selected && selected.type === 'planet' && selected.entity.owner === 'player') {
            const success = this.game.buildShip(unitType, selected.entity);
            
            if (!success) {
                this.showNotification('Insufficient resources!', 'error');
            } else {
                this.showNotification(`${unitType} built!`, 'success');
            }
        }
    }
    
    update() {
        this.updateResources();
        this.updateGameTime();
        this.updatePopulation();
        this.updateSelection();
    }
    
    updateResources() {
        this.energyEl.textContent = Math.floor(this.game.resources.energy);
        this.metalEl.textContent = Math.floor(this.game.resources.metal);
        this.crystalsEl.textContent = Math.floor(this.game.resources.crystals);
    }
    
    updateGameTime() {
        const seconds = Math.floor(this.game.gameTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.gameTimeEl.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    
    updatePopulation() {
        const playerShips = this.game.ships.filter(s => s.owner === 'player').length;
        const maxPopulation = this.game.planets.filter(p => p.owner === 'player').length * 20;
        this.populationEl.textContent = `👥 ${playerShips}/${maxPopulation}`;
    }
    
    updateSelection() {
        const selected = this.game.selectedEntities;
        
        if (selected.length === 0) {
            this.selectionDetailsEl.innerHTML = '<p>No unit selected</p>';
            this.buildMenuEl.classList.add('hidden');
            return;
        }
        
        if (selected.length === 1) {
            const entity = selected[0].entity;
            const info = entity.getInfo();
            
            if (selected[0].type === 'planet') {
                this.selectionDetailsEl.innerHTML = `
                    <p><strong>${info.name}</strong></p>
                    <p>Owner: ${info.owner}</p>
                    <p>Health: ${info.health}/100</p>
                    <p>⚡ Energy: ${info.resources.energy}</p>
                    <p>⚙️ Metal: ${info.resources.metal}</p>
                    <p>💎 Crystals: ${info.resources.crystals}</p>
                `;
                
                // Show build menu for player planets
                if (info.owner === 'player') {
                    this.buildMenuEl.classList.remove('hidden');
                } else {
                    this.buildMenuEl.classList.add('hidden');
                }
            } else if (selected[0].type === 'ship') {
                this.selectionDetailsEl.innerHTML = `
                    <p><strong>${info.type.toUpperCase()}</strong></p>
                    <p>Owner: ${info.owner}</p>
                    <p>Health: ${info.health}/${info.maxHealth}</p>
                    <p>⚔️ Damage: ${info.damage}</p>
                    <p>🚀 Speed: ${info.speed}</p>
                `;
                this.buildMenuEl.classList.add('hidden');
            }
        } else {
            // Multiple selection
            this.selectionDetailsEl.innerHTML = `
                <p><strong>${selected.length} units selected</strong></p>
                <p>${selected.filter(s => s.type === 'ship').length} ships</p>
                <p>${selected.filter(s => s.type === 'planet').length} planets</p>
            `;
            this.buildMenuEl.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '100px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.borderRadius = '8px';
        notification.style.color = '#fff';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '10000';
        notification.style.animation = 'slideIn 0.3s ease';
        
        if (type === 'error') {
            notification.style.background = 'rgba(255, 50, 50, 0.9)';
        } else if (type === 'success') {
            notification.style.background = 'rgba(50, 255, 50, 0.9)';
        } else {
            notification.style.background = 'rgba(50, 150, 255, 0.9)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }
}
