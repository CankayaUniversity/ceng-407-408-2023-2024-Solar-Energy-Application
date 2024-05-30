import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { loadOriginalModel } from "./LoadOriginalModel";
import * as THREE from "three";
import { pointInPolygon } from "../pages/homepage/SimulationTest";

export const AddPanelArea = ({
  selectedRoofPoints,
  orientationAngle,
  points,
  rotationAngle,
  occupiedPositions,
  placedPanelPositionsRef,
  handlePanelClick,
  batchGroups, // Add batchGroups prop
  currentBatchIndex, // Add currentBatchIndex prop
  addPanelStart,
  addPanelEnd,
  modelGroupRef, // Add modelGroupRef prop
  batchAddPanelMode,
  modelPath,
  redPixels3D,
}) => {
  const [startPosition, setStartPosition] = useState(addPanelStart);
  const [currentPosition, setCurrentPosition] = useState(addPanelEnd);
  const { scene, camera, size } = useThree();
  const mouseDownRef = useRef(false);
  const selectionBoxRef = useRef(null);
  const [batchIdx, setBatchIdx] = useState(0);
  const modelRef = useRef(new THREE.Group());
  const [panelPlaced, setPanelPlaced] = useState([]);
  const panelsToRemove = [];
  const [validPanels, setValidPanels] = useState([]); // Engellerden kaçınan geçerli paneller
  

  useEffect(() => {
    if (batchAddPanelMode) {
      console.log("batch indexxxxxx", currentBatchIndex);
      console.log("modelGroupRef", modelGroupRef);

      modelGroupRef.current = new THREE.Group();
      console.log("modelGroupRef after", modelGroupRef);
      console.log("modelGroupRef curr", modelGroupRef.current);
    } else {
      console.log("batch indexxxxxx", currentBatchIndex);
      console.log("modelGroupRef curr", modelGroupRef.current);
      modelRef.current = modelGroupRef.current;
      setBatchIdx(modelGroupRef.current.children[0].userData.batchIndex);
    }
  }, []);

  useEffect(() => {
    if (startPosition && currentPosition) {
      updatePanelLayout(startPosition, currentPosition, orientationAngle);
    }
  }, [startPosition, currentPosition, rotationAngle, orientationAngle]);

  useEffect(() => {
    if (batchGroups.length > 0) {
      const currentBatchPanels = batchGroups[currentBatchIndex];
      if (currentBatchPanels) {
        // currentBatchPanels.forEach((panel) => {
        //   panel.rotation.x = orientationAngle;
        //   panel.rotation.y = rotationAngle;
        //   panel.updateMatrix();
        // });
      }
    }
  }, [batchGroups, currentBatchIndex, orientationAngle, rotationAngle]);

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

 
  const checkRedPixelCollision = (panelPosition, redPixels3D, paddedModelWidth) => {
    const halfSize = paddedModelWidth/2 ;
    const panelBounds = [
      new THREE.Vector3(panelPosition.x - halfSize, panelPosition.y - halfSize, panelPosition.z),
      new THREE.Vector3(panelPosition.x + halfSize, panelPosition.y - halfSize, panelPosition.z),
      new THREE.Vector3(panelPosition.x + halfSize, panelPosition.y + halfSize, panelPosition.z),
      new THREE.Vector3(panelPosition.x - halfSize, panelPosition.y + halfSize, panelPosition.z),
    ];
  
    for (let redPixel of redPixels3D) {
      const redPixelBounds = [
        new THREE.Vector3(redPixel.x - halfSize, redPixel.y - halfSize, redPixel.z),
        new THREE.Vector3(redPixel.x + halfSize, redPixel.y - halfSize, redPixel.z),
        new THREE.Vector3(redPixel.x + halfSize, redPixel.y + halfSize, redPixel.z),
        new THREE.Vector3(redPixel.x - halfSize, redPixel.y + halfSize, redPixel.z),
      ];
      
      for (let bound of panelBounds) {
        if (pointInPolygon(bound, redPixelBounds)) {
          return true;
        }
      }
    }
  
    return false;
  };
  
  const createGrid = (redPixels3D, gridSize) => {
    const grid = new Map();
    redPixels3D.forEach((pixel) => {
      const x = Math.floor(pixel.x / gridSize);
      const y = Math.floor(pixel.y / gridSize);
      const key = `${x},${y}`;
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key).push(pixel);
    });
    return grid;
  };
  
  const isCollisionWithGrid = (panelPosition, grid, gridSize) => {
    const x = Math.floor(panelPosition.x / gridSize);
    const y = Math.floor(panelPosition.y / gridSize);
    const key = `${x},${y}`;
    return grid.has(key);
  };
  
  const updatePanelLayout = (startPos, currentPos, orientationAngle) => {
    if (!startPos || !currentPos) return;
  
    const gap = 3; // Gap between panels
    const baseModelWidth = 8; // Base model width
    const baseModelHeight = 6.5; // Base model height
  
    const scaleX = 1.7; // Horizontal scaling
    const scaleY = 3.4; // Vertical scaling
    const modelWidth = baseModelWidth * scaleX;
    const modelHeight = baseModelHeight * scaleY;
  
    const paddedModelWidth = modelWidth + gap;
    const paddedModelHeight = modelHeight + gap;
  
    const xDistance = Math.abs(currentPos.x - startPos.x);
    const yDistance = Math.abs(currentPos.y - startPos.y);
  
    const numX = Math.floor(xDistance / paddedModelWidth);
    const numY = Math.floor(yDistance / paddedModelHeight);
  
    const centerX = (startPos.x + currentPos.x) / 2;
    const centerY = (startPos.y + currentPos.y) / 2;
    const selectionCenter = new THREE.Vector3(centerX, centerY, 0);
  
    // Create a grid from red pixels
    const gridSize = paddedModelWidth;
    const redPixelGrid = createGrid(redPixels3D, gridSize);
  
    scene.remove(modelRef.current);
    modelRef.current = new THREE.Group();
    loadOriginalModel(modelPath, (originalModel) => {
      const placedPanels = [];
      const rotationMatrix = new THREE.Matrix4().makeRotationZ(rotationAngle);
  
      for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numY; j++) {
          const offsetX = (i - numX / 2) * paddedModelWidth;
          const offsetY = (j - numY / 2) * paddedModelHeight;
          const panelPosition = new THREE.Vector3(offsetX, offsetY, 12).applyMatrix4(rotationMatrix).add(selectionCenter);
  
          if (isCollisionWithGrid(panelPosition, redPixelGrid, gridSize)) {
            continue; // Skip placing the panel if there's a red pixel in the grid cell
          }
  
          const modelClone = originalModel.scene.clone();
          modelClone.scale.set(scaleX, scaleY, 1.7);
          modelClone.rotation.x = orientationAngle ?? Math.PI / 2;
          modelClone.rotation.y = rotationAngle;
  
          modelClone.userData = {
            ...modelClone.userData,
            batchIndex: batchAddPanelMode ? currentBatchIndex : batchIdx,
            isPanel: true,
            startPosition: startPosition,
            currentPosition: currentPosition,
          };
  
          const corners = [
            new THREE.Vector3(-modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, modelHeight / 2, 0),
            new THREE.Vector3(-modelWidth / 2, modelHeight / 2, 0),
          ].map((corner) =>
            corner.applyMatrix4(rotationMatrix).add(panelPosition)
          );
  
          if (
            corners.every((corner) => pointInPolygon(corner, selectedRoofPoints)) &&
            (points === null || corners.every((corner) => !pointInPolygon(corner, points))) &&
            !occupiedPositions.some(
              (occupiedPosition) =>
                occupiedPosition &&
                Math.abs(occupiedPosition.x - panelPosition.x) < paddedModelWidth &&
                Math.abs(occupiedPosition.y - panelPosition.y) < paddedModelHeight
            )
          ) {
            modelClone.position.copy(panelPosition);
            modelClone.callback = () => handlePanelClick(modelClone);
            placedPanels.push(modelClone);
          }
        }
      }
  
      placedPanelPositionsRef.current = placedPanels.map((panel) => panel);
      placedPanels.forEach((panel) => modelRef.current.add(panel));
      scene.add(modelRef.current);
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

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const rotatedVertices = [
      new THREE.Vector3(minX, minY, 0),
      new THREE.Vector3(maxX, minY, 0),
      new THREE.Vector3(maxX, maxY, 0),
      new THREE.Vector3(minX, maxY, 0),
    ].map((vertex) => {
      const vec = vertex.clone().sub(new THREE.Vector3(centerX, centerY, 0));
      vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), rotationAngle);
      return vec.add(new THREE.Vector3(centerX, centerY, 0));
    });

    const verticesArray = [];
    rotatedVertices.forEach((vertex) => {
      verticesArray.push(vertex.x, vertex.y, vertex.z);
    });

    positions.array.set(verticesArray);
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
