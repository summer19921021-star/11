import React, { useState, useCallback } from 'react';
import Experience from './components/Experience';
import VisionWorker from './components/VisionWorker';
import UI from './components/UI';
import { GestureType, HandState } from './types';

const App: React.FC = () => {
  const [handState, setHandState] = useState<HandState>({
    gesture: GestureType.IDLE,
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    pinchDistance: 0,
  });

  const handleHandUpdate = useCallback((newState: HandState) => {
    setHandState(prev => {
      // Simple noise reduction: if values haven't changed much, don't update state to prevent re-renders
      // However, R3F handles high freq updates well if passed via props.
      return newState;
    });
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Experience handState={handState} />
      </div>

      {/* Overlay UI */}
      <UI handState={handState} />

      {/* Computer Vision (Invisible Logic / Camera Preview) */}
      <VisionWorker onHandUpdate={handleHandUpdate} />
      
      {/* Vignette Overlay for extra film look */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-20" />
    </div>
  );
};

export default App;
