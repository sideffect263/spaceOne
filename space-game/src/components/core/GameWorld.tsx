// src/components/core/GameWorld.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Group } from 'three';
import { useGameStore } from '../../state/gameStore';
import { CameraControls } from './Camera/CameraControls';
import { Spacecraft } from './Spacecraft/Spacecraft';
import { Environment } from './Environment/Environment';
import { PhysicsEngine } from '../../systems/physics/PhysicsEngine';
import { CollisionSystem } from '../../systems/physics/CollisionSystem';
import { ChunkManager } from '../../systems/world/ChunkManager';
import { ChunkVisualizer } from '../debug/ChunkVisualization';
import { Asteroid, SpaceStation, SpaceDebris } from './Environment/SpaceObjects';

interface SpaceObject {
  id: string;
  type: 'asteroid' | 'station' | 'debris' | 'resource';
  position: Vector3;
  scale: Vector3;
  mass: number;
}

export const GameWorld: React.FC = () => {
  const { scene } = useThree();
  const {
    playerPosition,
    playerRotation,
  } = useGameStore();
  
  const worldRef = useRef<Group>(null);
  const physicsEngine = useRef(PhysicsEngine.getInstance());
  const collisionSystem = useRef(CollisionSystem.getInstance());
  const chunkManager = useRef(ChunkManager.getInstance());
  
  // State to track currently visible space objects
  const [visibleObjects, setVisibleObjects] = useState<SpaceObject[]>([]);
  const [debugMode, setDebugMode] = useState(true); // Toggle with key press

  useEffect(() => {
    scene.background = null;

    // Setup debug mode toggle
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'F3') {
        setDebugMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      physicsEngine.current.clear();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [scene]);

  useFrame((state, delta) => {
    // Update physics
    physicsEngine.current.update(delta);
    
    // Update chunk system
    chunkManager.current.update(playerPosition);
    
    // Get all loaded chunks
    const loadedChunks = chunkManager.current.getLoadedChunks();
    
    // Update visible objects based on loaded chunks
    const newVisibleObjects = loadedChunks.flatMap(chunk => 
      Array.from(chunk.objects.values())
    );
    
    setVisibleObjects(newVisibleObjects);

    // Check collisions
    const collisions = collisionSystem.current.update(
      new Map([[playerPosition.toArray().join(','), {
        position: playerPosition,
        rotation: playerRotation,
        velocity: new Vector3(),
        acceleration: new Vector3(),
        mass: 1,
        id: 'player',
        isStatic: false
      }]])
    );

    collisions.forEach(collision => {
      console.log('Collision detected:', collision);
    });
  });

  const renderSpaceObject = (obj: SpaceObject) => {
    switch (obj.type) {
      case 'asteroid':
        return <Asteroid key={obj.id} position={obj.position} scale={obj.scale} />;
      case 'station':
        return <SpaceStation key={obj.id} position={obj.position} scale={obj.scale} />;
      case 'debris':
        return <SpaceDebris key={obj.id} position={obj.position} scale={obj.scale} />;
      default:
        return null;
    }
  };

  return (
    <>
      <CameraControls />
      <Environment />
      <Spacecraft />
      
      {/* Render space objects */}
      {visibleObjects.map(renderSpaceObject)}
      
      {/* Debug visualization */}
      {debugMode && chunkManager.current.getLoadedChunks().map(chunk => (
        <ChunkVisualizer
          key={chunk.id}
          chunkSize={1000}
          position={chunk.position}
          showGrid={true}
          showLabel={true}
        />
      ))}
      
      <gridHelper args={[1000, 100]} />
      <axesHelper scale={5} />
    </>
  );
};