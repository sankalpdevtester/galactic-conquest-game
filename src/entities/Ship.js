import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export class Ship {
    constructor(x, y, z, type, owner) {
        this.position = new THREE.Vector3(x, y, z);
        this.type = type; // 'scout', 'fighter', 'cruiser', 'battleship'
        this.owner = owner;
        this.velocity = new THREE.Vector3();
        this.target = null;
        this.targetEntity = null;
        this.selected = false;
        
        // Stats based on type
        this.stats = this.getStats(type);
        this.health = this.stats.maxHealth;
        
        // Combat
        this.attackCooldown = 0;
        
        // Visual
        this.mesh = this.createMesh();
        this.mesh.userData = { entity: this, type: 'ship' };
    }
    
    getStats(type) {
        const stats = {
            scout: {
                maxHealth: 50,
                speed: 15,
                damage: 5,
                attackRange: 30,
                attackSpeed: 1000,
                size: 1
            },
            fighter: {
                maxHealth: 100,
                speed: 12,
                damage: 15,
                attackRange: 35,
                attackSpeed: 800,
                size: 1.5
            },
            cruiser: {
                maxHealth: 250,
                speed: 8,
                damage: 30,
                attackRange: 40,
                attackSpeed: 1200,
                size: 2.5
            },
            battleship: {
                maxHealth: 500,
                speed: 5,
                damage: 60,
                attackRange: 50,
                attackSpeed: 1500,
                size: 4
            }
        };
        return stats[type] || stats.scout;
    }
    
    createMesh() {
        const color = this.owner === 'player' ? 0x00ffff : 0xff0000;
        
        // Create simple ship shape
        const geometry = new THREE.ConeGeometry(this.stats.size, this.stats.size * 2, 4);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.3,
            flatShading: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.rotation.x = Math.PI / 2; // Point forward
        
        return mesh;
    }
    
    update(deltaTime) {
        // Movement
        if (this.target) {
            const direction = new THREE.Vector3().subVectors(this.target, this.position);
            const distance = direction.length();
            
            // Check if reached destination
            if (distance < 2) {
                this.target = null;
                this.velocity.set(0, 0, 0);
            } else {
                direction.normalize();
                this.velocity.copy(direction).multiplyScalar(this.stats.speed * 0.01);
                
                // Rotate to face direction
                const angle = Math.atan2(direction.x, direction.z);
                this.mesh.rotation.y = angle;
            }
        }
        
        // Apply velocity
        this.position.add(this.velocity);
        this.mesh.position.copy(this.position);
        
        // Attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // Attack target if in range
        if (this.targetEntity && this.attackCooldown <= 0) {
            const distance = this.position.distanceTo(this.targetEntity.position);
            if (distance <= this.stats.attackRange) {
                this.attack(this.targetEntity);
            }
        }
        
        // Selection indicator
        if (this.selected) {
            this.mesh.children.forEach(child => {
                if (child.userData.selectionRing) {
                    child.rotation.z += 0.02;
                }
            });
        }
    }
    
    moveTo(targetPos) {
        this.target = targetPos.clone();
        this.targetEntity = null;
    }
    
    attackMove(targetEntity) {
        this.targetEntity = targetEntity;
        if (targetEntity.position) {
            this.target = targetEntity.position.clone();
        }
    }
    
    attack(target) {
        if (target.takeDamage) {
            target.takeDamage(this.stats.damage);
            this.attackCooldown = this.stats.attackSpeed;
            
            // Visual feedback - create projectile
            this.createProjectile(target.position);
        }
    }
    
    createProjectile(targetPos) {
        // Simple visual effect - in a full game, this would be animated
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: this.owner === 'player' ? 0x00ffff : 0xff0000
        });
        const projectile = new THREE.Mesh(geometry, material);
        projectile.position.copy(this.position);
        
        // This should be added to scene and animated
        // For now it's just a visual indicator
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Flash effect
        this.mesh.material.emissiveIntensity = 1;
        setTimeout(() => {
            this.mesh.material.emissiveIntensity = 0.3;
        }, 100);
        
        return this.health <= 0;
    }
    
    setSelected(selected) {
        this.selected = selected;
        
        // Remove existing selection ring
        this.mesh.children = this.mesh.children.filter(child => !child.userData.selectionRing);
        
        if (selected) {
            // Add selection ring
            const ringGeometry = new THREE.RingGeometry(this.stats.size * 2, this.stats.size * 2.5, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            ring.userData.selectionRing = true;
            this.mesh.add(ring);
        }
    }
    
    getInfo() {
        return {
            type: this.type,
            owner: this.owner,
            health: Math.round(this.health),
            maxHealth: this.stats.maxHealth,
            damage: this.stats.damage,
            speed: this.stats.speed
        };
    }
}
