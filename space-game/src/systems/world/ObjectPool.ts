// src/systems/world/ObjectPool.ts

interface PoolObject {
    id: string;
    isActive: boolean;
    reset: () => void;
  }
  
  export class ObjectPool<T extends PoolObject> {
    private static instance: ObjectPool<any>;
    private pools: Map<string, T[]>;
    private activeObjects: Map<string, T>;
    private createFunctions: Map<string, () => T>;
    private maxPoolSize: Map<string, number>;
  
    private constructor() {
      this.pools = new Map();
      this.activeObjects = new Map();
      this.createFunctions = new Map();
      this.maxPoolSize = new Map();
    }
  
    public static getInstance(): ObjectPool<any> {
      if (!ObjectPool.instance) {
        ObjectPool.instance = new ObjectPool();
      }
      return ObjectPool.instance;
    }
  
    public registerType(
      type: string, 
      createFn: () => T, 
      initialSize: number = 100,
      maxSize: number = 1000
    ): void {
      if (!this.pools.has(type)) {
        this.pools.set(type, []);
        this.createFunctions.set(type, createFn);
        this.maxPoolSize.set(type, maxSize);
  
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
          const obj = createFn();
          obj.isActive = false;
          this.pools.get(type)!.push(obj);
        }
      }
    }
  
    public acquire(type: string): T | null {
      const pool = this.pools.get(type);
      const createFn = this.createFunctions.get(type);
      const maxSize = this.maxPoolSize.get(type);
  
      if (!pool || !createFn || !maxSize) {
        console.error(`Object pool for type ${type} not registered`);
        return null;
      }
  
      // Try to get an inactive object from the pool
      const obj = pool.find(obj => !obj.isActive);
      
      if (obj) {
        obj.isActive = true;
        obj.reset();
        this.activeObjects.set(obj.id, obj);
        return obj;
      }
  
      // If no inactive objects are available and we haven't reached max size,
      // create a new one
      if (pool.length < maxSize) {
        const newObj = createFn();
        newObj.isActive = true;
        pool.push(newObj);
        this.activeObjects.set(newObj.id, newObj);
        return newObj;
      }
  
      console.warn(`Object pool for type ${type} is exhausted`);
      return null;
    }
  
    public release(obj: T): void {
      obj.isActive = false;
      obj.reset();
      this.activeObjects.delete(obj.id);
    }
  
    public releaseAll(type: string): void {
      const pool = this.pools.get(type);
      if (!pool) return;
  
      pool.forEach(obj => {
        obj.isActive = false;
        obj.reset();
      });
      this.activeObjects.clear();
    }
  
    public getActiveObjects(): Map<string, T> {
      return this.activeObjects;
    }
  
    public getPoolSize(type: string): number {
      return this.pools.get(type)?.length || 0;
    }
  
    public getActiveCount(type: string): number {
      return Array.from(this.activeObjects.values()).filter(obj => obj.isActive).length;
    }
  
    public clear(): void {
      this.pools.clear();
      this.activeObjects.clear();
      this.createFunctions.clear();
      this.maxPoolSize.clear();
    }
  }