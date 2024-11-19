// src/systems/physics/PhysicsEngine.ts

import { Vector3, Quaternion, Box3, Sphere } from 'three';
import { ObjectPool } from '../world/ObjectPool';

export interface PhysicsObject {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  rotation: Quaternion;
  mass: number;
  boundingBox?: Box3;
  boundingSphere?: Sphere;
  isStatic: boolean;
  id: string;
}

export class PhysicsEngine {
  private static instance: PhysicsEngine;
  private objects: Map<string, PhysicsObject>;
  private gravity: Vector3;
  private objectPool: ObjectPool;

  private constructor() {
    this.objects = new Map();
    this.gravity = new Vector3(0, -9.81, 0);
    this.objectPool = ObjectPool.getInstance();
  }

  public static getInstance(): PhysicsEngine {
    if (!PhysicsEngine.instance) {
      PhysicsEngine.instance = new PhysicsEngine();
    }
    return PhysicsEngine.instance;
  }

  public addObject(object: PhysicsObject): void {
    this.objects.set(object.id, object);
  }

  public removeObject(id: string): void {
    this.objects.delete(id);
  }

  public update(deltaTime: number): void {
    this.objects.forEach((obj) => {
      if (obj.isStatic) return;

      // Apply gravity
      obj.acceleration.add(this.gravity);

      // Update velocity
      obj.velocity.add(obj.acceleration.multiplyScalar(deltaTime));

      // Apply drag (simple air resistance)
      obj.velocity.multiplyScalar(0.99);

      // Update position
      obj.position.add(obj.velocity.multiplyScalar(deltaTime));

      // Reset acceleration
      obj.acceleration.set(0, 0, 0);

      // Update bounding volumes
      if (obj.boundingBox) {
        obj.boundingBox.setFromCenterAndSize(
          obj.position,
          obj.boundingBox.getSize(new Vector3())
        );
      }

      if (obj.boundingSphere) {
        obj.boundingSphere.center.copy(obj.position);
      }
    });
  }

  public applyForce(objectId: string, force: Vector3): void {
    const obj = this.objects.get(objectId);
    if (!obj || obj.isStatic) return;

    const acceleration = force.divideScalar(obj.mass);
    obj.acceleration.add(acceleration);
  }

  public setGravity(gravity: Vector3): void {
    this.gravity.copy(gravity);
  }

  public getObject(id: string): PhysicsObject | undefined {
    return this.objects.get(id);
  }

  public clear(): void {
    this.objects.clear();
  }
}