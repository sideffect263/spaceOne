// src/systems/physics/CollisionSystem.ts

import { Vector3, Box3, Sphere } from 'three';
import { PhysicsObject } from './PhysicsEngine';
import { SpatialHashGrid } from './SpatialHashGrid';

export interface CollisionResult {
  object1Id: string;
  object2Id: string;
  contactPoint: Vector3;
  normal: Vector3;
  penetrationDepth: number;
}

export class CollisionSystem {
  private static instance: CollisionSystem;
  private spatialHash: SpatialHashGrid;
  private cellSize: number;

  private constructor() {
    this.cellSize = 100; // Adjust based on average object size
    this.spatialHash = new SpatialHashGrid(this.cellSize);
  }

  public static getInstance(): CollisionSystem {
    if (!CollisionSystem.instance) {
      CollisionSystem.instance = new CollisionSystem();
    }
    return CollisionSystem.instance;
  }

  public update(objects: Map<string, PhysicsObject>): CollisionResult[] {
    const collisions: CollisionResult[] = [];
    this.spatialHash.clear();

    // Update spatial hash
    objects.forEach((obj) => {
      if (obj.boundingBox || obj.boundingSphere) {
        this.spatialHash.insertObject(obj);
      }
    });

    // Check for collisions
    objects.forEach((obj1) => {
      const nearbyObjects = this.spatialHash.getNearbyObjects(obj1);

      nearbyObjects.forEach((obj2) => {
        if (obj1.id === obj2.id) return;

        const collision = this.detectCollision(obj1, obj2);
        if (collision) {
          collisions.push(collision);
        }
      });
    });

    return collisions;
  }

  private detectCollision(obj1: PhysicsObject, obj2: PhysicsObject): CollisionResult | null {
    // Sphere-Sphere collision
    if (obj1.boundingSphere && obj2.boundingSphere) {
      return this.sphereSphereCollision(obj1, obj2);
    }

    // Box-Box collision
    if (obj1.boundingBox && obj2.boundingBox) {
      return this.boxBoxCollision(obj1, obj2);
    }

    // Mixed collision (Sphere-Box)
    if (obj1.boundingSphere && obj2.boundingBox) {
      return this.sphereBoxCollision(obj1, obj2);
    }
    if (obj1.boundingBox && obj2.boundingSphere) {
      return this.sphereBoxCollision(obj2, obj1);
    }

    return null;
  }

  private sphereSphereCollision(obj1: PhysicsObject, obj2: PhysicsObject): CollisionResult | null {
    const sphere1 = obj1.boundingSphere!;
    const sphere2 = obj2.boundingSphere!;

    const distance = sphere1.center.distanceTo(sphere2.center);
    const sumRadii = sphere1.radius + sphere2.radius;

    if (distance < sumRadii) {
      const normal = new Vector3()
        .subVectors(sphere2.center, sphere1.center)
        .normalize();

      return {
        object1Id: obj1.id,
        object2Id: obj2.id,
        contactPoint: new Vector3()
          .addVectors(sphere1.center, normal.multiplyScalar(sphere1.radius)),
        normal: normal,
        penetrationDepth: sumRadii - distance
      };
    }

    return null;
  }

  private boxBoxCollision(obj1: PhysicsObject, obj2: PhysicsObject): CollisionResult | null {
    const box1 = obj1.boundingBox!;
    const box2 = obj2.boundingBox!;

    if (box1.intersectsBox(box2)) {
      // Calculate contact point (simplified)
      const contactPoint = new Vector3()
        .addVectors(box1.min, box1.max)
        .multiplyScalar(0.5);

      // Calculate normal (simplified)
      const normal = new Vector3()
        .subVectors(box2.getCenter(new Vector3()), box1.getCenter(new Vector3()))
        .normalize();

      // Approximate penetration depth
      const penetrationDepth = Math.min(
        box1.max.x - box2.min.x,
        box2.max.x - box1.min.x
      );

      return {
        object1Id: obj1.id,
        object2Id: obj2.id,
        contactPoint,
        normal,
        penetrationDepth
      };
    }

    return null;
  }

  private sphereBoxCollision(
    sphereObj: PhysicsObject,
    boxObj: PhysicsObject
  ): CollisionResult | null {
    const sphere = sphereObj.boundingSphere!;
    const box = boxObj.boundingBox!;

    // Find closest point on box to sphere center
    const closestPoint = new Vector3().copy(sphere.center).clamp(box.min, box.max);

    const distance = sphere.center.distanceTo(closestPoint);

    if (distance < sphere.radius) {
      const normal = new Vector3()
        .subVectors(sphere.center, closestPoint)
        .normalize();

      return {
        object1Id: sphereObj.id,
        object2Id: boxObj.id,
        contactPoint: closestPoint,
        normal,
        penetrationDepth: sphere.radius - distance
      };
    }

    return null;
  }
}