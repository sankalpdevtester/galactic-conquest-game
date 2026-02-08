import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

export class StarField {
    constructor(count = 3000) {
        this.count = count;
        this.mesh = this.createStarField();
    }
    
    createStarField() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        // Create stars distributed in a sphere
        for (let i = 0; i < this.count; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            
            positions.push(x, y, z);
            
            // Random star colors (white, blue, yellow, red)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors.push(1, 1, 1); // White
            } else if (colorChoice < 0.85) {
                colors.push(0.7, 0.8, 1); // Blue
            } else if (colorChoice < 0.95) {
                colors.push(1, 1, 0.7); // Yellow
            } else {
                colors.push(1, 0.7, 0.7); // Red
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(geometry, material);
    }
    
    update() {
        // Slowly rotate starfield for dynamic effect
        this.mesh.rotation.y += 0.00005;
    }
    
    getMesh() {
        return this.mesh;
    }
}
