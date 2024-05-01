import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { loadOriginalModel } from "./LoadOriginalModel"; // Adjust path as necessary
import * as THREE from "three";
import { pointInPolygon } from "../pages/homepage/SimulationTest";

export const AddPanelArea = ({
  selectedRoofPoints,
}) => {
  const [startPosition, setStartPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { scene, camera, gl, size } = useThree();
  const modelGroupRef = useRef(new THREE.Group());
  const mouseDownRef = useRef(false);
  const selectionBoxRef = useRef(null);

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
    if (!startPos || !currentPos) return; // Güvenlik kontrolü ekle
    const gap = 1; // Gap between models, both horizontally and vertically
    const modelWidth = 10; // Actual width of the model
    const modelHeight = 15; // Actual height of the model
  
    // Calculate the total space needed per model including the gap
    const paddedModelWidth = modelWidth + gap;
    const paddedModelHeight = modelHeight + gap;
  
    const xDistance = Math.abs(currentPos.x - startPos.x);
    const yDistance = Math.abs(currentPos.y - startPos.y);
  
    // Calculate how many models can fit in the selected area with the gaps
    const numX = Math.floor(xDistance / paddedModelWidth);
    const numY = Math.floor(yDistance / paddedModelHeight);
  
    const minX = Math.min(startPos.x, currentPos.x);
    const minY = Math.min(startPos.y, currentPos.y);
    
    scene.remove(modelGroupRef.current);
    modelGroupRef.current = new THREE.Group();
  
    loadOriginalModel((originalModel) => {
      const placedPanels = [];
  
      for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numY; j++) {
          const modelClone = originalModel.clone();
          modelClone.scale.set(1, 2, 1); // Original scale
          modelClone.rotation.x = Math.PI / 2;
  
          // Calculate position for each model, including gaps
          const positionX = minX + i * paddedModelWidth + modelWidth / 2;
          const positionY = minY + j * paddedModelHeight + modelHeight / 2;
  
          const position = new THREE.Vector3(
            positionX,
            positionY,
            0
          );
  
          if (pointInPolygon(position, selectedRoofPoints)) {
            modelClone.position.set(position.x, position.y, 0);
            placedPanels.push(modelClone);
          }
        }
      }
  
      placedPanels.forEach((panel) => modelGroupRef.current.add(panel));
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
    const vertices = [
      minX, minY, 0, // Vertex 1
      maxX, minY, 0, // Vertex 2
      maxX, maxY, 0, // Vertex 3
      minX, maxY, 0  // Vertex 4
    ];
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
