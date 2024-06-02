import React, { useState, useEffect, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"; // GLTFLoader'ı import et
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadOriginalModel } from "./LoadOriginalModel";

const loadGLTFModel = async (path, onLoad) => {
  const loader = new GLTFLoader();
  loader.load(
    path,
    (gltf) => onLoad(gltf.scene),
    undefined,
    (error) => console.error(error)
  );
};

export const AddPanel = ({
  position,
  isCancelled,
  modelPath,
  modelReference,
  currentIndex,
  singleEditing,
  rotationAngle,
  orientationAngle,
  currentZoom,
}) => {
  const modelRef = useRef();
  const { scene } = useThree();
  const [rotation, setRotation] = useState(0); // Başlangıç dönüş açısı 0 derece. Panelin dönmesi için gerekli
  const [rotationX, setRotationX] = useState(Math.PI / 2);

  useEffect(() => {
    if (singleEditing) {
      modelRef.current = modelReference.current;
      currentIndex = modelReference.current.userData.index;
    }

    if(orientationAngle && rotationAngle){
      setRotation(rotationAngle);
      setRotationX(orientationAngle)
    }
  }, [rotationAngle, orientationAngle]);

  useEffect(() => {
    // 'position' prop'u her değiştiğinde modelin konumunu güncelle
    if (modelRef.current && position) {
      const newPosition = position.clone();
      newPosition.z = 12;
      modelRef.current.position.copy(newPosition);
    }
  }, [position]);

  useEffect(() => {
    // Model yalnızca bir kez yüklenir

    if (modelRef.current) {

      scene.remove(modelRef.current);
      modelRef.current = null;
    }

    if (!modelRef.current) {
      let scaleX = 1.0, scaleY = 1.0, scaleZ = 1.0; // Default scale values
      if (currentZoom === 19) {
        scaleX = 1.4; // Horizontal scaling
        scaleY = 0.55; // Vertical scaling
        scaleZ = 0.4;
      } else if (currentZoom === 20) {
        scaleX = 4; // Horizontal scaling
        scaleY = 2; // Vertical scaling
        scaleZ = 1;
      }
      loadOriginalModel(modelPath, (originalModel) => {
        const modelClone = originalModel.scene.clone();
        modelClone.rotation.y = Math.PI / 2;
        modelClone.scale.set(scaleX, scaleY, scaleZ); // Boyutları iki katına çıkarır
        modelClone.rotation.x = Math.PI / 2;
        modelClone.position.copy(position);
        modelClone.userData = {
          ...modelClone.userData,
          isPanel: true,
          isSingle: true,
          index: currentIndex,
        };
        scene.add(modelClone);
        modelRef.current = modelClone;
        modelReference.current = modelClone;
      });
    }

  }, [scene, isCancelled]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // `+` tuşuna basıldığında dönüş açısını artır
      if (event.key === "+" || event.key === "NumpadAdd") {
        setRotation((prevRotation) => prevRotation + 0.1); // Açıyı artır
      }
      // `-` tuşuna basıldığında dönüş açısını azalt
      else if (event.key === "-" || event.key === "NumpadSubtract") {
        setRotation((prevRotation) => prevRotation - 0.1); // Açıyı azalt
      } else if (event.key === "ArrowUp") {
        setRotationX((prevRotation) => prevRotation + 0.1); // Increase X rotation
      } else if (event.key === "ArrowDown") {
        setRotationX((prevRotation) => prevRotation - 0.1); // Decrease X rotation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y = rotation;
      modelRef.current.rotation.x = rotationX; // Y ekseninde dönüşü güncelle
    }
  }, [rotation, rotationX]);

  return null;
};
