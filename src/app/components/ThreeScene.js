"use client";
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import CyberCore from './CyberCore';

export default function ThreeScene() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: false, alpha: true }}
        dpr={[1, 2]}
      >
        {/* Removed black background color to let PixelCanvas show through */}
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00e5ff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ff0055" />

        {/* Environment / Background */}
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        {/* 3D Content */}
        <CyberCore />

        {/* Post-processing effects for that premium look */}
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
