"use client";
import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BoxComponent from './BoxComponent';
import styles from './Home3DSection.module.css';

export default function Home3DSection() {
    const [text, setText] = useState('Tienda Luz');
    const [isOpen, setIsOpen] = useState(true);
    const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);
    const controlsRef = useRef<any>(null);

    const handleZoom = (amount: number) => {
        if (controlsRef.current) {
            const controls = controlsRef.current;
            const camera = controls.object;
            const target = controls.target;

            // Get direction from camera to target
            const direction = new THREE.Vector3();
            direction.subVectors(camera.position, target).normalize();

            // Calculate new distance
            const distance = camera.position.distanceTo(target);
            const newDistance = Math.max(controls.minDistance, Math.min(controls.maxDistance, distance + amount));

            // Set new position
            camera.position.copy(target).addScaledVector(direction, newDistance);
            controls.update();
        }
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const loader = new THREE.TextureLoader();
                loader.load(event.target?.result as string, (texture) => {
                    setLogoTexture(texture);
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.visualizerContainer}>
                        <div className={styles.badge}>Simulador 3D Interactivo</div>
                        <Canvas
                            camera={{ position: [50, 80, 120], fov: 45 }}
                            shadows
                            gl={{ antialias: true }}
                        >
                            {/* Original Lighting Setup */}
                            <ambientLight intensity={0.5} />
                            <group> {/* lightHolder equivalent */}
                                <pointLight position={[-30, 300, 0]} intensity={0.5} />
                                <pointLight position={[50, 0, 150]} intensity={0.7} />
                            </group>

                            <Suspense fallback={null}>
                                <BoxComponent
                                    isOpen={isOpen}
                                    text={text}
                                    logoTexture={logoTexture}
                                />
                                <Environment preset="city" />
                                <ContactShadows
                                    position={[0, -50, 0]}
                                    opacity={0.3}
                                    scale={250}
                                    blur={2.5}
                                    far={120}
                                />
                            </Suspense>

                            <OrbitControls
                                ref={controlsRef}
                                enablePan={false}
                                enableZoom={true}
                                autoRotate={isOpen}
                                autoRotateSpeed={0.5}
                                minDistance={100}
                                maxDistance={400}
                            />
                        </Canvas>
                    </div>

                    <div className={styles.controls}>
                        <h2 className={styles.title}>Pruébalo ahora</h2>
                        <p className={styles.subtitle}>
                            Personaliza tu caja en tiempo real. Escribe tu nombre, marca o sube un logo para ver cómo quedaría tu empaque ideal.
                        </p>

                        <div className={styles.formStack}>
                            <div className={styles.inputGroup}>
                                <label>Texto de Marca</label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Escribe tu marca..."
                                    className={styles.textInput}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label>Sube tu Logo (PNG/JPG)</label>
                                <div className={styles.fileUpload}>
                                    <input
                                        type="file"
                                        onChange={handleLogoUpload}
                                        accept="image/*"
                                        id="home-logo-upload"
                                    />
                                    <label htmlFor="home-logo-upload" className={styles.fileLabel}>
                                        {logoTexture ? 'Cambiar Logo' : 'Seleccionar Imagen'}
                                    </label>
                                </div>
                            </div>

                            <div className={styles.zoomControls}>
                                <button
                                    className={styles.zoomBtn}
                                    onClick={() => handleZoom(-20)}
                                    title="Acercar"
                                >
                                    +
                                </button>
                                <button
                                    className={styles.zoomBtn}
                                    onClick={() => handleZoom(20)}
                                    title="Alejar"
                                >
                                    -
                                </button>
                            </div>

                            <button
                                className={isOpen ? styles.closeBtn : styles.openBtn}
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? 'Cerrar Caja' : 'Abrir Caja'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
