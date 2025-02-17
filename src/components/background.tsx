"use client";
import { useConfig } from "@/hooks/use-theme-config";
import { hslCssToHex } from "@/lib/utils";
import {
  baseColors,
  DEFAULT_BASE_COLOR,
} from "@/registry/registry-base-colors";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [config] = useConfig();

  const baseColorCss = baseColors.find(
    (baseColor) => baseColor.name === config.theme
  );

  const baseColor = hslCssToHex(
    (baseColorCss ?? DEFAULT_BASE_COLOR).cssVars.dark.primary
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // **1️⃣ Create Scene, Camera & Renderer**
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const starsGeometry = new THREE.BufferGeometry();
    const starsAmount = 2000;

    const positions = new Float32Array(starsAmount * 3);
    for (let i = 0; i < starsAmount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const starsMaterial = new THREE.PointsMaterial({
      color: baseColor,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // **3️⃣ Animation Loop (Stars Twinkle & Move)**
    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0005; // Slow rotation for realistic effect
      renderer.render(scene, camera);
    };
    animate();

    // **4️⃣ Parallax Effect (Mouse Movement)**
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 0.2;
      const y = -(event.clientY / window.innerHeight - 0.5) * 0.2;
      camera.position.x = x * 0.5;
      camera.position.y = y * 0.5;
      camera.lookAt(scene.position);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // **5️⃣ Handle Window Resize**
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [baseColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full  pointer-events-none"
    />
  );
}
