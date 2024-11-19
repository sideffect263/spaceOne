// src/components/debug/ChunkVisualization.tsx
import React from 'react';
import { Vector3, LineSegments, BufferGeometry, Float32BufferAttribute, LineBasicMaterial } from 'three';
import { Text } from '@react-three/drei';

interface ChunkVisualizerProps {
  chunkSize: number;
  position: Vector3;
  showGrid?: boolean;
  showLabel?: boolean;
}

export const ChunkVisualizer: React.FC<ChunkVisualizerProps> = ({
  chunkSize,
  position,
  showGrid = true,
  showLabel = true,
}) => {
  // Create vertices for the cube edges
  const vertices = new Float32Array([
    // Bottom face
    0, 0, 0,   chunkSize, 0, 0,
    chunkSize, 0, 0,   chunkSize, 0, chunkSize,
    chunkSize, 0, chunkSize,   0, 0, chunkSize,
    0, 0, chunkSize,   0, 0, 0,
    // Top face
    0, chunkSize, 0,   chunkSize, chunkSize, 0,
    chunkSize, chunkSize, 0,   chunkSize, chunkSize, chunkSize,
    chunkSize, chunkSize, chunkSize,   0, chunkSize, chunkSize,
    0, chunkSize, chunkSize,   0, chunkSize, 0,
    // Vertical edges
    0, 0, 0,   0, chunkSize, 0,
    chunkSize, 0, 0,   chunkSize, chunkSize, 0,
    chunkSize, 0, chunkSize,   chunkSize, chunkSize, chunkSize,
    0, 0, chunkSize,   0, chunkSize, chunkSize,
  ]);

  // Create geometry
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));

  const chunkId = `${Math.floor(position.x / chunkSize)},${Math.floor(position.y / chunkSize)},${Math.floor(position.z / chunkSize)}`;

  return (
    <group position={position}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="white" />
      </lineSegments>
      
      {showLabel && (
        <Text
          position={[chunkSize / 2, chunkSize / 2, chunkSize / 2]}
          fontSize={50}
          color="white"
        >
          {chunkId}
        </Text>
      )}
    </group>
  );
};