import React from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { OrbitControls, Sparkles, Stars } from '@react-three/drei';
import Tree from './Tree';
import { HandState } from '../types';

interface ExperienceProps {
  handState: HandState;
}

const Experience: React.FC<ExperienceProps> = ({ handState }) => {
  return (
    <Canvas
      camera={{ position: [0, 2, 18], fov: 45 }}
      gl={{ antialias: false, toneMappingExposure: 1.5 }}
      dpr={[1, 2]} // Optimization for high DPI screens
    >
      <color attach="background" args={['#050505']} />
      
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#B01B2E" />

      {/* The Star of the Tree */}
      <mesh position={[0, 6.2, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <pointLight position={[0, 6.2, 0]} intensity={2} distance={5} color="#FFD700" />

      {/* The Main Tree */}
      <Tree handState={handState} />

      {/* Environment Atmosphere */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#FFD700" />

      {/* Post Processing for Cinematic Look */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      {/* Fallback controls if no camera, or for fine tuning */}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
};

export default Experience;
