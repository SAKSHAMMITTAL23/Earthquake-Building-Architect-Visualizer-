
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Building3DProps {
  floors: number;
  displacements: number[];
  damageLevels: ('safe' | 'moderate' | 'critical')[];
  showModeShape?: boolean;
  waveProgress?: number;
  fireFloors?: number[];
  age?: number;
  retrofits?: ('none' | 'bracing' | 'damper' | 'concrete-core')[];
}

const FLOOR_HEIGHT = 4;
const COL_WIDTH = 0.4;
const BUILDING_WIDTH = 8;
const BUILDING_DEPTH = 8;

const Building3D = ({ 
  floors, 
  displacements, 
  damageLevels, 
  waveProgress = 0, 
  fireFloors = [], 
  age = 0,
  retrofits = []
}: Building3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);

  // Animate wave propagation
  useFrame((state) => {
    if (waveRef.current && waveProgress > 0) {
      waveRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          const wave = Math.sin(state.clock.elapsedTime * 5 + i * 0.5) * 0.1;
          child.position.y = wave;
        }
      });
    }
  });

  // Age-based visual degradation
  const ageOpacity = useMemo(() => Math.max(0.5, 1 - age / 150), [age]);
  const ageTint = useMemo(() => {
    if (age > 50) return "#8b7355"; // Brownish for old
    if (age > 30) return "#9ca3af"; // Gray tint
    return "#64748b"; // Normal
  }, [age]);

  const Floor = ({ level, displacement, damage, retrofit }: { level: number, displacement: number, damage: string, retrofit: string }) => {
    const yPos = level * FLOOR_HEIGHT;
    
    let color = "#3b82f6";
    if (damage === 'moderate') color = "#eab308";
    if (damage === 'critical') color = "#ef4444";

    const isOnFire = fireFloors.includes(level);

    return (
      <group position={[displacement * 10, yPos, 0]}>
        {/* Floor Slab */}
        <Box args={[BUILDING_WIDTH, 0.4, BUILDING_DEPTH]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={ageTint} roughness={0.7} metalness={0.2} transparent opacity={ageOpacity} />
        </Box>

        {/* Floor Number Label */}
        <Text
          position={[BUILDING_WIDTH/2 + 0.5, 0, BUILDING_DEPTH/2]}
          fontSize={0.6}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
        >
          FL {level}
        </Text>

        {/* Reinforcement Visualization */}
        {retrofit === 'bracing' && (
          <group>
            {/* Front Bracing */}
            <mesh rotation={[0, 0, Math.atan(FLOOR_HEIGHT/BUILDING_WIDTH)]} position={[0, -FLOOR_HEIGHT/2, BUILDING_DEPTH/2]}>
              <boxGeometry args={[Math.sqrt(FLOOR_HEIGHT**2 + BUILDING_WIDTH**2), 0.15, 0.15]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, -Math.atan(FLOOR_HEIGHT/BUILDING_WIDTH)]} position={[0, -FLOOR_HEIGHT/2, BUILDING_DEPTH/2]}>
              <boxGeometry args={[Math.sqrt(FLOOR_HEIGHT**2 + BUILDING_WIDTH**2), 0.15, 0.15]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {retrofit === 'concrete-core' && (
          <Box args={[BUILDING_WIDTH / 2.5, FLOOR_HEIGHT, BUILDING_DEPTH / 2.5]} position={[0, -FLOOR_HEIGHT/2, 0]}>
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </Box>
        )}

        {retrofit === 'damper' && (
          <group position={[0, -FLOOR_HEIGHT/2, 0]}>
            <mesh rotation={[0, 0, Math.PI/4]}>
              <cylinderGeometry args={[0.05, 0.05, FLOOR_HEIGHT * 0.8]} />
              <meshStandardMaterial color="#f97316" metalness={0.8} />
            </mesh>
          </group>
        )}

        {level >= 0 && (
          <>
            <Column x={-BUILDING_WIDTH/2 + 0.5} z={-BUILDING_DEPTH/2 + 0.5} height={FLOOR_HEIGHT} color={color} />
            <Column x={BUILDING_WIDTH/2 - 0.5} z={-BUILDING_DEPTH/2 + 0.5} height={FLOOR_HEIGHT} color={color} />
            <Column x={-BUILDING_WIDTH/2 + 0.5} z={BUILDING_DEPTH/2 - 0.5} height={FLOOR_HEIGHT} color={color} />
            <Column x={BUILDING_WIDTH/2 - 0.5} z={BUILDING_DEPTH/2 - 0.5} height={FLOOR_HEIGHT} color={color} />
          </>
        )}

        {/* Fire visualization */}
        {isOnFire && (
          <pointLight position={[0, 1, 0]} color="#ff4400" intensity={2} distance={8} />
        )}
      </group>
    );
  };

  const Column = ({ x, z, height, color }: { x: number, z: number, height: number, color: string }) => (
    <Box args={[COL_WIDTH, height, COL_WIDTH]} position={[x, -height/2, z]} castShadow>
      <meshStandardMaterial color={color} transparent opacity={ageOpacity} />
    </Box>
  );

  return (
    <group ref={groupRef}>
      {/* Ground with wave effect */}
      <group ref={waveRef}>
        <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <meshStandardMaterial color="#1e293b" />
        </Plane>
        
        {/* Wave visualization rings */}
        {waveProgress > 0 && Array.from({ length: 5 }).map((_, i) => {
          const radius = waveProgress * 50 * (i + 1) / 5;
          return (
            <mesh key={i} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[radius - 0.5, radius + 0.5, 64]} />
              <meshBasicMaterial 
                color={i === 0 ? "#22d3ee" : i < 2 ? "#f97316" : "#ef4444"} 
                transparent 
                opacity={Math.max(0, 0.5 - i * 0.1)} 
              />
            </mesh>
          );
        })}
      </group>
      
      {/* Grid helper */}
      <gridHelper args={[100, 20, "#334155", "#1e293b"]} position={[0, 0.01, 0]} />
      
      {/* Base */}
      <Box args={[BUILDING_WIDTH + 2, 0.5, BUILDING_DEPTH + 2]} position={[0, 0.25, 0]}>
         <meshStandardMaterial color="#334155" />
      </Box>

      {/* Dynamic Floors */}
      {Array.from({ length: floors }).map((_, i) => (
        <Floor 
          key={i} 
          level={i + 1} 
          displacement={displacements[i] || 0}
          damage={damageLevels[i] || 'safe'} 
          retrofit={retrofits[i] || 'none'}
        />
      ))}
    </group>
  );
};

export default Building3D;
