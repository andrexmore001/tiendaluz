"use client";
import { Suspense, useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, ContactShadows, Text } from "@react-three/drei";
import * as THREE from "three";
import { Plus, Minus } from "lucide-react";
import { Material } from "@/context/SettingsContext";

interface Box3DProps {
  isOpen?: boolean;
  width?: number;
  height?: number;
  depth?: number;
  materialData?: Material;
  baseColor?: string;
  text?: string;
}

function IndustrialBox({
  width = 30,
  height = 20,
  depth = 30,
  materialData,
  baseColor,
  isOpen = false,
  text = ""
}: Box3DProps) {

  const scaleFactor = 10;

  const w = width / scaleFactor;
  const h = height / scaleFactor;
  const d = depth / scaleFactor;

  const lidHeight = h * 0.25;
  const baseHeight = h - lidHeight;

  const thickness =
    ((3) / 10) / scaleFactor;

  /* ================= MATERIAL ================= */

  const material = useMemo(() => {
    const loader = new THREE.TextureLoader();
    let map: THREE.Texture | null = null;

    if (materialData?.textureUrl) map = loader.load(materialData.textureUrl);

    if (map) {
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
      map.repeat.set(width / 15, depth / 15);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 8;
    }

    return new THREE.MeshStandardMaterial({
      map: map ?? undefined,
      color: map ? "#ffffff" : baseColor || "#e5e5e5",
      roughness: 0.75,
      metalness: 0.05,
    });
  }, [materialData, baseColor, width, depth]);

  /* ================= BISAGRA ================= */

  const isLongEdge = true; // Default to long edge hinge

  const lidRef = useRef<THREE.Group>(null);
  const currentRotation = useRef(0);
  const targetRotation = isOpen ? Math.PI / 1.8 : 0;

  useFrame(() => {
    if (!lidRef.current) return;

    currentRotation.current = THREE.MathUtils.lerp(
      currentRotation.current,
      targetRotation,
      0.08
    );

    if (isLongEdge) {
      lidRef.current.rotation.x = -currentRotation.current;
    } else {
      lidRef.current.rotation.z = currentRotation.current;
    }
  });

  /* ================= ALETAS ================= */

  // AHORA DEPENDEN DE ALTURA TOTAL REAL
  const flapHeight = h * 0.25;
  const tuckHeight = h * 0.15;
  const flapWidth = w + (-0.2) / scaleFactor;
  /* ----- TRAPECIO GEOMETRY ----- */

  const trapezoidGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    const topWidth = flapWidth * 0.6;
    const bottomWidth = flapWidth;

    shape.moveTo(-bottomWidth / 2, 0);
    shape.lineTo(bottomWidth / 2, 0);
    shape.lineTo(topWidth / 2, flapHeight);
    shape.lineTo(-topWidth / 2, flapHeight);
    shape.closePath();

    const geometry = new THREE.ShapeGeometry(shape);
    return geometry;
  }, [flapWidth, flapHeight]);
  return (
    <group>

      {/* ===== BASE ===== */}

      <mesh material={material} position={[0, thickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thickness, d]} />
      </mesh>

      {/* FRONT - siempre en la base por ahora */}
      <mesh material={material} position={[0, baseHeight / 2, d / 2 - thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, baseHeight, thickness]} />
      </mesh>

      <mesh material={material} position={[0, baseHeight / 2, -d / 2 + thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, baseHeight, thickness]} />
      </mesh>

      <mesh material={material} position={[-w / 2 + thickness / 2, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, baseHeight, d]} />
      </mesh>

      <mesh material={material} position={[w / 2 - thickness / 2, baseHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, baseHeight, d]} />
      </mesh>

      {/* ALETAS LATERALES - base por defecto */}
      <mesh material={material} position={[-w / 2 - thickness / 2, baseHeight + flapHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, flapHeight, d]} />
      </mesh>
      <mesh material={material} position={[w / 2 + thickness / 2, baseHeight + flapHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[thickness, flapHeight, d]} />
      </mesh>

      {/* Tuck frontal - base por defecto */}
      <mesh material={material} position={[0, baseHeight + tuckHeight / 2, d / 2 + thickness / 2]} castShadow receiveShadow>
        <boxGeometry args={[flapWidth, tuckHeight, thickness]} />
      </mesh>

      {/* ===== TAPA ===== */}

      <group
        ref={lidRef}
        position={
          isLongEdge
            ? [0, baseHeight + thickness / 2, -d / 2]
            : [-w / 2, baseHeight + thickness / 2, 0]
        }
      >
        <mesh
          material={material}
          position={
            isLongEdge
              ? [0, 0, d / 2]
              : [w / 2, 0, 0]
          }
          castShadow
          receiveShadow
        >
          <boxGeometry args={[w, thickness, d]} />
        </mesh>

        {/* TEXT ON LID */}
        {text && (
          <Text
            position={
              isLongEdge
                ? [0, thickness / 2 + 0.01, d / 2]
                : [w / 2, thickness / 2 + 0.01, 0]
            }
            rotation={
              isLongEdge
                ? [-Math.PI / 2, 0, 0]
                : [-Math.PI / 2, 0, Math.PI / 2]
            }
            fontSize={0.2}
            color="#333"
            anchorX="center"
            anchorY="middle"
            maxWidth={isLongEdge ? w * 0.8 : d * 0.8}
            font="/fonts/Inter-Bold.ttf" // Fallback to default if not found
          >
            {text}
          </Text>
        )}

        {/* ALETAS EN TAPA - removidas para estandarizar en base por ahora o viceversa */}

      </group>

      {/* ===== ALETAS EN BASE ===== */}
      <>
        {/* Lateral izquierda */}
        <mesh
          material={material}
          position={[-w / 2 - thickness / 2, baseHeight + flapHeight / 2, 0]}
        >
          <boxGeometry args={[thickness, flapHeight, d]} />
        </mesh>
        {/* Lateral derecha */}
        <mesh
          material={material}
          position={[w / 2 + thickness / 2, baseHeight + flapHeight / 2, 0]}
        >
          <boxGeometry args={[thickness, flapHeight, d]} />
        </mesh>
        {/* Tuck frontal */}
        <mesh
          material={material}
          position={[0, baseHeight + tuckHeight / 2, d / 2 + thickness / 2]}
        >
          <boxGeometry args={[flapWidth, tuckHeight, thickness]} />
        </mesh>
      </>

    </group>
  );
}

/* ================= CAMERA ================= */

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

/* ================= MAIN ================= */

export default function Box3D(props: Box3DProps) {

  const [zoom, setZoom] = useState(1);

  return (
    <div style={{
      width: "100%",
      height: "100%",
      minHeight: "450px",
      borderRadius: "16px",
      overflow: "hidden",
      position: "relative",
    }}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 7]} />
        <CameraController zoom={zoom} />

        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-6, 5, -6]} intensity={0.6} />

        <Suspense fallback={null}>
          <IndustrialBox {...props} />
        </Suspense>

        <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={10} blur={2} />
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>

      <div style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}>
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}>
          <Plus size={18} />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
          <Minus size={18} />
        </button>
      </div>
    </div>
  );
}