import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import { Vector3 } from "three";
import * as THREE from "three";

function CameraControlled() {
  const { camera } = useThree();
  useEffect(() => {
    const initialDistance = 500;
    const maxDistance = 1000;
    const minDistance = 300;

    const updateCameraPosition = () => {
      if (camera.position.z > maxDistance) {
        camera.position.z = maxDistance;
      } else if (camera.position.z < minDistance) {
        camera.position.z = minDistance;
      }
    };

    updateCameraPosition();

    const handleMouseWheel = (event) => {
      camera.position.z -= event.deltaY * 0.1;
      updateCameraPosition();
    };

    document.addEventListener("wheel", handleMouseWheel);

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, [camera]);

  return null;
}

function SimulationTest() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [showModelPreview, setShowModelPreview] = useState(false);
  const [addPanelMode, setAddPanelMode] = useState(false); // Güneş paneli ekleme modunu takip etmek için
  const [panelPosition, setPanelPosition] = useState(new THREE.Vector3()); // Panelin konumunu tutacak
  const [panels, setPanels] = useState([]); // Yerleştirilen panellerin listesi

  // Güneş paneli ekleme modunu ve önizlemeyi kontrol edecek fonksiyonlar
  const toggleAddPanelMode = () => setAddPanelMode(!addPanelMode);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false); // Seçim moduna geçildiğinde, panel ekleme modunu kapat
  };

  const handleAddPanelClick = () => {
    setShowModelPreview(!showModelPreview);
    setAddPanelMode(!addPanelMode); // Panel ekleme modunu değiştir
  };

  const placePanel = (position) => {
    setPanels([...panels, position]); // Düzeltme burada yapıldı
    setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
  };

  const handleCancel = () => {
    setAddPanelMode(false);
    setShowModelPreview(false);
  };

  return (
    <>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <button
          onClick={handleSelectModeToggle}
          style={{
            position: "absolute", // Butonun üstte ve görünür olmasını sağlar
            zIndex: 100, // Canvas'ın üzerinde görünmesini sağlar
            top: "10px", // Sayfanın üstünden 10px aşağıda
            left: "10px", // Sayfanın solundan 10px içerde
          }}
        >
          {isSelecting ? "Cancel" : "Select Roof Area"}
        </button>
        <button
          onClick={handleAddPanelClick}
          style={{
            position: "absolute",
            zIndex: 100,
            top: "10px",
            right: "10px",
          }}
        >
          {showModelPreview ? "Cancel" : "Add Solar Panel"}
        </button>

        <Canvas
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "100vh",
            color: "red",
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <CameraControlled />
          <Experience
            roofImage={roofImage}
            isSelecting={isSelecting}
            addPanelMode={addPanelMode}
            setPanelPosition={setPanelPosition}
            onPanelPlace={placePanel}
          />
          {panels.map((position, index) => (
            <AddPanel key={index} position={position} /> // Yerleştirilen panelleri render et
          ))}
          {addPanelMode && <AddPanel position={panelPosition} />}
          <OrbitControls enableRotate={false} />
        </Canvas>
      </div>
    </>
  );
}

export default SimulationTest;
