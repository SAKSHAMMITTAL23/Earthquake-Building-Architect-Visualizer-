import { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";
import { type Floor } from "@shared/schema";

interface BuildingViewerProps {
  floors: Floor[];
  selectedFloorId: number | null;
  onSelectFloor: (id: number | null) => void;
}

function FloorMesh({ 
  floor, 
  yPosition, 
  isSelected, 
  onClick 
}: { 
  floor: Floor; 
  yPosition: number; 
  isSelected: boolean; 
  onClick: () => void 
}) {
  const [hovered, setHovered] = useState(false);

  // Smooth hover effect color
  const color = useMemo(() => {
    const baseColor = new THREE.Color(floor.color);
    if (isSelected) return "#3b82f6"; // Primary blue
    if (hovered) return baseColor.clone().offsetHSL(0, 0, -0.1);
    return baseColor;
  }, [floor.color, isSelected, hovered]);

  return (
    <group position={[0, yPosition + floor.height / 2, 0]}>
      {/* The Floor Block */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <boxGeometry args={[floor.width, floor.height, floor.depth]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.1}
          transparent={true}
          opacity={0.95}
        />
        {/* Selection highlight outline */}
        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(floor.width, floor.height, floor.depth)]} />
            <lineBasicMaterial color="white" linewidth={2} />
          </lineSegments>
        )}
      </mesh>

      {/* Floating Label */}
      <group position={[floor.width / 2 + 1, 0, floor.depth / 2 + 1]}>
        <Text
          color="black" // default
          anchorX="left"
          anchorY="middle"
          fontSize={1.2}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          outlineWidth={0.05}
          outlineColor="white"
        >
          {floor.label}
          <meshBasicMaterial toneMapped={false} />
        </Text>
        <Text
           position={[0, -0.8, 0]}
           color="#666"
           anchorX="left"
           anchorY="middle"
           fontSize={0.5}
           font="https://fonts.gstatic.com/s/jetbrainsmono/v13/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0Pn5.woff"
        >
           #{floor.floorNumber} • {floor.height}m
        </Text>
      </group>
    </group>
  );
}

export function BuildingViewer({ floors, selectedFloorId, onSelectFloor }: BuildingViewerProps) {
  // Sort floors by floorNumber to stack correctly
  const sortedFloors = [...floors].sort((a, b) => a.floorNumber - b.floorNumber);

  return (
    <div className="w-full h-full bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative">
      <Canvas
        camera={{ position: [30, 20, 30], fov: 45 }}
        shadows
        dpr={[1, 2]} // Support high-res displays
      >
        <color attach="background" args={["#f8fafc"]} />
        <fog attach="fog" args={['#f8fafc', 30, 90]} />

        {/* Lighting & Environment */}
        <ambientLight intensity={0.5} />
        <spotLight position={[50, 50, 20]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Environment preset="city" />

        <group position={[0, -5, 0]}>
          {/* Base Grid */}
          <Grid 
            renderOrder={-1} 
            position={[0, 0, 0]} 
            infiniteGrid 
            cellSize={2} 
            sectionSize={10} 
            fadeDistance={50} 
            sectionColor="#cbd5e1" 
            cellColor="#e2e8f0" 
          />
          
          {/* Floor Stacking Logic */}
          {sortedFloors.reduce((acc, floor, index) => {
            const yPosition = index === 0 ? 0 : acc.currentHeight;
            
            acc.elements.push(
              <FloorMesh
                key={floor.id}
                floor={floor}
                yPosition={yPosition}
                isSelected={selectedFloorId === floor.id}
                onClick={() => onSelectFloor(floor.id)}
              />
            );
            
            acc.currentHeight += floor.height;
            return acc;
          }, { elements: [] as JSX.Element[], currentHeight: 0 }).elements}

          <ContactShadows position={[0, 0, 0]} scale={50} blur={2} far={10} opacity={0.5} />
        </group>

        <OrbitControls 
          makeDefault 
          minPolarAngle={0} 
          maxPolarAngle={Math.PI / 2.1} 
          enablePan={true}
          zoomSpeed={0.8}
          rotateSpeed={0.8}
        />
      </Canvas>
      
      {/* Canvas Overlay Instructions */}
      <div className="absolute bottom-6 left-6 pointer-events-none select-none">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="font-display font-bold text-sm text-foreground">Interactive View</h4>
          <p className="text-xs text-muted-foreground mt-1">Left Click to rotate • Scroll to zoom • Right Click to pan</p>
          <p className="text-xs text-muted-foreground">Click a floor to edit properties</p>
        </div>
      </div>
    </div>
  );
}
