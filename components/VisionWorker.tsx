import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { GestureType, HandState } from '../types';

interface VisionWorkerProps {
  onHandUpdate: (state: HandState) => void;
}

const VisionWorker: React.FC<VisionWorkerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastVideoTime = useRef(-1);
  const requestRef = useRef<number>();

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });

        // Start Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load camera or model.");
        setLoading(false);
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current) return;

      const video = videoRef.current;
      if (video.currentTime !== lastVideoTime.current) {
        lastVideoTime.current = video.currentTime;
        const result = handLandmarker.detectForVideo(video, performance.now());

        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          processLandmarks(landmarks);
        } else {
           // No hand detected - revert to IDLE
           onHandUpdate({
             gesture: GestureType.IDLE,
             position: { x: 0, y: 0, z: 0 },
             rotation: 0,
             pinchDistance: 0
           });
        }
      }
      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    const processLandmarks = (landmarks: any[]) => {
      // 0: Wrist
      // 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
      
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      // Calculate openness (Average distance from wrist to tips)
      const tips = [indexTip, middleTip, ringTip, pinkyTip];
      let avgDist = 0;
      tips.forEach(tip => {
        const d = Math.sqrt(
          Math.pow(tip.x - wrist.x, 2) + 
          Math.pow(tip.y - wrist.y, 2)
        );
        avgDist += d;
      });
      avgDist /= 4;

      // Pinch Distance (Thumb to Index)
      const pinchDist = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + 
        Math.pow(thumbTip.y - indexTip.y, 2)
      );

      // Gesture Classification
      let gesture = GestureType.IDLE;
      
      // Thresholds are empirical and might need tuning based on camera FOV
      if (pinchDist < 0.05) {
        gesture = GestureType.PINCH;
      } else if (avgDist < 0.25) { // Compact hand
        gesture = GestureType.FIST;
      } else if (avgDist > 0.4) { // Extended fingers
        gesture = GestureType.OPEN_PALM;
      }

      // X position for rotation (0.5 is center, invert for intuitive mirror feel)
      // We map 0..1 to -1..1
      const xPos = (wrist.x - 0.5) * -2; 
      const yPos = (wrist.y - 0.5) * -2; 

      onHandUpdate({
        gesture,
        position: { x: xPos, y: yPos, z: 0 },
        rotation: xPos, // Rotation speed matches x position
        pinchDistance: pinchDist
      });
    };

    setupMediaPipe();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      handLandmarker?.close();
    };
  }, [onHandUpdate]);

  return (
    <div className="absolute top-4 right-4 w-32 h-24 bg-black/50 border border-white/20 rounded-lg overflow-hidden z-50 transition-opacity duration-500">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover opacity-80 scale-x-[-1]"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-white">
          Loading AI...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400 bg-black">
          Camera Error
        </div>
      )}
    </div>
  );
};

export default VisionWorker;
