// src/components/core/Environment/Environment.tsx
import React from 'react';
import { Stars } from '@react-three/drei';
import { useGameStore } from '../../../state/gameStore';

export const Environment: React.FC = () => {
  const { currentWorld } = useGameStore();

  return (
    <>
      <ambientLight intensity={0.1} />
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} />
      {/* Add more environment elements based on currentWorld */}
    </>
  );
};