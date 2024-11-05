// src/systems/network/NetworkManager.ts
import io, { Socket } from 'socket.io-client';

export class NetworkManager {
  private static instance: NetworkManager;
  private socket: Socket | null = null;

  private constructor() {
    // Initialize socket connection
  }

  public static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  public connect() {
    this.socket = io('your-server-url');
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('updatePlayers', (players: { id: string, name: string, position: { x: number, y: number } }[]) => {
      // Handle player updates
      console.log('Player updates:', players);
    });

    this.socket.on('projectileUpdate', (projectiles: { id: string, position: { x: number, y: number }, velocity: { x: number, y: number } }[]) => {
      // Handle projectile updates
      console.log('Projectile updates:', projectiles);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });
  }

  public emit(event: string, data: unknown) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}