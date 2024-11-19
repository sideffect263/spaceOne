// src/systems/physics/SpatialHashGrid.ts

import { Vector3 } from 'three';
import { PhysicsObject } from './PhysicsEngine';

interface GridCell {
  objects: Set<PhysicsObject>;
}

export class SpatialHashGrid {
  private cells: Map<string, GridCell>;
  private cellSize: number;

  constructor(cellSize: number) {
    this.cells = new Map();
    this.cellSize = cellSize;
  }

  private getCellKey(position: Vector3): string {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);
    const z = Math.floor(position.z / this.cellSize);
    return `${x},${y},${z}`;
  }

  private getNeighboringCellKeys(position: Vector3): string[] {
    const centerX = Math.floor(position.x / this.cellSize);
    const centerY = Math.floor(position.y / this.cellSize);
    const centerZ = Math.floor(position.z / this.cellSize);
    const keys: string[] = [];

    // Check all 27 neighboring cells (including current cell)
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          keys.push(`${centerX + x},${centerY + y},${centerZ + z}`);
        }
      }
    }

    return keys;
  }

  public insertObject(obj: PhysicsObject): void {
    const cellKey = this.getCellKey(obj.position);
    
    if (!this.cells.has(cellKey)) {
      this.cells.set(cellKey, { objects: new Set() });
    }
    
    this.cells.get(cellKey)!.objects.add(obj);
  }

  public removeObject(obj: PhysicsObject): void {
    const cellKey = this.getCellKey(obj.position);
    const cell = this.cells.get(cellKey);
    
    if (cell) {
      cell.objects.delete(obj);
      if (cell.objects.size === 0) {
        this.cells.delete(cellKey);
      }
    }
  }

  public updateObject(obj: PhysicsObject, oldPosition: Vector3): void {
    const oldCellKey = this.getCellKey(oldPosition);
    const newCellKey = this.getCellKey(obj.position);

    if (oldCellKey !== newCellKey) {
      const oldCell = this.cells.get(oldCellKey);
      if (oldCell) {
        oldCell.objects.delete(obj);
        if (oldCell.objects.size === 0) {
          this.cells.delete(oldCellKey);
        }
      }

      this.insertObject(obj);
    }
  }

  public getNearbyObjects(obj: PhysicsObject): PhysicsObject[] {
    const neighboringKeys = this.getNeighboringCellKeys(obj.position);
    const nearbyObjects = new Set<PhysicsObject>();

    for (const key of neighboringKeys) {
      const cell = this.cells.get(key);
      if (cell) {
        cell.objects.forEach(object => {
          if (object !== obj) {
            nearbyObjects.add(object);
          }
        });
      }
    }

    return Array.from(nearbyObjects);
  }

  public clear(): void {
    this.cells.clear();
  }

  public getCell(position: Vector3): GridCell | undefined {
    return this.cells.get(this.getCellKey(position));
  }

  public getAllObjects(): PhysicsObject[] {
    const objects = new Set<PhysicsObject>();
    this.cells.forEach(cell => {
      cell.objects.forEach(obj => objects.add(obj));
    });
    return Array.from(objects);
  }

  public getCellCount(): number {
    return this.cells.size;
  }

  public getObjectCount(): number {
    let count = 0;
    this.cells.forEach(cell => {
      count += cell.objects.size;
    });
    return count;
  }

  public getCellSize(): number {
    return this.cellSize;
  }

  public getDebugInfo(): { cellCount: number; objectCount: number; cellSize: number } {
    return {
      cellCount: this.getCellCount(),
      objectCount: this.getObjectCount(),
      cellSize: this.cellSize
    };
  }
}