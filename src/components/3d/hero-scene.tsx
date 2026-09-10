"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Decorative, non-reactive particle field — generated once at module load, not per render,
// so it never touches React's render purity rules.
function generateParticlePositions(count: number): Float32Array {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.7 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

const PARTICLE_POSITIONS = generateParticlePositions(120);

// Four "media node" markers orbiting the core — link → process → media → download. Each has
// its own radius/speed/tilt so they read as independent data, not a single decorative ring.
const NODES = [
  { radius: 2.1, speed: 0.26, tilt: 0.15, phase: 0, size: 0.09 },
  { radius: 2.35, speed: -0.19, tilt: -0.35, phase: 2.1, size: 0.07 },
  { radius: 1.9, speed: 0.22, tilt: 0.55, phase: 4.2, size: 0.06 },
  { radius: 2.15, speed: -0.15, tilt: -0.1, phase: 1.4, size: 0.08 },
];

/** The faceted core — a translucent processing crystal, tinted by the current platform. */
function Core({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  const core = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !core.current) return;
    core.current.rotation.y += delta * 0.16;
    core.current.rotation.x += delta * 0.03;
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial
          color="#2a3550"
          metalness={0.4}
          roughness={0.2}
          emissive={accent}
          emissiveIntensity={0.4}
          flatShading
        />
      </mesh>
      <mesh scale={1.42}>
        <icosahedronGeometry args={[1.3, 1]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

/** Two slow orbiting rings around the core, evoking a system in motion rather than a static gem. */
function Rings({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (ringA.current) ringA.current.rotation.z += delta * 0.09;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.06;
  });

  return (
    <>
      <mesh ref={ringA} rotation={[1.15, 0.3, 0]}>
        <torusGeometry args={[1.95, 0.012, 8, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ringB} rotation={[1.35, -0.5, 0.4]}>
        <torusGeometry args={[2.3, 0.009, 8, 96]} />
        <meshBasicMaterial color="#8FA8F7" transparent opacity={0.22} />
      </mesh>
    </>
  );
}

/** Small nodes orbiting the core — the "link / process / media / download" stages in motion. */
function MediaNodes({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    NODES.forEach((n, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      const angle = t * n.speed + n.phase;
      mesh.position.set(Math.cos(angle) * n.radius, Math.sin(angle) * n.radius * Math.sin(n.tilt) + Math.sin(angle * 0.7) * 0.2, Math.sin(angle) * n.radius * Math.cos(n.tilt));
    });
  });

  return (
    <>
      {NODES.map((n, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[n.size, 12, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? accent : "#C9D5FA"}
            emissive={i % 2 === 0 ? accent : "#C9D5FA"}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

function Particles({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !points.current) return;
    points.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[PARTICLE_POSITIONS, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.032} color="#8FA8F7" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Lights({ accent }: { accent: string }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 2, 4]} intensity={38} color={accent} />
      <pointLight position={[-3, -2, -2]} intensity={16} color="#63C7D6" />
    </>
  );
}

/** Subtle mouse-reactive tilt for the whole system — the core "notices" the cursor without
 *  chasing it. */
function Scene({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (reducedMotion || !group.current) return;
    const { pointer } = state;
    group.current.rotation.x += (pointer.y * 0.22 - group.current.rotation.x) * 0.04;
    group.current.rotation.y += (pointer.x * 0.32 - group.current.rotation.y) * 0.04;
  });

  return (
    <group ref={group}>
      <Core accent={accent} reducedMotion={reducedMotion} />
      <Rings accent={accent} reducedMotion={reducedMotion} />
      <MediaNodes accent={accent} reducedMotion={reducedMotion} />
      <Particles reducedMotion={reducedMotion} />
    </group>
  );
}

export default function HeroScene({ accent, reducedMotion }: { accent: string; reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Lights accent={accent} />
      <Scene accent={accent} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
