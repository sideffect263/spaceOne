import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useGameStore } from '../../../state/gameStore';
import { Vector3, Quaternion } from 'three';

export const CameraControls: React.FC = () => {
  const { camera } = useThree();
  const { playerPosition, playerRotation } = useGameStore();
  const cameraOffset = useRef(new Vector3(0, 3, 12));
  const smoothSpeed = 0.05;
  
  useEffect(() => {
    camera.near = 0.1;
    camera.far = 1000;
    camera.fov = 75;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(() => {
    // Simply follow player rotation directly using quaternions
    const targetPosition = playerPosition.clone();
    const rotatedOffset = cameraOffset.current.clone();
    
    // Apply quaternion rotation directly
    rotatedOffset.applyQuaternion(playerRotation);
    targetPosition.add(rotatedOffset);

    // Update camera position
    camera.position.lerp(targetPosition, smoothSpeed);
    
    // Update camera orientation
    camera.quaternion.slerp(playerRotation, smoothSpeed);
    
    // Ensure camera stays focused on player
    camera.lookAt(playerPosition);
  });

  return null;
};