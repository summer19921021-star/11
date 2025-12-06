import React from 'react';
import { GestureType, HandState } from '../types';

interface UIProps {
  handState: HandState;
}

const UI: React.FC<UIProps> = ({ handState }) => {
  
  const getStatusText = (gesture: GestureType) => {
    switch (gesture) {
      case GestureType.FIST: return "CONVERGE";
      case GestureType.OPEN_PALM: return "SCATTER";
      case GestureType.PINCH: return "ZOOM";
      default: return "IDLE";
    }
  };

  const activeColor = (match: GestureType) => 
    handState.gesture === match ? "text-yellow-400 font-bold scale-110" : "text-white/50";

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-red-500 font-[Cinzel] tracking-widest drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          NOEL
        </h1>
        <p className="text-white/70 text-sm tracking-[0.3em] mt-2 font-[Inter] uppercase">
          Interactive Particle Cloud
        </p>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300">
         <div className={`text-6xl font-bold tracking-widest transition-all duration-500 ${handState.gesture !== GestureType.IDLE ? 'opacity-20 blur-sm scale-150 text-white' : 'opacity-0'}`}>
            {getStatusText(handState.gesture)}
         </div>
      </div>

      {/* Instructions */}
      <div className="flex flex-row justify-center gap-8 md:gap-16 text-xs md:text-sm font-[Inter] bg-black/30 backdrop-blur-md p-4 rounded-full border border-white/10">
        <div className={`flex flex-col items-center transition-all ${activeColor(GestureType.FIST)}`}>
          <span className="text-lg mb-1">✊</span>
          <span>CLOSE TO FORM</span>
        </div>
        <div className={`flex flex-col items-center transition-all ${activeColor(GestureType.OPEN_PALM)}`}>
          <span className="text-lg mb-1">🖐️</span>
          <span>OPEN TO SCATTER</span>
        </div>
        <div className={`flex flex-col items-center transition-all ${activeColor(GestureType.PINCH)}`}>
          <span className="text-lg mb-1">👌</span>
          <span>PINCH TO ZOOM</span>
        </div>
        <div className={`flex flex-col items-center transition-all ${handState.rotation !== 0 && handState.gesture !== GestureType.IDLE ? "text-yellow-400" : "text-white/50"}`}>
          <span className="text-lg mb-1">↔️</span>
          <span>MOVE TO ROTATE</span>
        </div>
      </div>
    </div>
  );
};

export default UI;
