"use client";
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface Box3DProps {
    width?: number;
    height?: number;
    depth?: number;
    topTexture?: string;
    sideColor?: string;
    customText?: string;
    textColor?: string;
    boxType?: 'standard' | 'lid-base' | 'drawer';
    isOpen?: boolean;
    materialTexture?: string;
    baseColor?: string;
}

function StandardBox({ width, height, depth, materials, isOpen }: any) {
    const hingeRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (hingeRef.current) {
            const targetRotation = isOpen ? -Math.PI * 0.7 : 0;
            hingeRef.current.rotation.x = THREE.MathUtils.lerp(hingeRef.current.rotation.x, targetRotation, 0.1);
        }
    });

    return (
        <group>
            {/* Hollow Base */}
            <group position={[0, 0, 0]}>
                {/* Bottom */}
                <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[width, depth]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Back */}
                <mesh position={[0, 0, -depth / 2]} receiveShadow>
                    <planeGeometry args={[width, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Front - with texture mapping */}
                <mesh position={[0, 0, depth / 2]} receiveShadow material={materials[4]}>
                    <planeGeometry args={[width, height]} />
                </mesh>
                {/* Left */}
                <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                    <planeGeometry args={[depth, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Right */}
                <mesh position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                    <planeGeometry args={[depth, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Lid / Flap with hinge at the back */}
            <group ref={hingeRef} position={[0, height / 2, -depth / 2]}>
                <mesh position={[0, 0, depth / 2]} material={materials} castShadow>
                    <boxGeometry args={[width, 0.04, depth]} />
                </mesh>
            </group>
        </group>
    );
}

function LidBaseBox({ width, height, depth, materials, isOpen }: any) {
    const lidRef = useRef<THREE.Mesh>(null);
    const lidHeight = height * 0.15;

    useFrame(() => {
        if (lidRef.current) {
            const targetY = isOpen ? height * 0.8 : height * 0.46;
            const targetRotation = isOpen ? -0.2 : 0;
            const targetZ = isOpen ? -depth * 0.3 : 0;

            lidRef.current.position.y = THREE.MathUtils.lerp(lidRef.current.position.y, targetY, 0.1);
            lidRef.current.position.z = THREE.MathUtils.lerp(lidRef.current.position.z, targetZ, 0.1);
            lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, 0.1);
        }
    });

    return (
        <group>
            {/* Hollow Base */}
            <group position={[0, -0.01, 0]}>
                {/* Bottom */}
                <mesh position={[0, -height * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <planeGeometry args={[width * 0.95, depth * 0.95]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Sides */}
                <mesh position={[0, 0, -depth * 0.475]} receiveShadow>
                    <planeGeometry args={[width * 0.95, height * 0.9]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0, depth * 0.475]} receiveShadow>
                    <planeGeometry args={[width * 0.95, height * 0.9]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[-width * 0.475, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                    <planeGeometry args={[depth * 0.95, height * 0.9]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[width * 0.475, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                    <planeGeometry args={[depth * 0.95, height * 0.9]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Lid */}
            <mesh
                ref={lidRef}
                position={[0, height * 0.46, 0]}
                material={materials}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[width, lidHeight, depth]} />
            </mesh>
        </group>
    );
}

function DrawerBox({ width, height, depth, materials, isOpen }: any) {
    const trayGroupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (trayGroupRef.current) {
            const targetZ = isOpen ? depth * 0.7 : 0;
            trayGroupRef.current.position.z = THREE.MathUtils.lerp(trayGroupRef.current.position.z, targetZ, 0.1);
        }
    });

    return (
        <group>
            {/* Outer Sleeve - We use a group of planes to make it hollow */}
            <group>
                {/* Top */}
                <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width, depth]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Bottom */}
                <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width, depth]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Left */}
                <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <planeGeometry args={[depth, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Right */}
                <mesh position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
                    <planeGeometry args={[depth, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
                {/* Back */}
                <mesh position={[0, 0, -depth / 2]}>
                    <planeGeometry args={[width, height]} />
                    <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                </mesh>
            </group>

            {/* Inner Tray Group */}
            <group ref={trayGroupRef}>
                {/* Tray Body - Hollow */}
                <group position={[0, -height * 0.05, 0]}>
                    <mesh position={[0, -height * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[width * 0.9, depth * 0.94]} />
                        <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[0, 0, -depth * 0.47]} receiveShadow>
                        <planeGeometry args={[width * 0.9, height * 0.8]} />
                        <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[-width * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                        <planeGeometry args={[depth * 0.94, height * 0.8]} />
                        <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh position={[width * 0.45, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                        <planeGeometry args={[depth * 0.94, height * 0.8]} />
                        <meshStandardMaterial color={materials[0].color} side={THREE.DoubleSide} />
                    </mesh>
                </group>
                {/* Front face of tray with texture */}
                <mesh position={[0, 0, depth * 0.49]} material={materials[4]} castShadow receiveShadow>
                    <boxGeometry args={[width * 0.96, height * 0.96, 0.02]} />
                </mesh>
            </group>
        </group>
    );
}

function BoxModel({
    width = 4,
    height = 2,
    depth = 4,
    topTexture,
    sideColor = "#F9F1E7",
    customText,
    textColor = "#4A4A4A",
    boxType = 'standard',
    isOpen = false,
    materialTexture,
    baseColor
}: any) {
    const groupRef = useRef<THREE.Group>(null);
    const [dynamicTexture, setDynamicTexture] = useState<THREE.Texture | null>(null);

    const baseTexture = topTexture ? (useLoader(THREE.TextureLoader, topTexture) as THREE.Texture) : null;
    const materialMap = materialTexture ? (useLoader(THREE.TextureLoader, materialTexture) as THREE.Texture) : null;

    if (materialMap) {
        materialMap.wrapS = materialMap.wrapT = THREE.RepeatWrapping;
        // Adjust tiling based on dimensions to keep texture scale consistent
        const repeatX = Math.max(1, Math.floor(width / 3));
        const repeatY = Math.max(1, Math.floor(depth / 3));
        materialMap.repeat.set(repeatX, repeatY);
    }

    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = sideColor;
            ctx.fillRect(0, 0, 1024, 1024);

            if (baseTexture && baseTexture.image) {
                ctx.drawImage(baseTexture.image as HTMLImageElement, 0, 0, 1024, 1024);
            }

            if (customText) {
                ctx.fillStyle = textColor;
                ctx.font = 'bold 80px Playfair Display, serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(customText, 512, 512);
            }

            const newTexture = new THREE.CanvasTexture(canvas);
            newTexture.needsUpdate = true;
            setDynamicTexture(newTexture);
        }
    }, [baseTexture, customText, textColor, sideColor]);

    const materials = useMemo(() => {
        const materialConfig = {
            color: sideColor || baseColor || "#FFFFFF",
            map: materialMap,
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.1
        };

        return [
            new THREE.MeshStandardMaterial(materialConfig), // right
            new THREE.MeshStandardMaterial(materialConfig), // left
            new THREE.MeshStandardMaterial({
                ...materialConfig,
                map: dynamicTexture || baseTexture || materialMap,
                color: (dynamicTexture || baseTexture) ? "white" : materialConfig.color
            }), // top
            new THREE.MeshStandardMaterial(materialConfig), // bottom
            new THREE.MeshStandardMaterial({
                ...materialConfig,
                map: (boxType === 'drawer' || boxType === 'standard') ? dynamicTexture || baseTexture || materialMap : materialMap,
                color: (dynamicTexture || baseTexture) ? "white" : materialConfig.color
            }), // front
            new THREE.MeshStandardMaterial(materialConfig), // back
        ];
    }, [dynamicTexture, baseTexture, sideColor, baseColor, materialMap, boxType]);

    useFrame((state) => {
        if (groupRef.current) {
            // Initial entrance animation
            groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
            // Continuous gentle rotation at a good constant angle for clarity
            if (groupRef.current.rotation.y === 0) {
                groupRef.current.rotation.y = Math.PI / 4.5;
            }
            groupRef.current.rotation.y += 0.001;
        }
    });

    const sW = width / 10;
    const sH = height / 10;
    const sD = depth / 10;

    return (
        <group ref={groupRef} scale={[0, 0, 0]}>
            <group rotation={[0, 0, 0]}>
                {boxType === 'standard' && <StandardBox width={sW} height={sH} depth={sD} materials={materials} isOpen={isOpen} />}
                {boxType === 'lid-base' && <LidBaseBox width={sW} height={sH} depth={sD} materials={materials} isOpen={isOpen} />}
                {boxType === 'drawer' && <DrawerBox width={sW} height={sH} depth={sD} materials={materials} isOpen={isOpen} />}
            </group>
        </group>
    );
}

export default function Box3D({
    width,
    height,
    depth,
    topTexture,
    sideColor,
    customText,
    textColor,
    boxType,
    isOpen,
    materialTexture,
    baseColor
}: Box3DProps) {
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '450px', background: 'transparent', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[6, 5, 8]} fov={35} />
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -5, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Stage adjustCamera={true} intensity={1} environment="city" shadows={false} center={{}}>
                        <BoxModel
                            width={width}
                            height={height}
                            depth={depth}
                            topTexture={topTexture}
                            sideColor={sideColor}
                            customText={customText}
                            textColor={textColor}
                            boxType={boxType || 'standard'}
                            isOpen={isOpen}
                            materialTexture={materialTexture}
                            baseColor={baseColor}
                        />
                    </Stage>
                </Suspense>

                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
                <OrbitControls
                    makeDefault
                    enablePan={false}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    minDistance={4}
                    maxDistance={15}
                />
            </Canvas>
        </div>
    );
}
