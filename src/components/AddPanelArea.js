import React, { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { loadOriginalModel } from "./LoadOriginalModel";
import * as THREE from "three";
import { pointInPolygon } from "../pages/homepage/SimulationTest";

export const AddPanelArea = ({
  selectedRoofPoints,
  orientationAngle,
  rotationAngle,
  points,
  occupiedPositions,
  placedPanelPositionsRef,
}) => {
  const [startPosition, setStartPosition] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const { scene, camera, gl, size } = useThree();
  const modelGroupRef = useRef(new THREE.Group());
  const mouseDownRef = useRef(false);
  const selectionBoxRef = useRef(null);
  const [panelPlaced, setPanelPlaced] = useState([]); // Define state

  useEffect(() => {
    if (startPosition && currentPosition) {
      updatePanelLayout(startPosition, currentPosition, orientationAngle);
    }
  }, [rotationAngle, orientationAngle]);

  useEffect(() => {
    if (startPosition && currentPosition) {
      updatePanelLayout(startPosition, currentPosition, orientationAngle);
    }
  }, [startPosition, currentPosition, rotationAngle, orientationAngle]);

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

  const updatePanelLayout = (startPos, currentPos, orientationAngle) => {
    if (!startPos || !currentPos) return;

    const gap = 3;
    const baseModelWidth = 8;
    const baseModelHeight = 6.5;

    const scaleX = 1.7;
    const scaleY = 3.4;
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

    scene.remove(modelGroupRef.current);
    modelGroupRef.current = new THREE.Group();
    loadOriginalModel((originalModel) => {
      const placedPanels = [];
      const rotationMatrix = new THREE.Matrix4().makeRotationZ(rotationAngle);

      for (let i = 0; i < numX; i++) {
        for (let j = 0; j < numY; j++) {
          const offsetX = (i - numX / 2) * paddedModelWidth;
          const offsetY = (j - numY / 2) * paddedModelHeight;
          const panelPosition = new THREE.Vector3(offsetX, offsetY, 12)
            .applyMatrix4(rotationMatrix)
            .add(selectionCenter);

          const modelClone = originalModel.clone();
          modelClone.scale.set(scaleX, scaleY, 1.7);
          modelClone.rotation.x = orientationAngle ?? Math.PI / 2;
          modelClone.rotation.y = rotationAngle;

          const corners = [
            new THREE.Vector3(-modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, -modelHeight / 2, 0),
            new THREE.Vector3(modelWidth / 2, modelHeight / 2, 0),
            new THREE.Vector3(-modelWidth / 2, modelHeight / 2, 0),
          ].map((corner) =>
            corner.applyMatrix4(rotationMatrix).add(panelPosition)
          );

          if (
            corners.every((corner) =>
              pointInPolygon(corner, selectedRoofPoints)
            )
          ) {
            if (points !== null) {
              if (
                corners.every((corner) => !pointInPolygon(corner, points)) &&
                !occupiedPositions.some(
                  (occupiedPosition) =>
                    Math.abs(occupiedPosition.x - panelPosition.x) < 12 &&
                    Math.abs(occupiedPosition.y - panelPosition.y) < 15
                )
              ) {
                modelClone.position.copy(panelPosition);
                placedPanels.push(modelClone);
              }
            } else if (
              !occupiedPositions.some(
                (occupiedPosition) =>
                  Math.abs(occupiedPosition.x - panelPosition.x) < 12 &&
                  Math.abs(occupiedPosition.y - panelPosition.y) < 15
              )
            ) {
              modelClone.position.copy(panelPosition);
              placedPanels.push(modelClone);
            }
          }
        }
      }

      setPanelPlaced(placedPanels);
      placedPanelPositionsRef.current = placedPanels.map(
        (panel) => panel.position
      );
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
