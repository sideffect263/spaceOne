// src/components/core/Spacecraft/Spacecraft.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Quaternion, Group } from 'three';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls';
import { useGameStore } from '../../../state/gameStore';

export const Spacecraft: React.FC = () => {
  const meshRef = useRef<Group>(null);
  const { 
    playerPosition, 
    playerRotation,
    movementSpeed,
    actions: { updatePlayerPosition, updatePlayerRotation } 
  } = useGameStore();
  
  const { moveForward, moveBackward, turnLeft, turnRight, moveUp, moveDown } = useKeyboardControls();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const movement = new Vector3();
    if (moveForward) movement.z -= 1;
    if (moveBackward) movement.z += 1;
    if (moveUp) movement.y += 1;
    if (moveDown) movement.y -= 1;

    // Apply movement in local space
    movement.applyQuaternion(playerRotation);
    movement.multiplyScalar(movementSpeed * delta);

    // Update position
    const newPosition = playerPosition.clone().add(movement);
    updatePlayerPosition(newPosition);

    // Handle rotation
    if (turnLeft || turnRight) {
      const rotationSpeed = 2 * delta;
      const rotationChange = new Quaternion();
      rotationChange.setFromAxisAngle(
        new Vector3(0, 1, 0),
        (turnLeft ? 1 : -1) * rotationSpeed
      );
      const newRotation = playerRotation.clone().multiply(rotationChange);
      updatePlayerRotation(newRotation);
    }

    // Update mesh
    meshRef.current.position.copy(playerPosition);
    meshRef.current.quaternion.copy(playerRotation);
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      {/* Engine glow */}
      <pointLight color="#00f" intensity={1} position={[0, 0, 1]} distance={2} />
    </group>
  );
};