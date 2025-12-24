import React, { useRef, useState, useEffect } from 'react';
import type { CameraAngle } from '../types';
import { CrosshairIcon } from './icons/Icons';
import { Tooltip } from './common/Tooltip';

interface CameraAngleControlProps {
  angle: CameraAngle;
  setAngle: (angle: CameraAngle) => void;
  isControlledByPrompt: boolean;
  onVisualOverride: () => void; // Called when user starts dragging
  size?: number;
}

export const CameraAngleControl: React.FC<CameraAngleControlProps> = ({
  angle,
  setAngle,
  isControlledByPrompt,
  onVisualOverride,
  size = 120,
}) => {
  const controlRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (isControlledByPrompt) {
      onVisualOverride();
    }
    updateAngleFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updateAngleFromEvent(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updateAngleFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!controlRef.current) return;
    const rect = controlRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates to a -1 to 1 range
    let yaw = (x / size) * 2 - 1;
    let pitch = -((y / size) * 2 - 1); // Invert Y-axis

    // Clamp values to the circle
    const distance = Math.sqrt(yaw * yaw + pitch * pitch);
    if (distance > 1) {
      yaw /= distance;
      pitch /= distance;
    }

    setAngle({ pitch, yaw });
  };
  
  const puckX = (angle.yaw + 1) / 2 * size;
  const puckY = (-angle.pitch + 1) / 2 * size;

  const getAngleDescription = () => {
    const pitchDesc = angle.pitch > 0.7 ? "High Angle" : angle.pitch > 0.2 ? "Slightly High" : angle.pitch < -0.7 ? "Low Angle" : angle.pitch < -0.2 ? "Slightly Low" : "Eye-Level";
    const yawDesc = angle.yaw > 0.7 ? "From Right" : angle.yaw > 0.2 ? "From 3/4 Right" : angle.yaw < -0.7 ? "From Left" : angle.yaw < -0.2 ? "From 3/4 Left" : "Front";
    return `${pitchDesc}, ${yawDesc}`;
  };

  const tooltipText = isControlledByPrompt 
    ? "Sudut diatur oleh prompt. Seret untuk mengambil alih."
    : "Seret untuk mengubah sudut kamera. Atas/Bawah = Pitch, Kiri/Kanan = Yaw/Orbit.";

  return (
    <div className="flex flex-col items-center gap-2">
      <Tooltip text={tooltipText}>
        <div
          ref={controlRef}
          className={`relative rounded-full bg-slate-950/50 border border-slate-700 cursor-pointer touch-none transition-all duration-300 ${isControlledByPrompt ? 'shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-500' : 'shadow-inner'}`}
          style={{ width: size, height: size }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Grid Lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700/50"></div>
          <div className="absolute left-1/2 top-0 h-full w-px bg-slate-700/50"></div>

          {/* Puck */}
          <div
            className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500 border-2 border-slate-900 shadow-lg flex items-center justify-center transition-transform duration-100"
            style={{ top: `${puckY}px`, left: `${puckX}px`, pointerEvents: 'none' }}
          >
            <CrosshairIcon className="w-4 h-4 text-slate-900" />
          </div>
        </div>
      </Tooltip>
      <p className="text-[10px] font-mono text-slate-400 text-center w-full truncate">{getAngleDescription()}</p>
    </div>
  );
};
