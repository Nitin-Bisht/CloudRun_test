"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, ContactShadows, Sparkles, Line, Sphere } from "@react-three/drei"
import * as THREE from "three"

// Major Global Financial & Orchestration Hubs
const CITIES = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
]

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))

    return new THREE.Vector3(x, y, z)
}

function getArc3D(v0: THREE.Vector3, v1: THREE.Vector3, height: number = 0.3) {
    const distance = v0.distanceTo(v1)
    const mid = v0.clone().lerp(v1, 0.5)
    const midLength = mid.length()
    mid.normalize().multiplyScalar(midLength + distance * height)
    return new THREE.QuadraticBezierCurve3(v0, mid, v1)
}

function ArcLine({ curve, color = "#D4AF37" }: { curve: THREE.QuadraticBezierCurve3, color?: string }) {
    const points = useMemo(() => curve.getPoints(50), [curve])

    return (
        <Line
            points={points}
            color={color}
            lineWidth={1.2}
            transparent
            opacity={0.6}
            dashed={true}
            dashScale={20}
            dashSize={0.5}
            dashOffset={0}
        />
    )
}

function NetworkNodesAndArcs({ radius }: { radius: number }) {
    const { nodes, arcs } = useMemo(() => {
        const nodeVecs = CITIES.map(c => latLngToVector3(c.lat, c.lng, radius))
        const generatedArcs = []

        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 1], [0, 5], [0, 6], [3, 8], [1, 9], [7, 3], [4, 10],
        ]

        for (const [i, j] of connections) {
            generatedArcs.push(getArc3D(nodeVecs[i], nodeVecs[j], 0.2))
        }

        return { nodes: nodeVecs, arcs: generatedArcs }
    }, [radius])

    return (
        <group>
            {arcs.map((curve, idx) => (
                <ArcLine key={idx} curve={curve} color={idx % 2 === 0 ? "#1E40AF" : "#D4AF37"} />
            ))}

            {nodes.map((vec, idx) => (
                <group key={idx} position={vec}>
                    <mesh>
                        <sphereGeometry args={[0.03, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" />
                    </mesh>
                    <mesh scale={3}>
                        <sphereGeometry args={[0.03, 16, 16]} />
                        <meshBasicMaterial color={idx % 3 === 0 ? "#D4AF37" : "#1E40AF"} transparent opacity={0.3} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

export function PremiumGlassObject() {
    const globeRef = useRef<THREE.Group>(null)
    const ringsRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (globeRef.current) {
            globeRef.current.rotation.y = t * 0.04
        }
        if (ringsRef.current) {
            ringsRef.current.rotation.x = Math.sin(t * 1.1) * 0.1
            ringsRef.current.rotation.y = t * 1.08
        }
    })

    return (
        <group position={[0, -0.2, 0]} scale={1.3}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#D4AF37" castShadow />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#1E40AF" />

            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
                <group ref={globeRef}>
                    {/* The Core: High-Gloss Dark Planet */}
                    <Sphere args={[1.9, 64, 64]}>
                        <meshStandardMaterial
                            color="#020617"
                            metalness={1}
                            roughness={0.1}
                            envMapIntensity={2}
                        />
                    </Sphere>

                    {/* The Glass Shell: Highly performant physical material for the glass look */}
                    <mesh>
                        <sphereGeometry args={[2.0, 64, 64]} />
                        <meshPhysicalMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.25}
                            roughness={0.1}
                            metalness={0.8}
                            clearcoat={1.0}
                            clearcoatRoughness={0.1}
                            envMapIntensity={2}
                            side={THREE.DoubleSide}
                        />
                    </mesh>

                    {/* Data Mesh Layer */}
                    <mesh>
                        <icosahedronGeometry args={[2.05, 10]} />
                        <meshBasicMaterial color="#1E40AF" wireframe transparent opacity={0.08} />
                    </mesh>

                    {/* Global Orchestration Nodes */}
                    <NetworkNodesAndArcs radius={2.05} />
                </group>

                {/* Refined Orbital Rings */}
                <group ref={ringsRef}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[2.8, 0.005, 16, 100]} />
                        <meshBasicMaterial color="#1E40AF" transparent opacity={0.4} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
                        <torusGeometry args={[3.4, 0.008, 16, 100]} />
                        <meshBasicMaterial color="#D4AF37" transparent opacity={0.3} />
                    </mesh>
                </group>
            </Float>

            {/* Atmosphere & Particle Flux */}
            <Sparkles count={150} scale={6} size={1.5} color="#D4AF37" opacity={0.3} />
            <Sparkles count={100} scale={10} size={1} color="#1E40AF" opacity={0.4} speed={1.5} />

            <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={15} blur={2.5} far={10} color="#000000" />
        </group>
    )
}
