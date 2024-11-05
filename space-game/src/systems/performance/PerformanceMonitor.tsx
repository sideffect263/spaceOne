// src/systems/performance/PerformanceMonitor.tsx
import { useState, useEffect } from 'react'
import Stats from 'stats.js'
import { Html } from '@react-three/drei'

interface PerformanceMetrics {
  fps: number
  memory: number
  frameTime: number
}

// This component goes inside the Canvas
export const Scene3DPerformanceMonitor = () => {
  return (
    <Html as='div' position={[-1.5, 1, 0]} style={{ color: 'white' }}>
      {/* Scene-specific performance indicators can go here */}
    </Html>
  )
}

// This component goes outside the Canvas
export const PerformanceStats = () => {
  const [stats] = useState(() => new Stats())
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: 0,
    frameTime: 0
  })

  useEffect(() => {
    // Create FPS panel
    stats.showPanel(0)
    const statsDom = stats.dom
    statsDom.style.position = 'absolute'
    statsDom.style.right = '0px'
    statsDom.style.top = '0px'
    document.body.appendChild(statsDom)

    // Create custom panel for memory
    const memPanel = new Stats.Panel('MB', '#f8f', '#212')
    stats.addPanel(memPanel)
    stats.showPanel(0)

    let frameId: number
    let lastTime = performance.now()

    const animate = () => {
      const time = performance.now()
      const delta = time - lastTime
      lastTime = time

      stats.begin()

      // Update memory panel if available
      if (window.performance && (window.performance as Performance & { memory: { usedJSHeapSize: number } }).memory) {
        const memory = (window.performance as Performance & { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1048576
        memPanel.update(memory, 2000)
      }

      // Update metrics
      setMetrics({
        fps: 1000 / delta,
        memory: (window.performance as Performance & { memory: { usedJSHeapSize: number } }).memory?.usedJSHeapSize / 1048576 || 0,
        frameTime: delta
      })

      frameId = requestAnimationFrame(animate)
      stats.end()
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
      document.body.removeChild(statsDom)
    }
  }, [stats])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div id="performance-overlay" style={{
      position: 'absolute',
      left: '10px',
      top: '10px',
      color: 'white',
      fontSize: '12px',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '5px',
      zIndex: 1000
    }}>
      <div>FPS: {metrics.fps.toFixed(1)}</div>
      <div>Frame Time: {metrics.frameTime.toFixed(1)}ms</div>
      <div>Memory: {metrics.memory.toFixed(1)}MB</div>
    </div>
  )
}