"use client";
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import CyberCore from './CyberCore';

// Static tiny background stars
function StaticStars({ count = 400 }) {
  const positions = useRef((() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 50;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    }
    return arr;
  })()).current;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.015}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Comet stars: bright tiny head + thin fading trail
const COMET_COUNT = 100;
const TRAIL_SEGS = 8;
const TOTAL = COMET_COUNT * TRAIL_SEGS;

function CometStars() {
  const comets = useRef((() => {
    const arr = [];
    for (let i = 0; i < COMET_COUNT; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 30 - 10,
        z: (Math.random() - 0.8) * 30,
        speed: 0.3 + Math.random() * 0.8,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }
    return arr;
  })()).current;

  const posArr = useRef(new Float32Array(TOTAL * 3)).current;
  const colArr = useRef(new Float32Array(TOTAL * 4)).current;
  const sizeArr = useRef(new Float32Array(TOTAL)).current;

  const geomRef = useRef();

  const material = useRef(new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {},
    vertexShader: `
      attribute float size;
      attribute vec4 aColor;
      varying vec4 vColor;
      void main() {
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec4 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.05, dist);
        gl_FragColor = vec4(vColor.rgb, vColor.a * alpha);
      }
    `,
  })).current;

  useFrame((state, delta) => {
    if (!geomRef.current) return;

    const dirX = 0.7;
    const dirY = 0.7;

    for (let i = 0; i < COMET_COUNT; i++) {
      const c = comets[i];

      c.x += dirX * c.speed * delta * 3;
      c.y += dirY * c.speed * delta * 3;

      if (c.x > 25 || c.y > 20) {
        c.x = (Math.random() - 0.5) * 40 - 15;
        c.y = (Math.random() - 0.5) * 20 - 15;
        c.z = (Math.random() - 0.8) * 30;
        c.speed = 0.3 + Math.random() * 0.8;
      }

      for (let s = 0; s < TRAIL_SEGS; s++) {
        const pIdx = (i * TRAIL_SEGS + s) * 3;
        const cIdx = (i * TRAIL_SEGS + s) * 4;
        const sIdx = i * TRAIL_SEGS + s;

        const trailOffset = s * 0.06 * (0.5 + c.speed);

        posArr[pIdx]     = c.x - dirX * trailOffset;
        posArr[pIdx + 1] = c.y - dirY * trailOffset;
        posArr[pIdx + 2] = c.z;

        const t = s / (TRAIL_SEGS - 1);
        const fade = c.brightness * Math.pow(1 - t, 2);

        colArr[cIdx]     = 1.0;
        colArr[cIdx + 1] = 1.0;
        colArr[cIdx + 2] = 1.0;
        colArr[cIdx + 3] = fade;

        sizeArr[sIdx] = 0.35 * (1 - t * 0.8);
      }
    }

    geomRef.current.attributes.position.needsUpdate = true;
    geomRef.current.attributes.aColor.needsUpdate = true;
    geomRef.current.attributes.size.needsUpdate = true;
  });

  return (
    <points material={material}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" count={TOTAL} array={posArr} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={TOTAL} array={colArr} itemSize={4} />
        <bufferAttribute attach="attributes-size" count={TOTAL} array={sizeArr} itemSize={1} />
      </bufferGeometry>
    </points>
  );
}

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00e5ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ff0055" />

        {/* Static background stars */}
        <StaticStars count={400} />

        {/* Comet stars with trails */}
        <CometStars />
        
        {/* 3D Content */}
        <CyberCore />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={1.5} 
          />
          <ChromaticAberration 
            blendFunction={BlendFunction.NORMAL} 
            offset={[0.001, 0.001]} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
