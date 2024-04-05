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

//şu fonksiyonu CHECKLE
function pointInPolygon(point, polygon) {
  // Bu fonksiyon, verilen bir noktanın (point) verilen bir poligon (polygon) içerisinde olup olmadığını kontrol eder.
  // Burada basit bir algoritma kullanılmıştır, daha karmaşık geometriler için daha gelişmiş yöntemler gerekebilir.
  console.log("polygon içi point: ", point);
  console.log("polygon içi polygon: ", polygon);

  let isInside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x <
        ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) /
          (polygon[j].y - polygon[i].y) +
          polygon[i].x
    ) {
      isInside = !isInside;
    }
  }
  console.log("isInside: ", isInside);
  return isInside;
}

function SimulationTest() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [showModelPreview, setShowModelPreview] = useState(false);
  const [addPanelMode, setAddPanelMode] = useState(false); // Güneş paneli ekleme modunu takip etmek için
  const [panelPosition, setPanelPosition] = useState(new THREE.Vector3()); // Panelin konumunu tutacak
  const [panels, setPanels] = useState([]); // Yerleştirilen panellerin listesi
  const [isCancelled, setIsCancelled] = useState(false);
  const [roofSelectionActive, setRoofSelectionActive] = useState(false);
  const [selectedRoofPoints, setSelectedRoofPoints] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  // Güneş paneli ekleme modunu ve önizlemeyi kontrol edecek fonksiyonlar
  const toggleAddPanelMode = () => setAddPanelMode(!addPanelMode);

  const toggleRoofSelection = () =>
    setRoofSelectionActive(!roofSelectionActive);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false); // Seçim moduna geçildiğinde, panel ekleme modunu kapat
  };

  const handleAddPanelClick = () => {
    if (!addPanelMode) {
      setIsCancelled(false);
      setShowModelPreview(!showModelPreview);
      setAddPanelMode(!addPanelMode); // Panel ekleme modunu değiştir
    }
  };

  // const placePanel = (position) => {
  //   console.log("panels", panels);

  //   if (!isCancelled) {
  //     setPanels([...panels, position]); // Düzeltme burada yapıldı
  //     setIsCancelled(false);
  //   }
  //   setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
  // };

  const placePanel = (position) => {
    let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
    let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
    let points = [selectionStart, topRight, selectionEnd, bottomLeft];
    if (!pointInPolygon(position, selectedRoofPoints)) {
      console.warn("Panel can only be placed within the selected area.");
      return; // Seçilen alanın dışındaysa, işlemi durdur
    }

    if (pointInPolygon(position, points)) {
      console.warn("Panel can not placed on obstacles.");
      return; // Seçilen alanın dışındaysa, işlemi durdur
    }

    if (!isCancelled) {
      setPanels([...panels, position]);
      setIsCancelled(false);
    }
    setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
  };

  const handleCancel = () => {
    if (addPanelMode) {
      setIsCancelled(true); // İptal işlemi gerçekleşti
      setAddPanelMode(false);
      setShowModelPreview(false);
      setPanelPosition(new THREE.Vector3()); // Panelin önizleme pozisyonunu sıfırla
    }
  };

  return (
    <>
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        <button
          onClick={toggleRoofSelection}
          style={{
            position: "absolute",
            zIndex: 100,
            top: "30px",
            left: "10px",
          }}
        >
          {roofSelectionActive ? "Finish Selecting" : "Select Roof Area"}
        </button>
        <button
          onClick={handleSelectModeToggle}
          style={{
            position: "absolute", // Butonun üstte ve görünür olmasını sağlar
            zIndex: 100, // Canvas'ın üzerinde görünmesini sağlar
            top: "10px", // Sayfanın üstünden 10px aşağıda
            left: "10px", // Sayfanın solundan 10px içerde
          }}
        >
          {isSelecting ? "Cancel" : "Select Obstacles"}
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
          Add Solar Panel
        </button>
        <button
          onClick={handleCancel}
          style={{
            position: "absolute",
            zIndex: 100,
            top: "10px",
            right: "10px",
          }}
        >
          Cancel
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
            roofSelectionActive={roofSelectionActive}
            setSelectedRoofPoints={setSelectedRoofPoints}
            selectedRoofPoints={selectedRoofPoints}
            selectionStart={selectionStart}
            setSelectionStart={setSelectionStart}
            selectionEnd={selectionEnd}
            setSelectionEnd={setSelectionEnd}
          />
          {panels.map((position, index) => (
            <AddPanel
              key={index}
              position={position}
              isPlaced={true}
              isCancelled={isCancelled}
            />
          ))}
          {addPanelMode && (
            <AddPanel
              position={panelPosition}
              isPlaced={false}
              isCancelled={isCancelled}
            />
          )}
          <OrbitControls enableRotate={false} />
        </Canvas>
      </div>
    </>
  );
}

export default SimulationTest;
