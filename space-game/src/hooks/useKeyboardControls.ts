// src/hooks/useKeyboardControls.ts
import { useState, useEffect } from 'react';

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState({
    // Movement
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    // Looking
    lookUp: false,
    lookDown: false,
    lookLeft: false,
    lookRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        // Movement
        case 'KeyW':
          setKeys(k => ({ ...k, moveForward: true }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, moveBackward: true }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, moveLeft: true }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, moveRight: true }));
          break;
        case 'Space':
          setKeys(k => ({ ...k, moveUp: true }));
          break;
        case 'ShiftLeft':
          setKeys(k => ({ ...k, moveDown: true }));
          break;
        // Looking
        case 'ArrowUp':
          setKeys(k => ({ ...k, lookUp: true }));
          break;
        case 'ArrowDown':
          setKeys(k => ({ ...k, lookDown: true }));
          break;
        case 'ArrowLeft':
          setKeys(k => ({ ...k, lookLeft: true }));
          break;
        case 'ArrowRight':
          setKeys(k => ({ ...k, lookRight: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        // Movement
        case 'KeyW':
          setKeys(k => ({ ...k, moveForward: false }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, moveBackward: false }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, moveLeft: false }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, moveRight: false }));
          break;
        case 'Space':
          setKeys(k => ({ ...k, moveUp: false }));
          break;
        case 'ShiftLeft':
          setKeys(k => ({ ...k, moveDown: false }));
          break;
        // Looking
        case 'ArrowUp':
          setKeys(k => ({ ...k, lookUp: false }));
          break;
        case 'ArrowDown':
          setKeys(k => ({ ...k, lookDown: false }));
          break;
        case 'ArrowLeft':
          setKeys(k => ({ ...k, lookLeft: false }));
          break;
        case 'ArrowRight':
          setKeys(k => ({ ...k, lookRight: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
};