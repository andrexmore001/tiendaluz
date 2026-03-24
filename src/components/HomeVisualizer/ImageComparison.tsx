"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./image-comparison.module.css";
import { getOptimizedUrl } from "@/lib/cloudinary";

interface ImageComparisonProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}

export default function ImageComparison({
  beforeImage,
  afterImage,
  beforeAlt = "Antes",
  afterAlt = "Después",
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isReady, setIsReady] = useState(false);

  // Prevent harsh jumps on first load when JS initializes the slider
  useEffect(() => {
    setIsReady(true);
  }, []);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(event.target.value));
  };

  return (
    <div className={styles.wrapper}>
      {/* Background (Before Image) - Caja Cerrada */}
      <div className={`${styles.imageContainer} ${styles.beforeImage}`}>
        <img src={getOptimizedUrl(beforeImage, 800) || beforeImage} alt={beforeAlt} loading="lazy" />
      </div>

      {/* Foreground (After Image) - Caja Abierta */}
      <div 
        className={`${styles.imageContainer} ${styles.afterImage}`}
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          transition: isReady ? "none" : "clip-path 0.3s ease"
        }}
      >
        <img src={getOptimizedUrl(afterImage, 800) || afterImage} alt={afterAlt} loading="lazy" />
      </div>

      {/* Visible Divider Line & Handle */}
      <div 
        className={styles.sliderHandle} 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className={styles.sliderArrowBtn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 4 4 4m8-8l4 4-4 4" />
          </svg>
        </div>
      </div>

      {/* Invisible Range Input spanning the container */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={handleSliderChange}
        className={styles.sliderRange}
        aria-label="Deslizador comparativo"
      />
    </div>
  );
}
