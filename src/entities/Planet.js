import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export class Planet {
    constructor(x, y, z, size, owner, name) {
        this.position = new THREE.Vector3(x, y, z);
        this.size = size;
        this.owner = owner; // 'player', 'enemy', 'neutral'
        this.name = name;
        this.health = 100;
        this.resources = {
            energy: 100,
            metal: 50,
            crystals: 10
        };
        
        // Visual representation
        this.mesh = this.createMesh();
        this.mesh.userData = { entity: this, type: 'planet' };
        
        // Resource generation
        this.resourceTimer = 0;
        this.resourceInterval = 2000; // ms
    }
    
    createMesh() {
        const geometry = new THREE.SphereGeometry(this.size, 32, 32);
        let color;
        
        switch(this.owner) {
            case 'player':
                color = 0x3366ff;
                break;
            case 'enemy':
                color = 0xff3333;
                break;
            default:
                color = 0x888888;
        }
        
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            shininess: 30
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        
        // Add atmosphere glow
        const glowGeometry = new THREE.SphereGeometry(this.size * 1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);
        
        return mesh;
    }
    
    update(deltaTime) {
        // Rotate planet
        this.mesh.rotation.y += 0.0002 * deltaTime;
        
        // Generate resources if owned
        if (this.owner === 'player' || this.owner === 'enemy') {
            this.resourceTimer += deltaTime;
            if (this.resourceTimer >= this.resourceInterval) {
                this.generateResources();
                this.resourceTimer = 0;
            }
        }
    }
    
    generateResources() {
        const rate = this.size * 2;
        this.resources.energy += rate;
        this.resources.metal += rate * 0.5;
        this.resources.crystals += rate * 0.1;
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            return true; // Planet destroyed
        }
        return false;
    }
    
    changeOwner(newOwner) {
        this.owner = newOwner;
        this.health = 100;
        
        // Update visual
        let color;
        switch(newOwner) {
            case 'player':
                color = 0x3366ff;
                break;
            case 'enemy':
                color = 0xff3333;
                break;
            default:
                color = 0x888888;
        }
        
        this.mesh.material.color.setHex(color);
        this.mesh.material.emissive.setHex(color);
        this.mesh.children[0].material.color.setHex(color);
    }
    
    getInfo() {
        return {
            name: this.name,
            owner: this.owner,
            health: Math.round(this.health),
            resources: {
                energy: Math.round(this.resources.energy),
                metal: Math.round(this.resources.metal),
                crystals: Math.round(this.resources.crystals)
            }
        };
    }
}
