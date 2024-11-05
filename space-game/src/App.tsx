import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene3DPerformanceMonitor, PerformanceStats } from './systems/performance/PerformanceMonitor'
import { BasicScene } from './components/core/BasicScene'
import { GameWorld } from './components/core/GameWorld'

function App() {
  return (
    <>
      <PerformanceStats />
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          dpr={window.devicePixelRatio}
          performance={{ 
            current: 1,
            min: 0.5,
            debounce: 200 
          }}
        >
          <Suspense fallback={null}>
            <Scene3DPerformanceMonitor />
            <BasicScene />
            <GameWorld/>
          </Suspense>
        </Canvas>
      </div>
    </>
  )
}

export default App