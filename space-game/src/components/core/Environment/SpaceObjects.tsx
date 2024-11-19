// src/components/environment/SpaceObjects.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Mesh } from 'three';
import { useGLTF } from '@react-three/drei';

interface SpaceObjectProps {
  position: Vector3;
  scale: Vector3;
  rotation?: Vector3;
}

export const Asteroid: React.FC<SpaceObjectProps> = ({ position, scale, rotation }) => {
  const meshRef = useRef<Mesh>(null);

  // Simple rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial 
        color="#666666" 
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

export const SpaceStation: React.FC<SpaceObjectProps> = ({ position, scale }) => {
  return (
    <group position={position} scale={scale}>
      {/* Core structure */}
      <mesh>
        <boxGeometry args={[1, 0.3, 0.3]} />
        <meshStandardMaterial color="#444444" metalness={0.8} />
      </mesh>
      {/* Solar panels */}
      <mesh position={[0, 0, 0.8]}>
        <boxGeometry args={[2, 0.05, 0.5]} />
        <meshStandardMaterial color="#1E90FF" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, -0.8]}>
        <boxGeometry args={[2, 0.05, 0.5]} />
        <meshStandardMaterial color="#1E90FF" metalness={0.5} />
      </mesh>
      {/* Station lights */}
      <pointLight color="#FFD700" intensity={0.5} distance={5} />
    </group>
  );
};

export const SpaceDebris: React.FC<SpaceObjectProps> = ({ position, scale }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.z += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <tetrahedronGeometry args={[1]} />
      <meshStandardMaterial color="#444444" roughness={1} />
    </mesh>
  );
};