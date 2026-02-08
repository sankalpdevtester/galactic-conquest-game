import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export class Controls {
    constructor(game) {
        this.game = game;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isDragging = false;
        this.previousMouse = { x: 0, y: 0 };
        
        this.setupControls();
    }
    
    setupControls() {
        const canvas = document.getElementById('game-canvas');
        
        // Mouse click - selection
        canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Right click - move/attack command
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(e);
        });
        
        // Mouse drag - camera rotation
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left button
                this.isDragging = true;
                this.previousMouse.x = e.clientX;
                this.previousMouse.y = e.clientY;
            }
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.previousMouse.x;
                const deltaY = e.clientY - this.previousMouse.y;
                
                this.rotateCamera(deltaX, deltaY);
                
                this.previousMouse.x = e.clientX;
                this.previousMouse.y = e.clientY;
            }
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        // Mouse wheel - zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e.deltaY);
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    handleClick(event) {
        this.updateMousePosition(event);
        
        const intersects = this.raycast();
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // Clear previous selection
            this.game.selectedEntities.forEach(selected => {
                if (selected.entity.setSelected) {
                    selected.entity.setSelected(false);
                }
            });
            this.game.selectedEntities = [];
            
            // Select new object
            if (object.userData.entity) {
                this.game.selectedEntities.push({
                    type: object.userData.type,
                    entity: object.userData.entity
                });
                
                if (object.userData.entity.setSelected) {
                    object.userData.entity.setSelected(true);
                }
            }
        } else {
            // Clicked empty space - deselect all
            this.game.selectedEntities.forEach(selected => {
                if (selected.entity.setSelected) {
                    selected.entity.setSelected(false);
                }
            });
            this.game.selectedEntities = [];
        }
    }
    
    handleRightClick(event) {
        this.updateMousePosition(event);
        
        const intersects = this.raycast();
        const selectedShips = this.game.selectedEntities.filter(s => s.type === 'ship');
        
        if (selectedShips.length === 0) return;
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const targetEntity = object.userData.entity;
            
            selectedShips.forEach(selected => {
                const ship = selected.entity;
                
                if (targetEntity && targetEntity.owner !== ship.owner) {
                    // Attack enemy
                    ship.attackMove(targetEntity);
                } else {
                    // Move to location
                    ship.moveTo(intersects[0].point);
                }
            });
        } else {
            // Move to empty space
            const direction = new THREE.Vector3();
            this.raycaster.ray.at(100, direction);
            
            selectedShips.forEach(selected => {
                selected.entity.moveTo(direction);
            });
        }
    }
    
    handleZoom(delta) {
        const zoomSpeed = 5;
        const direction = new THREE.Vector3();
        this.game.camera.getWorldDirection(direction);
        
        if (delta < 0) {
            // Zoom in
            this.game.camera.position.addScaledVector(direction, zoomSpeed);
        } else {
            // Zoom out
            this.game.camera.position.addScaledVector(direction, -zoomSpeed);
        }
        
        // Clamp camera distance
        const distance = this.game.camera.position.length();
        if (distance < 50) {
            this.game.camera.position.normalize().multiplyScalar(50);
        } else if (distance > 500) {
            this.game.camera.position.normalize().multiplyScalar(500);
        }
    }
    
    rotateCamera(deltaX, deltaY) {
        const rotationSpeed = 0.005;
        
        // Rotate around center
        const offset = new THREE.Vector3().copy(this.game.camera.position);
        
        // Horizontal rotation
        const angle = -deltaX * rotationSpeed;
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        
        // Vertical rotation (limited)
        const verticalAngle = -deltaY * rotationSpeed;
        const axis = new THREE.Vector3(1, 0, 0);
        const rotatedOffset = offset.clone().applyAxisAngle(axis, verticalAngle);
        
        // Prevent flipping camera
        if (rotatedOffset.y > 10 && rotatedOffset.y < 400) {
            offset.copy(rotatedOffset);
        }
        
        this.game.camera.position.copy(offset);
        this.game.camera.lookAt(0, 0, 0);
    }
    
    handleKeyboard(event) {
        switch(event.key) {
            case ' ':
                // Pause (not implemented)
                break;
            case 'Escape':
                // Deselect all
                this.game.selectedEntities.forEach(selected => {
                    if (selected.entity.setSelected) {
                        selected.entity.setSelected(false);
                    }
                });
                this.game.selectedEntities = [];
                break;
        }
    }
    
    updateMousePosition(event) {
        const canvas = document.getElementById('game-canvas');
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    raycast() {
        this.raycaster.setFromCamera(this.mouse, this.game.camera);
        
        // Get all interactive objects
        const objects = [
            ...this.game.planets.map(p => p.mesh),
            ...this.game.ships.map(s => s.mesh)
        ];
        
        return this.raycaster.intersectObjects(objects, true);
    }
}
