// src/state/gameStore.ts
import {create} from 'zustand';
import { Vector3, Quaternion } from 'three';

interface GameState {
  // Player state
  playerPosition: Vector3;
  playerRotation: Quaternion;
  health: number;
  score: number;
  movementSpeed: number;
  rotationSpeed: number;

  // Game settings
  isSpaceshipView: boolean;
  currentWorld: string;
  isPaused: boolean;

  // Multiplayer state
  connectedPlayers: Map<string, {
    position: Vector3;
    rotation: Quaternion;
    health: number;
    name: string;
  }>;

  // Actions
  actions: {
    updatePlayerPosition: (position: Vector3) => void;
    updatePlayerRotation: (rotation: Quaternion) => void;
    setHealth: (health: number) => void;
    setScore: (score: number) => void;
    toggleView: () => void;
    setMovementSpeed: (speed: number) => void;
    setRotationSpeed: (speed: number) => void;
    setPaused: (paused: boolean) => void;
    updatePlayerState: (playerId: string, state: {
      position: Vector3;
      rotation: Quaternion;
      health: number;
      name: string;
    }) => void;
    removePlayer: (playerId: string) => void;
  };
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  playerPosition: new Vector3(0, 0, 0),
  playerRotation: new Quaternion(),
  health: 100,
  score: 0,
  movementSpeed: 10,
  rotationSpeed: 2,
  isSpaceshipView: true,
  currentWorld: 'World 1',
  isPaused: false,
  connectedPlayers: new Map(),

  // Actions
  actions: {
    updatePlayerPosition: (position: Vector3) => 
      set(() => ({ playerPosition: position })),

    updatePlayerRotation: (rotation: Quaternion) => 
      set(() => ({ playerRotation: rotation })),

    setHealth: (health: number) => 
      set(() => ({ health })),

    setScore: (score: number) => 
      set(() => ({ score })),

    toggleView: () => 
      set((state: GameState) => ({ isSpaceshipView: !state.isSpaceshipView })),

    setMovementSpeed: (speed: number) => 
      set(() => ({ movementSpeed: speed })),

    setRotationSpeed: (speed: number) => 
      set(() => ({ rotationSpeed: speed })),

    setPaused: (paused: boolean) => 
      set(() => ({ isPaused: paused })),

    updatePlayerState: (playerId: string, state: {
      position: Vector3;
      rotation: Quaternion;
      health: number;
      name: string;
    }) =>
      set((gameState: GameState) => {
        const newPlayers = new Map(gameState.connectedPlayers);
        newPlayers.set(playerId, state);
        return { connectedPlayers: newPlayers };
      }),

    removePlayer: (playerId: string) =>
      set((gameState: GameState) => {
        const newPlayers = new Map(gameState.connectedPlayers);
        newPlayers.delete(playerId);
        return { connectedPlayers: newPlayers };
      }),
  },
}));