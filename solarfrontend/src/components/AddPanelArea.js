import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { loadOriginalModel } from "./LoadOriginalModel"; // Adjust path as necessary
import * as THREE from "three";
import { pointInPolygon } from "../pages/homepage/SimulationTest";

export const AddPanelArea = ({ selectedRoofPoints }) => {
  const [startPosition, setStartPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { scene, camera, gl, size } = useThree();
  const modelGroupRef = useRef(new THREE.Group());
  const mouseDownRef = useRef(false);
  const selectionBoxRef = useRef(null);
  const [rotationAngle, setRotationAngle] = useState(0); // Açıyı radian olarak saklayacağız.

  const rotatePanelsRight = () => {
    setRotationAngle((prev) => prev + 0.01); // 90 derece sağa dön
  };

  const rotatePanelsLeft = () => {
    setRotationAngle((prev) => prev - 0.01); // 90 derece sola dön
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === '+' || event.key === '=') { // Bazı klavyelerde + tuşu = ile birlikte
        rotatePanelsRight();
      } else if (event.key === '-') {
        rotatePanelsLeft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (startPosition && currentPosition) {
      updatePanelLayout(startPosition, currentPosition);
    }
  }, [startPosition, currentPosition, rotationAngle]);

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
      if (!event.target.closest("canvas")) return;
      mouseDownRef.current = true;
      const startPos = getWorldPosition(event);
      if (startPos) {
        setStartPosition(startPos);
        setCurrentPosition(startPos);
      }
    };

    const handleMouseMove = (event) => {
      if (!event.target.closest("canvas")) return;
      if (mouseDownRef.current && startPosition && currentPosition) {
        const currentPos = getWorldPosition(event);
        setCurrentPosition(currentPos);
        if (startPosition && currentPos) {
          updatePanelLayout(startPosition, currentPos);
          updateSelectionBox(startPosition, currentPos);
        }
      }
    };

    const handleMouseUp = (event) => {
      // Sadece canvas üzerinde başlatılan olaylar için işlem yap
      if (!event.target.closest("canvas")) return;
      mouseDownRef.current = false;
      removeSelectionBox();
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [camera, size, startPosition]);

  useFrame(() => {
    if (mouseDownRef.current && startPosition && currentPosition) {
      updatePanelLayout(startPosition, currentPosition);
      updateSelectionBox(startPosition, currentPosition);
    }
  });

  const updatePanelLayout = (startPos, currentPos) => {
    if (!startPos || !currentPos) return; // Güvenlik kontrolü
    const gap = 0.8; // Model arası boşluk
    const baseModelWidth = 9; // Temel Model genişliği
    const baseModelHeight = 7; // Temel Model yüksekliği
  
    // Modelin ölçeklendirilmiş boyutlarını hesapla
    const scaleX = 2.7; // Yatay ölçeklendirme
    const scaleY = 8.5; // Dikey ölçeklendirme
    const modelWidth = baseModelWidth * scaleX;
    const modelHeight = baseModelHeight * scaleY;
  
    const paddedModelWidth = modelWidth + gap;
    const paddedModelHeight = modelHeight + gap;
  
    const xDistance = Math.abs(currentPos.x - startPos.x);
    const yDistance = Math.abs(currentPos.y - startPos.y);
  
    const numX = Math.floor(xDistance / paddedModelWidth);
    const numY = Math.floor(yDistance / paddedModelHeight);
  
    const minX = Math.min(startPos.x, currentPos.x);
    const minY = Math.min(startPos.y, currentPos.y);
  
    scene.remove(modelGroupRef.current);
    modelGroupRef.current = new THREE.Group();
  
    loadOriginalModel((originalModel) => {
      const placedPanels = [];
      const rotationMatrix = new THREE.Matrix4().makeRotationZ(rotationAngle);
  
      for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numY; j++) {
          const modelClone = originalModel.clone();
          modelClone.scale.set(scaleX, scaleY,4); // Model ölçeklendirme uygula
          modelClone.rotation.x = Math.PI / 2; // Modeli yatay çevir
          modelClone.rotation.y = rotationAngle; // Selection box'ın açısına göre döndür
  
          const unrotatedX = minX + i * paddedModelWidth;
          const unrotatedY = minY + j * paddedModelHeight;
          const panelCenter = new THREE.Vector3(unrotatedX, unrotatedY, 0);
          const rotatedPanelCenter = panelCenter.clone().applyMatrix4(rotationMatrix);
  
          const corners = [
            new THREE.Vector3(-modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, modelHeight / 2, 0),
            new THREE.Vector3(-modelWidth / 2, modelHeight / 2, 0)
          ].map(corner => corner.applyMatrix4(rotationMatrix).add(rotatedPanelCenter));
  
          if (corners.every(corner => pointInPolygon(corner, selectedRoofPoints))) {
            modelClone.position.copy(rotatedPanelCenter);
            placedPanels.push(modelClone);
          }
        }
      }
  
      placedPanels.forEach(panel => modelGroupRef.current.add(panel));
      scene.add(modelGroupRef.current);
    });
  };
  
  
  const updateSelectionBox = (startPos, currentPos) => {
    if (!selectionBoxRef.current) {
      const material = new THREE.LineBasicMaterial({ color: 0xffffff });
      const geometry = new THREE.BufferGeometry();
      const vertices = new Float32Array(12);
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      selectionBoxRef.current = new THREE.LineLoop(geometry, material);
      scene.add(selectionBoxRef.current);
    }
    const positions = selectionBoxRef.current.geometry.attributes.position;
    const minX = Math.min(startPos.x, currentPos.x);
    const maxX = Math.max(startPos.x, currentPos.x);
    const minY = Math.min(startPos.y, currentPos.y);
    const maxY = Math.max(startPos.y, currentPos.y);

    // Calculate center point of the selection box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Apply rotation around the center point
    const rotatedVertices = [
      new THREE.Vector3(minX, minY, 0),
      new THREE.Vector3(maxX, minY, 0),
      new THREE.Vector3(maxX, maxY, 0),
      new THREE.Vector3(minX, maxY, 0),
    ].map((vertex) => {
      const vec = vertex.clone().sub(new THREE.Vector3(centerX, centerY, 0));
      vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotationAngle); // Rotate around Z-axis
      return vec.add(new THREE.Vector3(centerX, centerY, 0));
    });

    const vertices = [];
    rotatedVertices.forEach((vertex) => {
      vertices.push(vertex.x, vertex.y, vertex.z);
    });

    positions.array.set(vertices);
    positions.needsUpdate = true;
  };


  const removeSelectionBox = () => {
    if (selectionBoxRef.current) {
      scene.remove(selectionBoxRef.current);
      selectionBoxRef.current.geometry.dispose();
      selectionBoxRef.current.material.dispose();
      selectionBoxRef.current = null;
    }
  };

  return null;
};


