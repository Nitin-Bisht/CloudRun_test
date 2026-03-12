"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, useTexture } from "@react-three/drei"
import * as THREE from "three"

const EARTH_RADIUS = 2.08
const LOW_FPS_STEP = 1 / 42

function EarthSphere({
  isMobile,
  liteMode,
  interactive,
}: {
  isMobile: boolean
  liteMode: boolean
  interactive: boolean
}) {
  const { gl } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const globeRef = useRef<THREE.Mesh>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  const currentRotation = useRef(new THREE.Vector2(0.2, -0.92))
  const baseRotation = useRef(new THREE.Vector2(0.2, -0.92))
  const dragVelocity = useRef(new THREE.Vector2(0, 0))
  const isDragging = useRef(false)
  const lastPointer = useRef(new THREE.Vector2(0, 0))
  const frameBudget = useRef(0)

  const [dayMap, normalMap, specularMap, cloudsMap] = useTexture([
    "/textures/earth/earth_day_2048.jpg",
    "/textures/earth/earth_normal_2048.jpg",
    "/textures/earth/earth_specular_2048.jpg",
    "/textures/earth/earth_clouds_1024.png",
  ])
  const globeSegments = liteMode ? (isMobile ? 28 : 44) : (isMobile ? 48 : 128)
  const cloudSegments = liteMode ? (isMobile ? 18 : 28) : (isMobile ? 32 : 96)

  const textures = useMemo(() => {
    const day = dayMap.clone()
    const normal = normalMap.clone()
    const specular = specularMap.clone()
    const clouds = cloudsMap.clone()

    day.colorSpace = THREE.SRGBColorSpace
    clouds.colorSpace = THREE.SRGBColorSpace

    for (const texture of [day, normal, specular, clouds]) {
      texture.anisotropy = liteMode ? 1 : isMobile ? 2 : 4
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.ClampToEdgeWrapping
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      texture.needsUpdate = true
    }

    return { day, normal, specular, clouds }
  }, [cloudsMap, dayMap, isMobile, liteMode, normalMap, specularMap])

  useEffect(() => {
    if (!interactive) return

    const canvas = gl.domElement

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging.current) return
      const deltaX = event.clientX - lastPointer.current.x
      const deltaY = event.clientY - lastPointer.current.y
      lastPointer.current.set(event.clientX, event.clientY)

      baseRotation.current.y += deltaX * 0.0052
      baseRotation.current.x += deltaY * 0.0038
      baseRotation.current.x = THREE.MathUtils.clamp(baseRotation.current.x, -0.38, 0.82)

      dragVelocity.current.set(deltaX * 0.00095, deltaY * 0.00072)
    }

    const onPointerDown = (event: PointerEvent) => {
      isDragging.current = true
      lastPointer.current.set(event.clientX, event.clientY)
      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", endDrag)
      window.addEventListener("pointercancel", endDrag)
    }

    const endDrag = () => {
      isDragging.current = false
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", endDrag)
      window.removeEventListener("pointercancel", endDrag)
    }

    canvas.addEventListener("pointerdown", onPointerDown)

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", endDrag)
      window.removeEventListener("pointercancel", endDrag)
    }
  }, [gl, interactive])

  useFrame((state, delta) => {
    if (typeof document !== "undefined" && document.hidden) return

    let step = delta
    if (liteMode) {
      frameBudget.current += delta
      if (frameBudget.current < LOW_FPS_STEP) return
      step = frameBudget.current
      frameBudget.current = 0
    }

    const elapsed = state.clock.elapsedTime
    const damping = liteMode ? 5.2 : 6.2

    if (!isDragging.current) {
      baseRotation.current.y += dragVelocity.current.x * step * 60
      baseRotation.current.x += dragVelocity.current.y * step * 60
      baseRotation.current.x = THREE.MathUtils.clamp(baseRotation.current.x, -0.38, 0.82)
      dragVelocity.current.multiplyScalar(Math.pow(liteMode ? 0.86 : 0.9, step * 60))
    }

    const hoverX = interactive && !isDragging.current ? state.pointer.y * (liteMode ? 0.05 : 0.08) : 0
    const hoverY = interactive && !isDragging.current ? state.pointer.x * (liteMode ? 0.06 : 0.09) : 0

    const targetX = baseRotation.current.x + hoverX
    const targetY = baseRotation.current.y + hoverY

    currentRotation.current.x = THREE.MathUtils.damp(currentRotation.current.x, targetX, damping, step)
    currentRotation.current.y = THREE.MathUtils.damp(currentRotation.current.y, targetY, damping, step)

    if (groupRef.current) {
      groupRef.current.rotation.x = currentRotation.current.x
      groupRef.current.rotation.y = currentRotation.current.y
    }

    if (globeRef.current) {
      globeRef.current.rotation.y += step * (liteMode ? 0.02 : 0.032)
      globeRef.current.rotation.x = Math.sin(elapsed * (liteMode ? 0.08 : 0.11)) * 0.01
    }

    if (!liteMode && cloudRef.current && globeRef.current) {
      cloudRef.current.rotation.y = globeRef.current.rotation.y + elapsed * 0.004
      cloudRef.current.rotation.x = globeRef.current.rotation.x
    }
  })

  return (
    <group ref={groupRef} rotation={[0.2, -0.92, 0]}>
      <mesh ref={globeRef}>
        <sphereGeometry args={[EARTH_RADIUS, globeSegments, globeSegments]} />
        <meshPhongMaterial
          map={textures.day}
          normalMap={liteMode ? null : textures.normal}
          normalScale={new THREE.Vector2(liteMode ? 0.38 : 0.68, liteMode ? 0.38 : 0.68)}
          specularMap={liteMode ? null : textures.specular}
          specular="#90a9c4"
          shininess={liteMode ? 14 : 24}
          emissive="#071326"
          emissiveIntensity={liteMode ? 0.05 : 0.08}
        />
      </mesh>

      {!liteMode && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[EARTH_RADIUS + 0.012, cloudSegments, cloudSegments]} />
          <meshPhongMaterial
            map={textures.clouds}
            alphaMap={textures.clouds}
            transparent
            opacity={0.16}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      )}
    </group>
  )
}

function SceneLights({ liteMode }: { liteMode: boolean }) {
  return (
    <>
      <ambientLight intensity={liteMode ? 0.48 : 0.34} />
      <hemisphereLight color="#d3e4ff" groundColor="#0a1220" intensity={liteMode ? 0.52 : 0.46} />
      <directionalLight position={[5.8, 2.2, 4.6]} intensity={liteMode ? 1.25 : 1.65} color="#f8fbff" />
      <directionalLight position={[-4.4, -1.8, -3.1]} intensity={liteMode ? 0.3 : 0.42} color="#8fb2d6" />
      {!liteMode && <pointLight position={[0, 0, 3.2]} intensity={0.28} color="#94bcde" />}
    </>
  )
}

type Hero3DProps = {
  shouldReduceMotion?: boolean
  liteMode?: boolean
}

export function Hero3D({ shouldReduceMotion = false, liteMode = false }: Hero3DProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)")
    const apply = () => setIsMobile(media.matches)
    apply()

    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  const isLiteQuality = liteMode || shouldReduceMotion
  const interactive = !isLiteQuality

  if (isLiteQuality) {
    return <FallbackHero />
  }

  return (
    <div className="absolute inset-0 z-0">
      <WebGLErrorBoundary fallback={<FallbackHero />}>
        <Canvas
        dpr={isLiteQuality ? [0.8, 1] : [1, isMobile ? 1.1 : 1.3]}
        gl={{ alpha: true, antialias: !isLiteQuality, powerPreference: isLiteQuality ? "default" : "high-performance" }}
        style={{ cursor: interactive ? "grab" : "default", touchAction: interactive ? "none" : "auto" }}
        onCreated={({ gl }) => {
          gl.toneMapping = isLiteQuality ? THREE.NoToneMapping : window.innerWidth <= 768 ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = isLiteQuality ? 1 : 1.12
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 7.6]} fov={34} />
        <EarthSphere isMobile={isMobile} liteMode={isLiteQuality} interactive={interactive} />
        <SceneLights liteMode={isLiteQuality} />
      </Canvas>
      </WebGLErrorBoundary>
    </div>
  )
}

function FallbackHero() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_46%,rgba(84,148,214,0.26),rgba(4,10,24,0.84)_56%,rgba(2,6,14,0.96)_100%)]" />
      <div className="absolute inset-x-[16%] top-[18%] h-[58%] rounded-full border border-white/10 opacity-35 blur-[1px]" />
      <div className="absolute inset-x-[24%] top-[27%] h-[44%] rounded-full border border-primary/20 opacity-25" />
    </div>
  )
}

class WebGLErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any) {
    console.warn("WebGL not supported or context lost. Falling back to static hero.", error)
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
