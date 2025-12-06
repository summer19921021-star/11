export enum GestureType {
  IDLE = 'IDLE',
  FIST = 'FIST',       // Converge/Tree form
  OPEN_PALM = 'OPEN',  // Explode/Scatter
  PINCH = 'PINCH',     // Zoom/Scale
}

export interface HandState {
  gesture: GestureType;
  position: { x: number; y: number; z: number }; // Normalized -1 to 1
  rotation: number; // Normalized rotation influence
  pinchDistance: number;
}

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  originalPositions: Float32Array;
}
