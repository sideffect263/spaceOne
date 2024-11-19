import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Quaternion, Group } from 'three';
import { useGameStore } from '../../state/gameStore';
import { CameraControls } from './Camera/CameraControls';
import { Spacecraft } from './Spacecraft/Spacecraft';
import { Environment } from './Environment/Environment';
import { PhysicsEngine } from '../../systems/physics/PhysicsEngine';
import { CollisionSystem } from '../../systems/physics/CollisionSystem';

export const GameWorld: React.FC = () => {
 const { scene } = useThree();
 const {
   playerPosition,
   playerRotation,
 } = useGameStore();
 
 const worldRef = useRef<Group>(null);
 const physicsEngine = useRef(PhysicsEngine.getInstance());
 const collisionSystem = useRef(CollisionSystem.getInstance());

 useEffect(() => {
   scene.background = null;
   return () => {
     physicsEngine.current.clear();
   };
 }, [scene]);

 const updatePhysics = (delta: number) => {
   physicsEngine.current.update(delta);
   
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
 };

 useFrame((state, delta) => {
   updatePhysics(delta);
 });

 return (
   <>
     <CameraControls />
     <Environment />
     <Spacecraft />
     <gridHelper args={[1000, 100]} />
     <axesHelper scale={5} />
   </>
 );
};