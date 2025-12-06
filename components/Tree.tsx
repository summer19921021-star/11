import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateTreeParticles } from '../utils/math';
import { GestureType, HandState } from '../types';

interface TreeProps {
  handState: HandState;
}

const Tree: React.FC<TreeProps> = ({ handState }) => {
  const count = 5000;
  const mesh = useRef<THREE.Points>(null);
  
  // Generating initial data once
  const { positions, colors, sizes } = useMemo(() => generateTreeParticles(count), []);
  const originalPositions = useMemo(() => new Float32Array(positions), [positions]);
  
  // Animation state targets
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const targetExpansion = useRef(0); // 0 = tree, 1 = exploded
  const currentExpansion = useRef(0);
  const rotationSpeed = useRef(0);

  // Helper for random noise in exploded state
  const noise = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for(let i=0; i<count*3; i++) arr[i] = (Math.random() - 0.5) * 15;
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    // 1. Determine Targets based on Gesture
    const damping = 4 * delta; // Smooth transition speed

    switch (handState.gesture) {
      case GestureType.FIST:
        targetExpansion.current = 0; // Converge
        targetScale.current = 1;
        break;
      case GestureType.OPEN_PALM:
        targetExpansion.current = 1; // Explode
        targetScale.current = 1;
        break;
      case GestureType.PINCH:
        targetExpansion.current = 0;
        targetScale.current = 1.8; // Zoom in
        break;
      case GestureType.IDLE:
      default:
        // Slow return to normal
        targetExpansion.current = 0; 
        targetScale.current = 1;
        break;
    }

    // 2. Interpolate State values
    currentExpansion.current = THREE.MathUtils.lerp(currentExpansion.current, targetExpansion.current, damping);
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, damping);
    
    // Rotation logic (Hand X drives rotation speed)
    // If idle, slow auto rotation. If hand active, faster rotation based on X.
    let targetRotSpeed = 0.1; // Default slow spin
    if (handState.gesture !== GestureType.IDLE) {
       targetRotSpeed = handState.rotation * 2.0; 
    }
    rotationSpeed.current = THREE.MathUtils.lerp(rotationSpeed.current, targetRotSpeed, damping);
    mesh.current.rotation.y += rotationSpeed.current * delta;


    // 3. Update Particles
    const posAttribute = mesh.current.geometry.attributes.position;
    
    // We only update positions if we are in transition or exploded state to save perf
    // However, for the smooth "breathing" or "explosion" effect, we update per frame.
    
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Base Position (Tree Shape)
      const ox = originalPositions[ix];
      const oy = originalPositions[iy];
      const oz = originalPositions[iz];

      // Exploded Position (Base + Noise)
      // We expand outwards from center (0,0,0) plus random noise
      const nx = ox + noise[ix];
      const ny = oy + noise[iy];
      const nz = oz + noise[iz];

      // Interpolate based on expansion factor
      let x = THREE.MathUtils.lerp(ox, nx, currentExpansion.current);
      let y = THREE.MathUtils.lerp(oy, ny, currentExpansion.current);
      let z = THREE.MathUtils.lerp(oz, nz, currentExpansion.current);

      // Apply Scale (Zoom)
      // We scale the positions themselves rather than the mesh scale to keep particle size distinct if needed, 
      // but mesh.scale is cheaper. Here we modify geometry to allow for cool warping effects if desired later.
      // For simplicity and performance, let's use the mesh scale for the "Zoom" 
      // but here we might add a "breathing" effect to y.
      
      // Add a subtle float/sparkle movement
      const time = state.clock.elapsedTime;
      y += Math.sin(time * 2 + x) * 0.05; 

      posAttribute.setXYZ(i, x, y, z);
    }
    
    posAttribute.needsUpdate = true;
    
    // Apply global scale
    mesh.current.scale.setScalar(currentScale.current);
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export default Tree;
