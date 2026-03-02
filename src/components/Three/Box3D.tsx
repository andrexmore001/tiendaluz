"use client";
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Plus, Minus, Box, Layers, Trash2 } from 'lucide-react';

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
    hingeEdge?: 'long' | 'short';
    flapsLocation?: 'lid' | 'base';
}

function StandardBox({ width, height, depth, materials, isOpen, hingeEdge = 'long', flapsLocation = 'base' }: any) {
    const hingeRef = useRef<THREE.Group>(null);

    // Determine if we hinge on the Width side or Depth side
    const hingeOnWidth = useMemo(() => {
        const isWidthLonger = width >= depth;
        return hingeEdge === 'long' ? isWidthLonger : !isWidthLonger;
    }, [width, depth, hingeEdge]);

    useFrame(() => {
        if (hingeRef.current) {
            const targetRotation = isOpen ? -Math.PI * 0.7 : 0;
            if (hingeOnWidth) {
                hingeRef.current.rotation.x = THREE.MathUtils.lerp(hingeRef.current.rotation.x, targetRotation, 0.1);
                hingeRef.current.rotation.z = 0;
            } else {
                hingeRef.current.rotation.z = THREE.MathUtils.lerp(hingeRef.current.rotation.z, -targetRotation, 0.1);
                hingeRef.current.rotation.x = 0;
            }
        }
    });

    const hingePosition: [number, number, number] = hingeOnWidth
        ? [0, height / 2, -depth / 2]
        : [-width / 2, height / 2, 0];

    // Side Flaps Component - Now centered at [0,0,0]
    const SideFlaps = () => {
        const flapSize = (hingeOnWidth ? depth : width) * 0.25;
        const flapWidth = (hingeOnWidth ? depth : width) * 0.8;

        if (hingeOnWidth) {
            return (
                <>
                    {/* Left inner flap */}
                    <group position={[-width / 2 + 0.002, 0, 0]} rotation={[0, 0, isOpen ? (flapsLocation === 'lid' ? 0.5 : -0.5) : (flapsLocation === 'lid' ? 1.57 : -1.57)]}>
                        <mesh position={[0.01, flapSize / 2, 0]} material={materials[1]}>
                            <boxGeometry args={[0.01, flapSize, flapWidth]} />
                        </mesh>
                    </group>
                    {/* Right inner flap */}
                    <group position={[width / 2 - 0.002, 0, 0]} rotation={[0, 0, isOpen ? (flapsLocation === 'lid' ? -0.5 : 0.5) : (flapsLocation === 'lid' ? -1.57 : 1.57)]}>
                        <mesh position={[-0.01, flapSize / 2, 0]} material={materials[0]}>
                            <boxGeometry args={[0.01, flapSize, flapWidth]} />
                        </mesh>
                    </group>
                </>
            );
        } else {
            return (
                <>
                    {/* Back inner flap */}
                    <group position={[0, 0, -depth / 2 + 0.002]} rotation={[isOpen ? 0.5 : 1.57, 0, 0]}>
                        <mesh position={[0, flapSize / 2, 0.01]} material={materials[5]}>
                            <boxGeometry args={[flapWidth, flapSize, 0.01]} />
                        </mesh>
                    </group>
                    {/* Front inner flap */}
                    <group position={[0, 0, depth / 2 - 0.002]} rotation={[isOpen ? -0.5 : -1.57, 0, 0]}>
                        <mesh position={[0, flapSize / 2, -0.01]} material={materials[4]}>
                            <boxGeometry args={[flapWidth, flapSize, 0.01]} />
                        </mesh>
                    </group>
                </>
            );
        }
    };

    return (
        <group>
            {/* Hollow Base */}
            <group position={[0, 0, 0]}>
                {/* Bottom */}
                <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials[3]}>
                    <planeGeometry args={[width, depth]} />
                </mesh>
                {/* Back */}
                <mesh position={[0, 0, -depth / 2]} receiveShadow material={materials[5]}>
                    <planeGeometry args={[width, height]} />
                </mesh>
                {/* Front */}
                <mesh position={[0, 0, depth / 2]} receiveShadow material={materials[4]}>
                    <planeGeometry args={[width, height]} />
                </mesh>
                {/* Left */}
                <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={materials[1]}>
                    <planeGeometry args={[depth, height]} />
                </mesh>
                {/* Right */}
                <mesh position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={materials[0]}>
                    <planeGeometry args={[depth, height]} />
                </mesh>

                {/* Side Flaps on BASE */}
                {flapsLocation === 'base' && (
                    <group position={[0, height / 2, 0]}>
                        <SideFlaps />
                    </group>
                )}
            </group>

            {/* Lid / Flap */}
            <group ref={hingeRef} position={hingePosition}>
                <mesh
                    position={hingeOnWidth ? [0, 0, depth / 2] : [width / 2, 0, 0]}
                    material={materials}
                    castShadow
                >
                    <boxGeometry args={[width, 0.01, depth]} />
                </mesh>

                {/* Side Flaps on LID */}
                {flapsLocation === 'lid' && (
                    <group
                        position={hingeOnWidth ? [0, -0.005, depth / 2] : [width / 2, -0.005, 0]}
                        rotation={hingeOnWidth ? [Math.PI, 0, 0] : [0, 0, -Math.PI]}
                    >
                        <SideFlaps />
                    </group>
                )}

                {/* Tuck Flap (Front of the lid) */}
                <group
                    position={hingeOnWidth ? [0, 0, depth] : [width, 0, 0]}
                    rotation={hingeOnWidth ? [isOpen ? 0.6 : -1.57, 0, 0] : [0, 0, isOpen ? -0.6 : 1.57]}
                >
                    <mesh material={materials} position={hingeOnWidth ? [0, 0.025, 0] : [0.025, 0, 0]}>
                        <boxGeometry args={[hingeOnWidth ? width * 0.92 : 0.01, 0.05, hingeOnWidth ? 0.01 : depth * 0.92]} />
                    </mesh>
                </group>
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
                <mesh position={[0, -height * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials[3]}>
                    <planeGeometry args={[width * 0.95, depth * 0.95]} />
                </mesh>
                {/* Sides */}
                <mesh position={[0, 0, -depth * 0.475]} receiveShadow material={materials[5]}>
                    <planeGeometry args={[width * 0.95, height * 0.9]} />
                </mesh>
                <mesh position={[0, 0, depth * 0.475]} receiveShadow material={materials[4]}>
                    <planeGeometry args={[width * 0.95, height * 0.9]} />
                </mesh>
                <mesh position={[-width * 0.475, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={materials[1]}>
                    <planeGeometry args={[depth * 0.95, height * 0.9]} />
                </mesh>
                <mesh position={[width * 0.475, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={materials[0]}>
                    <planeGeometry args={[depth * 0.95, height * 0.9]} />
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
            {/* Outer Sleeve */}
            <group>
                <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials[2]}>
                    <planeGeometry args={[width, depth]} />
                </mesh>
                <mesh position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials[3]}>
                    <planeGeometry args={[width, depth]} />
                </mesh>
                <mesh position={[-width / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materials[1]}>
                    <planeGeometry args={[depth, height]} />
                </mesh>
                <mesh position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={materials[0]}>
                    <planeGeometry args={[depth, height]} />
                </mesh>
                <mesh position={[0, 0, -depth / 2]} material={materials[5]}>
                    <planeGeometry args={[width, height]} />
                </mesh>
            </group>

            {/* Inner Tray */}
            <group ref={trayGroupRef}>
                <group position={[0, -height * 0.05, 0]}>
                    <mesh position={[0, -height * 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={materials[3]}>
                        <planeGeometry args={[width * 0.9, depth * 0.94]} />
                    </mesh>
                    <mesh position={[0, 0, -depth * 0.47]} receiveShadow material={materials[5]}>
                        <planeGeometry args={[width * 0.9, height * 0.8]} />
                    </mesh>
                    <mesh position={[-width * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow material={materials[1]}>
                        <planeGeometry args={[depth * 0.94, height * 0.8]} />
                    </mesh>
                    <mesh position={[width * 0.45, 0, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow material={materials[0]}>
                        <planeGeometry args={[depth * 0.94, height * 0.8]} />
                    </mesh>
                </group>
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
    baseColor,
    hingeEdge,
    flapsLocation
}: any) {
    const groupRef = useRef<THREE.Group>(null);
    const [dynamicTexture, setDynamicTexture] = useState<THREE.Texture | null>(null);
    const [baseTexture, setBaseTexture] = useState<THREE.Texture | null>(null);
    const [materialMap, setMaterialMap] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin('anonymous');

        if (topTexture) {
            loader.load(topTexture, (tex) => setBaseTexture(tex));
        } else {
            setBaseTexture(null);
        }

        if (materialTexture) {
            loader.load(materialTexture, (tex) => {
                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                const repeatX = Math.max(1, Math.floor(width / 3));
                const repeatY = Math.max(1, Math.floor(depth / 3));
                tex.repeat.set(repeatX, repeatY);
                setMaterialMap(tex);
            });
        } else {
            setMaterialMap(null);
        }
    }, [topTexture, materialTexture, width, depth]);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = sideColor || baseColor || "#FFFFFF";
            ctx.fillRect(0, 0, 1024, 1024);

            if (materialMap && materialMap.image) {
                ctx.drawImage(materialMap.image as HTMLImageElement, 0, 0, 1024, 1024);
            }

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
    }, [baseTexture, materialMap, customText, textColor, sideColor, baseColor]);

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

    useFrame(() => {
        if (groupRef.current) {
            if (groupRef.current.rotation.y === 0) groupRef.current.rotation.y = Math.PI / 4.5;
            groupRef.current.rotation.y += 0.001;
        }
    });

    const sW = width / 10;
    const sH = height / 10;
    const sD = depth / 10;

    return (
        <group ref={groupRef}>
            {boxType === 'standard' && (
                <StandardBox
                    width={sW}
                    height={sH}
                    depth={sD}
                    materials={materials}
                    isOpen={isOpen}
                    hingeEdge={hingeEdge}
                    flapsLocation={flapsLocation || 'base'}
                />
            )}
            {boxType === 'lid-base' && <LidBaseBox width={sW} height={sH} depth={sD} materials={materials} isOpen={isOpen} />}
            {boxType === 'drawer' && <DrawerBox width={sW} height={sH} depth={sD} materials={materials} isOpen={isOpen} />}
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
    baseColor,
    hingeEdge,
    flapsLocation
}: Box3DProps) {
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoom(prev => Math.min(prev + 0.2, 2.5));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.preventDefault();
        setZoom(prev => Math.max(prev - 0.2, 0.5));
    };

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '450px', background: 'transparent', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            <Canvas shadows={{ type: THREE.PCFShadowMap }} dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[6, 5, 8]} fov={35} />
                <CameraController zoom={zoom} />
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -5, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <Stage adjustCamera={true} intensity={1} shadows={false} center={{}}>
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
                            hingeEdge={hingeEdge}
                            flapsLocation={flapsLocation}
                        />
                    </Stage>
                </Suspense>

                <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
                <OrbitControls
                    makeDefault
                    enablePan={false}
                    enableZoom={false}
                    enableDamping={true}
                    dampingFactor={0.05}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                    minDistance={2}
                    maxDistance={20}
                />
            </Canvas>

            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 20
            }}>
                <button
                    onClick={handleZoomIn}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        color: 'var(--primary)'
                    }}
                    title="Acercar"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'white',
                        border: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        color: 'var(--primary)'
                    }}
                    title="Alejar"
                >
                    <Minus size={20} />
                </button>
            </div>
        </div>
    );
}
