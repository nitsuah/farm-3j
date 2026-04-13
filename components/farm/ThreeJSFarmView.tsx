"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFarm } from "@/lib/farm/FarmContext";

export const ThreeJSFarmView: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { state } = useFarm();

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e0f7fa");
    const camera = new THREE.OrthographicCamera(
      width / -40,
      width / 40,
      height / 40,
      height / -40,
      1,
      1000
    );
    camera.position.set(50, 80, 100);
    camera.lookAt(50, 0, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Simple ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial({ color: "#a5d6a7" })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Render entities as colored boxes/cylinders
    state.entities.forEach(entity => {
      let mesh: THREE.Mesh;
      switch (entity.type) {
        case "barn":
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(8, 8, 8),
            new THREE.MeshBasicMaterial({ color: "#b71c1c" })
          );
          break;
        case "cow":
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 6),
            new THREE.MeshBasicMaterial({ color: "#fffde7" })
          );
          break;
        case "chicken":
          mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.2, 2, 12),
            new THREE.MeshBasicMaterial({ color: "#fff8e1" })
          );
          break;
        case "pig":
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(3, 3, 5),
            new THREE.MeshBasicMaterial({ color: "#f8bbd0" })
          );
          break;
        case "fence":
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(6, 1, 1),
            new THREE.MeshBasicMaterial({ color: "#8d6e63" })
          );
          break;
        default:
          mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshBasicMaterial({ color: "#90caf9" })
          );
      }
      mesh.position.set(entity.x, 1.5, entity.y);
      scene.add(mesh);
    });

    renderer.render(scene, camera);

    // Cleanup
    return () => {
      renderer.dispose();
      while (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }
    };
  }, [state.entities]);

  return (
    <div ref={mountRef} style={{ width: "100%", height: 400, borderRadius: 12, overflow: "hidden" }} />
  );
};
