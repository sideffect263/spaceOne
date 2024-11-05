
// src/hooks/useKeyboardControls.ts
import { useState, useEffect } from 'react';

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState({
    moveForward: false,
    moveBackward: false,
    turnLeft: false,
    turnRight: false,
    moveUp: false,
    moveDown: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setKeys(k => ({ ...k, moveForward: true }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, moveBackward: true }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, turnLeft: true }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, turnRight: true }));
          break;
        case 'Space':
          setKeys(k => ({ ...k, moveUp: true }));
          break;
        case 'ShiftLeft':
          setKeys(k => ({ ...k, moveDown: true }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          setKeys(k => ({ ...k, moveForward: false }));
          break;
        case 'KeyS':
          setKeys(k => ({ ...k, moveBackward: false }));
          break;
        case 'KeyA':
          setKeys(k => ({ ...k, turnLeft: false }));
          break;
        case 'KeyD':
          setKeys(k => ({ ...k, turnRight: false }));
          break;
        case 'Space':
          setKeys(k => ({ ...k, moveUp: false }));
          break;
        case 'ShiftLeft':
          setKeys(k => ({ ...k, moveDown: false }));
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