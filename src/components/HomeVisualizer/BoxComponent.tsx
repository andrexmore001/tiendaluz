"use client";
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import gsap from 'gsap';
import { Text } from '@react-three/drei';

interface BoxComponentProps {
    isOpen: boolean;
    text: string;
    logoTexture: THREE.Texture | null;
}

export default function BoxComponent({ isOpen, text, logoTexture }: BoxComponentProps) {
    const groupRef = useRef<THREE.Group>(null);
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // Box parameters exactly as provided
    const params = useMemo(() => ({
        width: 27,
        length: 80,
        depth: 45,
        thickness: 1.2, // Significantly increased for more prominent corrugation
        fluteFreq: 60,  // High frequency for realistic corrugated pattern
        flapGap: 1,
        copyrightSize: [27, 10]
    }), []);

    // Animation state (synced with provided logic)
    const animated = useRef({
        openingAngle: 0.5 * Math.PI,
        flapAngles: {
            backHalf: {
                width: { top: 0, bottom: 0.5 * Math.PI },
                length: { top: 0, bottom: 0.5 * Math.PI },
            },
            frontHalf: {
                width: { top: 0, bottom: 0.5 * Math.PI },
                length: { top: 0, bottom: 0.5 * Math.PI },
            },
        },
    });

    // Refs for the panels to animate manually for performance if needed, 
    // but R3F state is cleaner. I'll use refs to match the provided GSAP logic.
    const panelsRef = useRef<any>({
        frontHalf: { width: { side: null, top: null, bottom: null }, length: { side: null, top: null, bottom: null } },
        backHalf: { width: { side: null, top: null, bottom: null }, length: { side: null, top: null, bottom: null } }
    });

    const updatePanelsTransform = () => {
        const refs = panelsRef.current;
        if (!refs.frontHalf.width.side) return;

        // Movement logic from original JS
        refs.frontHalf.width.side.position.x = 0.5 * params.length;
        refs.backHalf.width.side.position.x = -0.5 * params.length;
        refs.frontHalf.width.side.rotation.y = animated.current.openingAngle;
        refs.backHalf.width.side.rotation.y = animated.current.openingAngle;

        const cos = Math.cos(animated.current.openingAngle);
        refs.frontHalf.length.side.position.x = -0.5 * cos * params.width;
        refs.backHalf.length.side.position.x = 0.5 * cos * params.width;

        const sin = Math.sin(animated.current.openingAngle);
        refs.frontHalf.length.side.position.z = 0.5 * sin * params.width;
        refs.backHalf.length.side.position.z = -0.5 * sin * params.width;

        refs.frontHalf.width.top.rotation.x = -animated.current.flapAngles.frontHalf.width.top;
        refs.frontHalf.length.top.rotation.x = -animated.current.flapAngles.frontHalf.length.top;
        refs.frontHalf.width.bottom.rotation.x = animated.current.flapAngles.frontHalf.width.bottom;
        refs.frontHalf.length.bottom.rotation.x = animated.current.flapAngles.frontHalf.length.bottom;

        refs.backHalf.width.top.rotation.x = animated.current.flapAngles.backHalf.width.top;
        refs.backHalf.length.top.rotation.x = animated.current.flapAngles.backHalf.length.top;
        refs.backHalf.width.bottom.rotation.x = -animated.current.flapAngles.backHalf.width.bottom;
        refs.backHalf.length.bottom.rotation.x = -animated.current.flapAngles.backHalf.length.bottom;
    };

    useEffect(() => {
        timelineRef.current = gsap.timeline({
            paused: true,
            onUpdate: updatePanelsTransform,
        });

        timelineRef.current
            .to(animated.current, {
                duration: 1.2,
                openingAngle: 0.5 * Math.PI,
                ease: "power2.inOut",
            })
            .to(
                [
                    animated.current.flapAngles.backHalf.width,
                    animated.current.flapAngles.frontHalf.width,
                ],
                { duration: 0.6, bottom: 0.6 * Math.PI, ease: "back.in(3)" },
                0.9,
            )
            .to(
                animated.current.flapAngles.backHalf.length,
                { duration: 0.7, bottom: 0.5 * Math.PI, ease: "back.in(2)" },
                1.1,
            )
            .to(
                animated.current.flapAngles.frontHalf.length,
                { duration: 0.8, bottom: 0.49 * Math.PI, ease: "back.in(3)" },
                1.4,
            )
            .to(
                [
                    animated.current.flapAngles.backHalf.width,
                    animated.current.flapAngles.frontHalf.width,
                ],
                { duration: 0.6, top: 0.6 * Math.PI, ease: "back.in(3)" },
                1.4,
            )
            .to(
                animated.current.flapAngles.backHalf.length,
                { duration: 0.7, top: 0.5 * Math.PI, ease: "back.in(3)" },
                1.7,
            )
            .to(
                animated.current.flapAngles.frontHalf.length,
                { duration: 0.9, top: 0.49 * Math.PI, ease: "back.in(4)" },
                1.8,
            );

        updatePanelsTransform();
    }, [params]);

    useEffect(() => {
        if (isOpen) {
            timelineRef.current?.reverse();
        } else {
            timelineRef.current?.play();
        }
    }, [isOpen]);

    // Geometry creation logic
    const geometries = useMemo(() => {
        const createSideGeometry = (baseGeometry: THREE.BufferGeometry, size: number[], folds: boolean[], hasMiddleLayer: boolean) => {
            const geometriesToMerge: THREE.BufferGeometry[] = [];
            const getLayerGeometry = (offset: (v: number) => number) => {
                const layerGeometry = baseGeometry.clone();
                const positionAttr = layerGeometry.attributes.position;
                for (let i = 0; i < positionAttr.count; i++) {
                    const x = positionAttr.getX(i);
                    const y = positionAttr.getY(i);
                    let z = positionAttr.getZ(i) + offset(x);
                    let modifier = (c: number, s: number) => 1 - Math.pow(c / (0.5 * s), 10);
                    if ((x > 0 && folds[1]) || (x < 0 && folds[3])) z *= modifier(x, size[0]);
                    if ((y > 0 && folds[0]) || (y < 0 && folds[2])) z *= modifier(y, size[1]);
                    positionAttr.setXYZ(i, x, y, z);
                }
                return layerGeometry;
            };
            geometriesToMerge.push(getLayerGeometry((v) => -0.5 * params.thickness + 0.1 * Math.sin(params.fluteFreq * v)));
            geometriesToMerge.push(getLayerGeometry((v) => 0.5 * params.thickness + 0.1 * Math.sin(params.fluteFreq * v)));
            if (hasMiddleLayer) {
                geometriesToMerge.push(getLayerGeometry((v) => 0.5 * params.thickness * Math.sin(params.fluteFreq * v)));
            }
            const merged = mergeBufferGeometries(geometriesToMerge, false);
            if (!merged) {
                // Fallback to simple plane if merge fails
                const fallback = baseGeometry.clone();
                fallback.computeVertexNormals();
                return fallback;
            }
            merged.computeVertexNormals();
            return merged;
        };

        const results: Record<string, Record<string, any>> = { frontHalf: { width: {}, length: {} }, backHalf: { width: {}, length: {} } };

        ['frontHalf', 'backHalf'].forEach(half => {
            ['width', 'length'].forEach(side => {
                const sideWidth = side === 'width' ? params.width : params.length;
                const flapWidth = sideWidth - 2 * params.flapGap;
                const flapHeight = 0.5 * params.width - 0.75 * params.flapGap;

                const sidePlane = new THREE.PlaneGeometry(sideWidth, params.depth, Math.floor(2 * sideWidth), Math.floor(0.1 * params.depth));
                const flapPlane = new THREE.PlaneGeometry(flapWidth, flapHeight, Math.floor(2 * flapWidth), Math.floor(0.1 * flapHeight));

                results[half][side].side = createSideGeometry(sidePlane, [sideWidth, params.depth], [true, true, true, true], false);
                results[half][side].top = createSideGeometry(flapPlane, [flapWidth, flapHeight], [false, false, true, false], true);
                results[half][side].bottom = createSideGeometry(flapPlane, [flapWidth, flapHeight], [true, false, false, false], true);

                results[half][side].top.translate(0, 0.5 * flapHeight, 0);
                results[half][side].bottom.translate(0, -0.5 * flapHeight, 0);
            });
        });

        return results;
    }, [params]);

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: 0x9c8d7b, // Exact color from your original model
        side: THREE.DoubleSide,
        roughness: 0.95,  // Kept slightly high to show the corrugation texture well
        metalness: 0
    }), []);

    return (
        <group ref={groupRef}>
            {/* Manual render of panels for better control */}
            {(['frontHalf-width', 'frontHalf-length', 'backHalf-width', 'backHalf-length'] as const).map((key: string): React.ReactNode => {
                const [half, side] = key.split('-') as [string, string];
                return (
                    <group key={key} ref={el => { if (el) (panelsRef.current as any)[half][side].side = el }}>
                        <mesh geometry={geometries[half][side].side} material={material} />

                        <group position={[0, 0.5 * params.depth, 0]} ref={el => { if (el) (panelsRef.current as any)[half][side].top = el }}>
                            <mesh geometry={geometries[half][side].top} material={material} />
                        </group>

                        <group position={[0, -0.5 * params.depth, 0]} ref={el => { if (el) (panelsRef.current as any)[half][side].bottom = el }}>
                            <mesh geometry={geometries[half][side].bottom} material={material} />
                        </group>
                    </group>
                );
            })}

            {/* Brand Text with underlining effect */}
            <group
                position={[
                    -0.5 * Math.cos(animated.current.openingAngle) * params.width + 0.5 * params.length - 0.5 * params.copyrightSize[0],
                    -0.5 * (params.depth - params.copyrightSize[1]) + 2,
                    0.5 * Math.sin(animated.current.openingAngle) * params.width + params.thickness + 0.2
                ]}
            >
                {/* Main Text */}
                <Text
                    position={[0, 4, 0]}
                    fontSize={2.2}
                    color="#222"
                    anchorX="right"
                    anchorY="bottom"
                >
                    {text || 'Tu marca aquí'}
                </Text>

                {/* Underline for Main Text */}
                <mesh position={[-6.5, 3.8, 0]}>
                    <planeGeometry args={[13, 0.1]} />
                    <meshBasicMaterial color="#333" />
                </mesh>

                {/* Secondary Text */}
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={1.4}
                    color="#444"
                    anchorX="right"
                    anchorY="bottom"
                >
                    ¡Un mundo de posibilidades...!
                </Text>

                {/* Underline for Secondary Text */}
                <mesh position={[-11, 1.3, 0]}>
                    <planeGeometry args={[22, 0.1]} />
                    <meshBasicMaterial color="#444" />
                </mesh>
            </group>

            {logoTexture && logoTexture.image && (
                <mesh
                    position={[
                        -0.5 * Math.cos(animated.current.openingAngle) * params.width,
                        0,
                        0.5 * Math.sin(animated.current.openingAngle) * params.width + params.thickness + 0.25
                    ]}
                >
                    <planeGeometry args={[15, 15 / ((logoTexture.image as HTMLImageElement).width / (logoTexture.image as HTMLImageElement).height)]} />
                    <meshBasicMaterial map={logoTexture} transparent polygonOffset polygonOffsetFactor={-1} />
                </mesh>
            )}
        </group>
    );
}
