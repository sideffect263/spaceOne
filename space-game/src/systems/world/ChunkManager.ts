// src/systems/world/ChunkManager.ts
import { Vector3, Quaternion } from 'three';
import { ObjectPool } from './ObjectPool';
import { PhysicsEngine, PhysicsObject } from '../physics/PhysicsEngine';

interface Chunk {
  id: string;
  position: Vector3;
  objects: Set<string>; // Object IDs in this chunk
  isLoaded: boolean;
}

interface SpaceObject {
  id: string;
  type: 'asteroid' | 'station' | 'debris' | 'resource';
  position: Vector3;
  scale: Vector3;
  mass: number;
}

// Simple deterministic random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Create a numeric seed from string
    this.seed = Array.from(seed).reduce(
      (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
    );
  }

  // Returns a number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns a number between min and max
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }
}

export class ChunkManager {
  private static instance: ChunkManager;
  private chunks: Map<string, Chunk>;
  private chunkSize: number;
  private loadDistance: number;
  private objectPool: ObjectPool<any>;
  private physicsEngine: PhysicsEngine;

  private constructor() {
    this.chunks = new Map();
    this.chunkSize = 1000; // Size of each cubic chunk
    this.loadDistance = 3000; // Distance at which chunks are loaded
    this.objectPool = ObjectPool.getInstance();
    this.physicsEngine = PhysicsEngine.getInstance();
  }

  public static getInstance(): ChunkManager {
    if (!ChunkManager.instance) {
      ChunkManager.instance = new ChunkManager();
    }
    return ChunkManager.instance;
  }

  private getChunkKey(position: Vector3): string {
    const x = Math.floor(position.x / this.chunkSize);
    const y = Math.floor(position.y / this.chunkSize);
    const z = Math.floor(position.z / this.chunkSize);
    return `${x},${y},${z}`;
  }

  private generateChunkContent(chunk: Chunk): SpaceObject[] {
    const objects: SpaceObject[] = [];
    const random = new SeededRandom(chunk.id);

    // Generate asteroids
    const asteroidCount = Math.floor(random.range(5, 15));
    for (let i = 0; i < asteroidCount; i++) {
      const position = new Vector3(
        chunk.position.x + (random.next() - 0.5) * this.chunkSize,
        chunk.position.y + (random.next() - 0.5) * this.chunkSize,
        chunk.position.z + (random.next() - 0.5) * this.chunkSize
      );

      objects.push({
        id: `asteroid-${chunk.id}-${i}`,
        type: 'asteroid',
        position,
        scale: new Vector3(
          random.range(50, 150),
          random.range(50, 150),
          random.range(50, 150)
        ),
        mass: random.range(500, 1500)
      });
    }

    // Occasionally generate a space station (10% chance)
    if (random.next() < 0.1) {
      objects.push({
        id: `station-${chunk.id}`,
        type: 'station',
        position: new Vector3(
          chunk.position.x + (random.next() - 0.5) * this.chunkSize * 0.5,
          chunk.position.y + (random.next() - 0.5) * this.chunkSize * 0.5,
          chunk.position.z + (random.next() - 0.5) * this.chunkSize * 0.5
        ),
        scale: new Vector3(200, 200, 200),
        mass: 5000
      });
    }

    // Add some debris
    const debrisCount = Math.floor(random.range(2, 8));
    for (let i = 0; i < debrisCount; i++) {
      objects.push({
        id: `debris-${chunk.id}-${i}`,
        type: 'debris',
        position: new Vector3(
          chunk.position.x + (random.next() - 0.5) * this.chunkSize,
          chunk.position.y + (random.next() - 0.5) * this.chunkSize,
          chunk.position.z + (random.next() - 0.5) * this.chunkSize
        ),
        scale: new Vector3(
          random.range(10, 30),
          random.range(10, 30),
          random.range(10, 30)
        ),
        mass: random.range(100, 300)
      });
    }

    return objects;
  }

  public update(playerPosition: Vector3): void {
    // Get nearby chunk keys
    const currentChunkKey = this.getChunkKey(playerPosition);
    const nearbyChunks = new Set<string>();
    
    // Calculate nearby chunks in a cube around the player
    const radius = Math.ceil(this.loadDistance / this.chunkSize);
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        for (let z = -radius; z <= radius; z++) {
          const position = new Vector3(
            Math.floor(playerPosition.x / this.chunkSize) + x,
            Math.floor(playerPosition.y / this.chunkSize) + y,
            Math.floor(playerPosition.z / this.chunkSize) + z
          );
          nearbyChunks.add(this.getChunkKey(position));
        }
      }
    }

    // Load new chunks
    nearbyChunks.forEach(chunkKey => {
      if (!this.chunks.has(chunkKey)) {
        const position = new Vector3(
          parseInt(chunkKey.split(',')[0]) * this.chunkSize,
          parseInt(chunkKey.split(',')[1]) * this.chunkSize,
          parseInt(chunkKey.split(',')[2]) * this.chunkSize
        );

        const chunk: Chunk = {
          id: chunkKey,
          position,
          objects: new Set(),
          isLoaded: false
        };

        // Generate and add objects
        const spaceObjects = this.generateChunkContent(chunk);
        spaceObjects.forEach(obj => {
          chunk.objects.add(obj.id);
          
          // Add to physics engine
          const physObj: PhysicsObject = {
            id: obj.id,
            position: obj.position,
            velocity: new Vector3(),
            acceleration: new Vector3(),
            rotation: new Quaternion(),
            mass: obj.mass,
            isStatic: obj.type === 'station',
          };
          
          this.physicsEngine.addObject(physObj);
        });

        chunk.isLoaded = true;
        this.chunks.set(chunkKey, chunk);
      }
    });

    // Unload distant chunks
    this.chunks.forEach((chunk, key) => {
      if (!nearbyChunks.has(key)) {
        chunk.objects.forEach(objId => {
          this.physicsEngine.removeObject(objId);
        });
        this.chunks.delete(key);
      }
    });
  }

  public getLoadedChunks(): Chunk[] {
    return Array.from(this.chunks.values());
  }

  public getNearbyObjects(position: Vector3, radius: number): string[] {
    const nearbyObjects = new Set<string>();
    const chunkKey = this.getChunkKey(position);
    const chunk = this.chunks.get(chunkKey);

    if (chunk) {
      chunk.objects.forEach(objId => {
        const obj = this.physicsEngine.getObject(objId);
        if (obj && obj.position.distanceTo(position) <= radius) {
          nearbyObjects.add(objId);
        }
      });
    }

    return Array.from(nearbyObjects);
  }
}