"use client";
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage, PerspectiveCamera, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
    url: string;
}

function Model({ url }: ModelProps) {
    const { scene } = useGLTF(url);

    // Automatically center and scale the model
    return (
        <Center top>
            <primitive object={scene} />
        </Center>
    );
}

interface ProductModelProps {
    modelUrl?: string;
}

const ProductModel: React.FC<ProductModelProps> = ({ modelUrl }) => {
    if (!modelUrl) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                color: '#94a3b8',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <p>Sin modelo 3D cargado</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '350px' }}>
            <Canvas shadows gl={{ antialias: true, preserveDrawingBuffer: true }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} shadows="contact">
                        <Model url={modelUrl} />
                    </Stage>
                </Suspense>
                <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
            </Canvas>
        </div>
    );
};

export default ProductModel;
