import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { loadOriginalModel } from "./LoadOriginalModel"; // Dosya yolunuzu güncelleyin
import * as THREE from "three";

export const AddPanelArea = () => {
  const [startPosition, setStartPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { scene, camera, gl, size } = useThree();
  const modelGroupRef = useRef(new THREE.Group());
  const rectShapeRef = useRef(null);
  const mouseDownRef = useRef(false);

  const getWorldPosition = (event) => {
    const { offsetX, offsetY } = event;
    const vec = new THREE.Vector3(
      (offsetX / size.width) * 2 - 1,
      -(offsetY / size.height) * 2 + 1,
      0.5
    );
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    return pos;
  };

  useEffect(() => {
    const handleMouseDown = (event) => {
      mouseDownRef.current = true;
      const startPos = getWorldPosition(event);
      setStartPosition(startPos);
      setCurrentPosition(startPos); // Initialize currentPosition to ensure it's not null
    };
    const handleMouseMove = (event) => {
      if (mouseDownRef.current) {
        const currentPos = getWorldPosition(event);
        setCurrentPosition(currentPos);
      }
    };
    const handleMouseUp = (event) => {
      mouseDownRef.current = false;
      const endPos = getWorldPosition(event);
      setCurrentPosition(endPos); // Ensure we update before attempting to fill area
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [camera, size]);

  useEffect(() => {
    // Ensure both positions are set before filling the area with models
    if (startPosition && currentPosition && !mouseDownRef.current) {
      fillAreaWithModels();
    }
  }, [startPosition, currentPosition]);

  useFrame(() => {
    if (startPosition && currentPosition) {
      // Update or create the rectangle based on the positions
      const vertices = new Float32Array([
        startPosition.x,
        startPosition.y,
        0,
        currentPosition.x,
        startPosition.y,
        0,
        currentPosition.x,
        currentPosition.y,
        0,
        startPosition.x,
        currentPosition.y,
        0,
        startPosition.x,
        startPosition.y,
        0,
      ]);
      if (rectShapeRef.current) {
        rectShapeRef.current.geometry.attributes.position.array = vertices;
        rectShapeRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        rectShapeRef.current = new THREE.Line(geometry, material);
        scene.add(rectShapeRef.current);
      }
    }
  });

  const fillAreaWithModels = () => {
    if (!startPosition || !currentPosition) return;

    const xDistance = Math.abs(currentPosition.x - startPosition.x);
    const yDistance = Math.abs(currentPosition.y - startPosition.y);

    // Modelin boyutlarını ve ölçeklendirmesini ayarlayın
    const modelScale = { x: 2, y: 4, z: 2 }; // Gerçek ölçeklendirme değerleri
    const modelSize = { x: 1, y: 2, z: 1 }; // Modelin gerçek boyutları

    // Padding değerini ayarlayın
    const padding = 9;

    // Padding'i hesaba katarak iç alanı hesaplayın
    const innerXDistance = xDistance - 2 * padding;
    const innerYDistance = yDistance - 2 * padding;

    // Kaç adet modelin sığacağını hesaplayın (iç alan kullanılarak)
    const numX = Math.floor(innerXDistance / (modelSize.x * modelScale.x));
    const numY = Math.floor(innerYDistance / (modelSize.y * modelScale.y));

    const startX = Math.min(startPosition.x, currentPosition.x);
    const startY = Math.min(startPosition.y, currentPosition.y);

    // Modelin yerleşimini ayarlamak için sınırları içe doğru kaydırın
    const innerStartX = startX + padding;
    const innerStartY = startY + padding;
    const innerEndX = startX + xDistance - padding;
    const innerEndY = startY + yDistance - padding; 
    
    loadOriginalModel((originalModel) => {
      modelGroupRef.current.children = []; // Mevcut modelleri temizle
      for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numY; j++) {
          const modelClone = originalModel.clone();
          modelClone.scale.set(modelScale.x, modelScale.y, modelScale.z);
          modelClone.rotation.x = Math.PI / 2;

          // Modelin alt sol köşesini başlangıç noktası ile hizalayın (iç sınırlar kullanılarak)
          modelClone.position.set(
            innerStartX + i * modelSize.x * modelScale.x + (modelSize.x * modelScale.x) / 2,
            innerStartY + j * modelSize.y * modelScale.y + (modelSize.y * modelScale.y) / 2,
            0 
          );

          modelGroupRef.current.add(modelClone);
        }
      }
      scene.add(modelGroupRef.current);
    });
  };

  return null;
};