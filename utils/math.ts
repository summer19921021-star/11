import * as THREE from 'three';

// Color Palette: Matte Green, Metallic Gold, Christmas Red
const COLORS = [
  new THREE.Color('#2F5233'), // Matte Dark Green
  new THREE.Color('#4A7045'), // Lighter Matte Green
  new THREE.Color('#FFD700'), // Metallic Gold
  new THREE.Color('#C5A000'), // Darker Gold
  new THREE.Color('#B01B2E'), // Christmas Red
  new THREE.Color('#D4243E'), // Bright Red
];

export const generateTreeParticles = (count: number): { positions: Float32Array; colors: Float32Array; sizes: Float32Array } => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const height = 12;
  const maxRadius = 5;

  for (let i = 0; i < count; i++) {
    // Height from -height/2 to height/2
    const y = (Math.random() * height) - (height / 2);
    
    // Normalized height (0 at bottom, 1 at top) to calculate cone radius
    const normH = (y + height / 2) / height;
    
    // Cone radius at this height (tapers to top)
    // We use Math.pow to give it a slight curve, making it look more organic
    const currentRadius = maxRadius * (1 - normH);

    // Non-hollow: Random point inside the circle at this height
    // r = R * sqrt(random) ensures uniform distribution
    const r = currentRadius * Math.sqrt(Math.random()); 
    const theta = Math.random() * Math.PI * 2;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Color assignment weighted towards Green
    const colorChoice = Math.random();
    let color: THREE.Color;

    if (colorChoice > 0.9) {
      // 10% Gold (Ornaments)
      color = COLORS[2].clone().lerp(COLORS[3], Math.random());
      sizes[i] = Math.random() * 0.4 + 0.3; // Bigger ornaments
    } else if (colorChoice > 0.8) {
      // 10% Red (Berries/Ornaments)
      color = COLORS[4].clone().lerp(COLORS[5], Math.random());
      sizes[i] = Math.random() * 0.3 + 0.2;
    } else {
      // 80% Green (Needles)
      color = COLORS[0].clone().lerp(COLORS[1], Math.random());
      // Slight variation in green brightness based on height for "snowy" tips or depth
      color.offsetHSL(0, 0, (normH * 0.1));
      sizes[i] = Math.random() * 0.15 + 0.05;
    }

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return { positions, colors, sizes };
};
