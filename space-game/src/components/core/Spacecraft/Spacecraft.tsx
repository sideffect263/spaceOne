import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Quaternion, Group } from 'three';
import { useKeyboardControls } from '../../../hooks/useKeyboardControls';
import { useGameStore } from '../../../state/gameStore';

export const Spacecraft: React.FC = () => {
  const meshRef = useRef<Group>(null);
  const prevPosition = useRef(new Vector3());
  const prevRotation = useRef(new Quaternion());
  
  // Track accumulated rotation angles
  const rotationAngles = useRef({ pitch: 0, yaw: 0 });

  const {
    playerPosition,
    playerRotation,
    movementSpeed = 10,
    rotationSpeed = 1,
    actions: { updatePlayerPosition, updatePlayerRotation },
  } = useGameStore();

  const controls = useKeyboardControls();
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    prevPosition.current.copy(playerPosition);
    prevRotation.current.copy(playerRotation);
    
    // Handle movement
    const movement = new Vector3();
    if (controls.moveForward) movement.z -= 1;
    if (controls.moveBackward) movement.z += 1;
    if (controls.moveLeft) movement.x -= 1;
    if (controls.moveRight) movement.x += 1;
    if (controls.moveUp) movement.y += 1;
    if (controls.moveDown) movement.y -= 1;
    
    if (movement.lengthSq() > 0) {
      movement.normalize();
      movement.applyQuaternion(playerRotation);
      movement.multiplyScalar(movementSpeed * delta);
      
      const newPosition = playerPosition.clone().add(movement);
      updatePlayerPosition(newPosition);
    }
    
    // Handle rotation
    let rotationChanged = false;
    
    // Update accumulated angles
    if (controls.lookUp) {
      rotationAngles.current.pitch += rotationSpeed * delta;
      rotationChanged = true;
    }
    if (controls.lookDown) {
      rotationAngles.current.pitch -= rotationSpeed * delta;
      rotationChanged = true;
    }
    if (controls.lookLeft) {
      rotationAngles.current.yaw += rotationSpeed * delta;
      rotationChanged = true;
    }
    if (controls.lookRight) {
      rotationAngles.current.yaw -= rotationSpeed * delta;
      rotationChanged = true;
    }
    
    if (rotationChanged) {
      // Create rotation quaternions
      const pitchQ = new Quaternion().setFromAxisAngle(
        new Vector3(1, 0, 0), 
        rotationAngles.current.pitch
      );
      const yawQ = new Quaternion().setFromAxisAngle(
        new Vector3(0, 1, 0),
        rotationAngles.current.yaw
      );
      
      // Combine rotations
      const newRotation = yawQ.multiply(pitchQ);
      updatePlayerRotation(newRotation);
    }
    
    // Smooth mesh updates
    meshRef.current.position.lerp(playerPosition, 0.3);
    meshRef.current.quaternion.slerp(playerRotation, 0.3);
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 0.5, 2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.8, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 1]} />
        <meshStandardMaterial color="#6a6a6a" />
      </mesh>
      <mesh position={[-0.8, 0, 0]}>
        <boxGeometry args={[0.8, 0.1, 1]} />
        <meshStandardMaterial color="#6a6a6a" />
      </mesh>
      <pointLight color="#00f" intensity={1} position={[0, 0, 1]} distance={2} />
    </group>
  );
};