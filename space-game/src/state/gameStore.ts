// src/state/gameStore.ts
import {create} from 'zustand';
import { Vector3, Quaternion } from 'three';

interface GameState {
  // Player state
  playerPosition: Vector3;
  playerRotation: Quaternion;
  movementSpeed: number;
  rotationSpeed: number;
  health: number;
  score: number;

  // Game settings
  isSpaceshipView: boolean;
  currentWorld: string;
  isPaused: boolean;

  // Actions
  actions: {
    updatePlayerPosition: (position: Vector3) => void;
    updatePlayerRotation: (rotation: Quaternion) => void;
    setMovementSpeed: (speed: number) => void;
    setRotationSpeed: (speed: number) => void;
    setHealth: (health: number) => void;
    setScore: (score: number) => void;
    setPaused: (paused: boolean) => void;
  };
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerPosition: new Vector3(0, 0, 0),
  playerRotation: new Quaternion(),
  movementSpeed: 10,
  rotationSpeed: 2,
  health: 100,
  score: 0,
  isSpaceshipView: true,
  currentWorld: 'default',
  isPaused: false,

  // Actions
  actions: {
    updatePlayerPosition: (position: Vector3) => 
      set(() => ({ playerPosition: position })),

    updatePlayerRotation: (rotation: Quaternion) => 
      set(() => ({ playerRotation: rotation })),

    setMovementSpeed: (speed: number) => 
      set(() => ({ movementSpeed: speed })),

    setRotationSpeed: (speed: number) => 
      set(() => ({ rotationSpeed: speed })),

    setHealth: (health: number) => 
      set(() => ({ health })),

    setScore: (score: number) => 
      set(() => ({ score })),

    setPaused: (paused: boolean) => 
      set(() => ({ isPaused: paused })),
  },
}));