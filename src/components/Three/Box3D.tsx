"use client";
import { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Plus, Minus } from "lucide-react";
import { Material } from "@/context/SettingsContext";

interface Box3DProps {
  isOpen?: boolean;
  width?: number;
  height?: number;
  depth?: number;
  materialData?: Material;
  customMaterialTexture?: string;
  baseColor?: string;
  hingeEdge?: "long" | "short";
}

function IndustrialBox({
  width = 30,
  height = 20,
  depth = 30,
  materialData,
  customMaterialTexture,
  baseColor,
  isOpen = false,
  hingeEdge = "long"
}: Box3DProps) {

  const groupRef = useRef<THREE.Group>(null);

  const scaleFactor = 10;

  const w = width / scaleFactor;
  const h = height / scaleFactor;
  const d = depth / scaleFactor;

  const lidHeight = h * 0.25;
  const baseHeight = h - lidHeight;

  const thickness =
    ((materialData?.thickness_mm ?? 3) / 10) / scaleFactor;

  const material = useMemo(() => {
    const loader = new THREE.TextureLoader();
    let map: THREE.Texture | null = null;

    if (customMaterialTexture) {
      map = loader.load(customMaterialTexture);
    } else if (materialData?.textureUrl) {
      map = loader.load(materialData.textureUrl);
    }

    if (map) {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(width / 15, depth / 15);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
    }

    return new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map
        ? "#ffffff"
        : materialData?.baseColor || baseColor || "#e5e5e5",
      roughness: materialData?.roughness ?? 0.75,
      metalness: materialData?.metalness ?? 0.05,
    });
  }, [materialData, customMaterialTexture, baseColor, width, depth]);

  return (
    <group ref={groupRef}>

      {/* ===== BASE HUECA REAL ===== */}

      {/* Piso */}
      <mesh
        material={material}
        position={[0, thickness / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, thickness, d]} />
      </mesh>

      {/* Pared frontal */}
      <mesh
        material={material}
        position={[0, baseHeight / 2, d / 2 - thickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, baseHeight, thickness]} />
      </mesh>

      {/* Pared trasera */}
      <mesh
        material={material}
        position={[0, baseHeight / 2, -d / 2 + thickness / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[w, baseHeight, thickness]} />
      </mesh>

      {/* Pared izquierda */}
      <mesh
        material={material}
        position={[-w / 2 + thickness / 2, baseHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[thickness, baseHeight, d]} />
      </mesh>

      {/* Pared derecha */}
      <mesh
        material={material}
        position={[w / 2 - thickness / 2, baseHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[thickness, baseHeight, d]} />
      </mesh>

      {/* ===== TAPA CON BISAGRA CONFIGURABLE ===== */}

      <group
        position={
          hingeEdge === "long"
            ? [0, baseHeight, -d / 2]
            : [-w / 2, baseHeight, 0]
        }
        rotation={
          hingeEdge === "long"
            ? [isOpen ? -Math.PI / 1.8 : 0, 0, 0]
            : [0, 0, isOpen ? Math.PI / 1.8 : 0]
        }
      >
        <mesh
          material={material}
          position={
            hingeEdge === "long"
              ? [0, thickness / 2, d / 2]
              : [w / 2, thickness / 2, 0]
          }
          castShadow
          receiveShadow
        >
          <boxGeometry args={[w, thickness, d]} />
        </mesh>
      </group>

    </group>
  );
}

function CameraController({ zoom }: { zoom: number }) {
  const { camera } = useThree();

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 35 / zoom;
      camera.updateProjectionMatrix();
    }
  }, [zoom, camera]);

  return null;
}

export default function Box3D({
  width = 30,
  height = 20,
  depth = 30,
  materialData,
  customMaterialTexture,
  baseColor,
  isOpen = false,
  hingeEdge = "long"
}: Box3DProps) {

  const [zoom, setZoom] = useState(1);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "450px",
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 7]} />
        <CameraController zoom={zoom} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-6, 5, -6]} intensity={0.6} />

        <Suspense fallback={null}>
          <IndustrialBox
            width={width}
            height={height}
            depth={depth}
            materialData={materialData}
            customMaterialTexture={customMaterialTexture}
            baseColor={baseColor}
            isOpen={isOpen}
            hingeEdge={hingeEdge}
          />
        </Suspense>

        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={10} blur={2} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <button onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}>
          <Plus size={18} />
        </button>
        <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}>
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
}