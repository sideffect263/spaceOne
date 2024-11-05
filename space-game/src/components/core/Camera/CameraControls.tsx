// src/components/core/Camera/CameraControls.tsx
import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../state/gameStore';
import { Vector3 } from 'three';

export const CameraControls: React.FC = () => {
  const { camera } = useThree();
  const { playerPosition, playerRotation, isSpaceshipView } = useGameStore();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 10, 20);
    camera.lookAt(0, 0, 0);
  }, []);

  useFrame(() => {
    if (isSpaceshipView) {
      // Calculate camera offset in local space
      const offset = new Vector3(0, 3, 10);
      offset.applyQuaternion(playerRotation);
      
      // Set camera position and rotation
      camera.position.copy(playerPosition).add(offset);
      camera.lookAt(playerPosition);
    }
  });

  return null;

   };