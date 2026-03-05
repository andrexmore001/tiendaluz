import { useMemo } from "react";

const cmToM = (cm: number) => cm / 100;
const mmToM = (mm: number) => mm / 1000;

export function useIndustrialGeometry({
  width_cm,
  height_cm,
  depth_cm,
  industrialMode,
  material
}: any) {
  return useMemo(() => {
    const outerWidth = cmToM(width_cm);
    const outerHeight = cmToM(height_cm);
    const outerDepth = cmToM(depth_cm);

    if (!industrialMode || !material) {
      return {
        outerWidth,
        outerHeight,
        outerDepth,
        thickness: 0.01,
        stiffness: 0.1
      };
    }

    const thickness = mmToM(material.thickness_mm);

    return {
      outerWidth,
      outerHeight,
      outerDepth,
      thickness,
      stiffness: material.stiffness_factor
    };
  }, [width_cm, height_cm, depth_cm, industrialMode, material]);
}