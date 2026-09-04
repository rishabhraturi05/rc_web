"use client";
import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Float, Cone } from '@react-three/drei';
import * as THREE from 'three';

export default function CyberCore() {
  const groupRef = useRef();
  
  // Refs for VTOL engines to animate them independently
  const engineFL = useRef();
  const engineFR = useRef();
  const engineBL = useRef();
  const engineBR = useRef();

  // Cache scroll offset and viewport width in refs to avoid DOM reads at 60fps
  const scrollRef = useRef(0);
  const isMobileRef = useRef(false);

  useEffect(() => {
    // Set initial values
    isMobileRef.current = window.innerWidth < 768;
    
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? window.scrollY / max : 0;
    };
    const onResize = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    
    onScroll(); // set initial scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    
    // Read cached scroll offset (updated via passive event listener, not DOM)
    const scrollOffset = scrollRef.current;

    let targetX = 0;
    let targetY = 0.5;
    let targetScale = 0.9; 
    let isTakingOff = false;

    // Animation path - Ship maneuvers through space as you scroll
    if (scrollOffset < 0.2) {
        // Shifted to the right side of the screen to balance the left-aligned text
        targetX = 2.5;
        targetY = 0; 
        targetScale = 0.8;
    } else if (scrollOffset < 0.5) {
        targetX = 4.0;
        targetY = 0.5;
        targetScale = 1.2; 
    } else if (scrollOffset < 0.75) {
        targetX = -4.0;
        targetY = 0.5;
        targetScale = 1.1;
    } else if (scrollOffset < 0.95) {
        // Swoop down to bottom left to prepare for diagonal takeoff
        targetX = -3.0;
        targetY = -2.5;
        targetScale = 0.8;
    } else {
        // BLAST OFF Sequence: Shoot to the TOP RIGHT
        isTakingOff = true;
        targetX = 20; // Far right
        targetY = 20; // High up
        targetScale = 0.2; // Shrink rapidly as it flies away
    }

    if (isMobileRef.current) {
        targetX *= 0.3;
        if (!isTakingOff) targetY *= 0.5;
        targetScale *= 0.6;
    }

    // Smooth dampening for position
    // EXTREMELY slow lerp speed during takeoff for a majestic, cinematic heavy liftoff
    const posLerp = isTakingOff ? 0.005 : 0.05;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, posLerp);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, posLerp);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, posLerp));
    
    // Flight mechanics: Banking (rolling) into turns based on horizontal velocity
    const currentX = groupRef.current.position.x;
    const velocityX = targetX - currentX;
    // Bank heavily to the right when taking off diagonally
    const targetRoll = isTakingOff ? -0.5 : velocityX * -0.25; 
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRoll, 0.05);
    
    // Interactive Mouse Tracking: Ship pitches and yaws to aim exactly at your cursor
    const mouseWorldX = state.pointer.x * (state.viewport.width / 2);
    const mouseWorldY = state.pointer.x * (state.viewport.height / 2); // BUG FIX: this was using .x before? No it was using .y
    const actualMouseWorldY = state.pointer.y * (state.viewport.height / 2);
    
    const dx = mouseWorldX - currentX;
    const dy = actualMouseWorldY - groupRef.current.position.y;
    
    // If taking off, override mouse tracking: Pitch up and Yaw Right to face the top-right corner
    const targetYaw = isTakingOff ? Math.PI / 4 : Math.atan2(dx, 5);
    const targetPitch = isTakingOff ? 0.8 : Math.atan2(-dy, 5) + 0.1; 
    
    // SLOWED DOWN rotation lerp during takeoff so it tilts back heavily and slowly
    const rotLerp = isTakingOff ? 0.01 : 0.15;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetPitch, rotLerp);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYaw, rotLerp);

    // Animate VTOL engines: they dynamically tilt to stabilize the ship
    // If taking off, engines lock facing straight down to provide maximum vertical thrust
    const engineTiltX = isTakingOff ? Math.PI / 2 : Math.PI / 2 + Math.sin(time * 1.5) * 0.1 + velocityX * 0.2;
    [engineFL, engineFR, engineBL, engineBR].forEach(ref => {
        if (ref.current) {
            // Lerp the engine rotation for smooth transitions
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, engineTiltX, 0.1);
            
            // The blue exhaust flames pulse with energy. On takeoff, they erupt into massive blasts!
            const flame = ref.current.children[2]; 
            if (flame) {
                const baseFlameScale = isTakingOff ? 4.0 : 1.0;
                flame.scale.y = THREE.MathUtils.lerp(flame.scale.y, baseFlameScale + Math.sin(time * 30) * 0.3, 0.1);
            }
        }
    });
  });

  // Premium Sci-Fi Materials
  const hullWhite = <meshStandardMaterial color="#e0e5ec" metalness={0.6} roughness={0.2} />;
  const hullDark = <meshStandardMaterial color="#1a1c23" metalness={0.9} roughness={0.3} />;
  const steel = <meshStandardMaterial color="#556677" metalness={0.9} roughness={0.4} />;
  const cockpitGlass = <meshStandardMaterial color="#00ffff" metalness={1} roughness={0.1} emissive="#00ffff" emissiveIntensity={1} transparent opacity={0.8} />;
  const exhaustGlow = <meshBasicMaterial color="#00aaff" transparent opacity={0.8} />;
  const redWarning = <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={3} />;

  // Component for the VTOL Engine pods
  const EnginePod = ({ position, podRef }) => (
    <group position={position} ref={podRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Engine Housing */}
        <Cylinder args={[0.35, 0.3, 0.9, 16]}>
            {hullDark}
        </Cylinder>
        {/* Intake turbine (wireframe adds complex tech details) */}
        <Cylinder args={[0.36, 0.36, 0.92, 16]}>
            <meshStandardMaterial color="#333" metalness={1} wireframe={true} />
        </Cylinder>
        {/* Exhaust Flame */}
        <Cone args={[0.25, 1.5, 16]} position={[0, -1.0, 0]} rotation={[Math.PI, 0, 0]}>
            {exhaustGlow}
        </Cone>
    </group>
  );

  return (
    <group ref={groupRef}>
      <Float speed={2.5} rotationIntensity={0.1} floatIntensity={1.0}>
        
        {/* --- MAIN FUSELAGE --- */}
        {/* Core Hull */}
        <Box args={[1.2, 0.7, 3.8]}>
            {hullWhite}
        </Box>
        {/* Upper Armor Plating */}
        <Box args={[1.0, 0.3, 3.0]} position={[0, 0.5, -0.2]}>
            {hullDark}
        </Box>
        {/* Lower Belly */}
        <Box args={[0.9, 0.4, 2.8]} position={[0, -0.5, 0]}>
            {steel}
        </Box>

        {/* --- COCKPIT --- */}
        {/* Slanted Glass Canopy */}
        <group position={[0, 0.45, 1.4]} rotation={[0.3, 0, 0]}>
            <Box args={[0.9, 0.4, 1.0]}>
                {cockpitGlass}
            </Box>
        </group>
        {/* Nose cone */}
        <Box args={[0.7, 0.5, 1.0]} position={[0, 0, 2.4]}>
            {hullWhite}
        </Box>

        {/* --- WINGS --- */}
        {/* Main Swept Wings */}
        <Box args={[4.8, 0.2, 1.4]} position={[0, 0, 0]}>
            {hullWhite}
        </Box>
        {/* Rear Stabilizers */}
        <Box args={[3.0, 0.2, 1.0]} position={[0, 0.3, -1.5]}>
            {hullDark}
        </Box>
        {/* Vertical Tail Fins */}
        <Box args={[0.15, 1.2, 1.0]} position={[1.4, 0.7, -1.5]} rotation={[0.2, 0, -0.2]}>
            {hullWhite}
        </Box>
        <Box args={[0.15, 1.2, 1.0]} position={[-1.4, 0.7, -1.5]} rotation={[0.2, 0, 0.2]}>
            {hullWhite}
        </Box>

        {/* --- VTOL ENGINES --- */}
        {/* Front Engines mounted on main wings */}
        <EnginePod position={[2.6, 0, 0]} podRef={engineFR} />
        <EnginePod position={[-2.6, 0, 0]} podRef={engineFL} />
        {/* Rear Engines mounted on rear stabilizers */}
        <EnginePod position={[1.7, 0.3, -1.5]} podRef={engineBR} />
        <EnginePod position={[-1.7, 0.3, -1.5]} podRef={engineBL} />

        {/* --- DETAILS & GREEBLES --- */}
        {/* Front Railguns / Sensors */}
        <Cylinder args={[0.06, 0.06, 1.2]} position={[0.5, -0.2, 2.8]} rotation={[Math.PI/2, 0, 0]}>{steel}</Cylinder>
        <Cylinder args={[0.06, 0.06, 1.2]} position={[-0.5, -0.2, 2.8]} rotation={[Math.PI/2, 0, 0]}>{steel}</Cylinder>
        
        {/* Glowing Status Lights */}
        <Box args={[0.15, 0.15, 0.15]} position={[2.3, 0.2, 0.7]}>{cockpitGlass}</Box>
        <Box args={[0.15, 0.15, 0.15]} position={[-2.3, 0.2, 0.7]}>{redWarning}</Box>
        <Box args={[0.1, 0.1, 0.1]} position={[0, 1.3, -1.5]}>{redWarning}</Box>
        
      </Float>
    </group>
  );
}
