// src/App.tsx
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene3DPerformanceMonitor, PerformanceStats } from './systems/performance/PerformanceMonitor'
import { GameWorld } from './components/core/GameWorld'

function App() {
  return (
    <>
      <PerformanceStats />
      <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
        <Canvas
          dpr={window.devicePixelRatio}
          performance={{ 
            current: 1,
            min: 0.5,
            debounce: 200 
          }}
          style={{ background: '#000' }}
        >
          <Suspense fallback={null}>
            <Scene3DPerformanceMonitor />
            <GameWorld />
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}

export default App