import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import { Vector3 } from "three";
import * as THREE from "three";
import { Button, Stack, Box } from "@mui/material";
import { useMemo } from "react";
import { AddPanelArea } from "../../components/AddPanelArea"
import { loadOriginalModel } from "../../components/LoadOriginalModel"

function CameraControlled() {
  const { camera } = useThree();
  useEffect(() => {
    const initialDistance = 500;
    const maxDistance = 1000;
    const minDistance = 400;

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

function pointInPolygon(point, polygon) {
  // Bu fonksiyon, verilen bir noktanın (point) verilen bir poligon (polygon) içerisinde olup olmadığını kontrol eder.
  // Burada basit bir algoritma kullanılmıştır, daha karmaşık geometriler için daha gelişmiş yöntemler gerekebilir.

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
  return isInside;
}

function SimulationTest({ screenshot }) {
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
  const [batchAddPanelMode, setBatchAddPanelMode] = useState(false);

  // Güneş paneli ekleme modunu ve önizlemeyi kontrol edecek fonksiyonlar
  const toggleAddPanelMode = () => setAddPanelMode(!addPanelMode);

  useEffect(() => {
    loadOriginalModel((originalModel) => {
          const modelClone = originalModel.clone();
    });
  }, []);

  const toggleRoofSelection = () =>
    setRoofSelectionActive(!roofSelectionActive);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false); // Seçim moduna geçildiğinde, panel ekleme modunu kapat
  };

  const handleAddPanelClick = () => {
    setIsCancelled(false);
    setShowModelPreview(!showModelPreview);
    setAddPanelMode(!addPanelMode); // Panel ekleme modunu değiştir
  };

  // Assuming each panel is 1x1 in size for demonstration purposes
  const panelSize = { width: 1, height: 1 }; // Update this with actual panel size
  

  const calculateGridPositions = (selectedRoofPoints, panelSize) => {
    // Calculate the bounding box of the selected roof area
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    selectedRoofPoints.forEach((point) => {
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    });

    

    // Calculate positions in a grid within the bounding box
    const positions = [];
    for (let x = minX; x <= maxX; x += panelSize.width) {
      for (let y = minY; y <= maxY; y += panelSize.height) {
        positions.push(new THREE.Vector3(x, y, 0)); // Z-coordinate can be adjusted as needed
      }
    }

    // Filter positions that are actually within the selected area
    return positions.filter((position) =>
      pointInPolygon(position, selectedRoofPoints)
    );
  };

  // const placePanel = (position) => {
  //   console.log("panels", panels);

  //   if (!isCancelled) {
  //     setPanels([...panels, position]); // Düzeltme burada yapıldı
  //     setIsCancelled(false);
  //   }
  //   setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
  // };

    // Calculate positions whenever the selection changes or when batch mode is toggled
    const gridPositions = useMemo(() => {
      if (batchAddPanelMode) {
        return calculateGridPositions(selectedRoofPoints, panelSize);
      }
      return [];
    }, [batchAddPanelMode, selectedRoofPoints]);
    
  const placePanel = (position) => {
    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      if (pointInPolygon(position, points)) {
        console.warn("Panel can not placed on obstacles.");
        return; // Seçilen alanın dışındaysa, işlemi durdur
      }
    }

    if (!pointInPolygon(position, selectedRoofPoints)) {
      console.warn("Panel can only be placed within the selected area.");
      return; // Seçilen alanın dışındaysa, işlemi durdur
    }

    if (batchAddPanelMode) {
      console.log("batchaddpanelmoddayım bro")
      // Use the calculateGridPositions function to get all the positions where panels should be placed
      const gridPositions = calculateGridPositions(
        selectedRoofPoints,
        panelSize
      );
      setPanels([...panels, ...gridPositions]);
      setBatchAddPanelMode(false);
    } else {
      if (!isCancelled) {
        setPanels([...panels, position]);
        setIsCancelled(false);
      }
      setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
    }
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
      <Box
        sx={{
          overflowX: "hidden",
          position: "relative",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            position: "absolute",
            zIndex: 100,
            top: "10px",
            left: "10px",
          }}
        >
          <Button variant="contained" onClick={toggleRoofSelection}>
            {roofSelectionActive ? "Finish Selecting" : "Select Roof Area"}
          </Button>
          <Button variant="contained" onClick={handleSelectModeToggle}>
            {isSelecting ? "Cancel" : "Select Obstacles"}
          </Button>
          <Button
            variant="contained"
            onClick={handleAddPanelClick}
            sx={{ alignSelf: "flex-end" }}
          >
            Add Solar Panel
          </Button>
          <Button
            variant="contained"
            onClick={handleCancel}
            sx={{ alignSelf: "flex-end" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => setBatchAddPanelMode(!batchAddPanelMode)}
          >
            {batchAddPanelMode ? "Finish Batch Add" : "Batch Add Panels"}
          </Button>
        </Stack>

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
          {/* Directional lights positioned closer to the scene's scale */}
          <directionalLight position={[0, 0, 1]} intensity={1} />
          <CameraControlled />
          <Experience
            roofImage={screenshot}
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
            batchAddPanelMode={batchAddPanelMode}
            gridPositions={gridPositions} // Pass the calculated positions
          />
          {batchAddPanelMode && (
            <AddPanelArea/>
          )}
          {addPanelMode && (
            <AddPanel
              position={panelPosition}
              isVisible={addPanelMode} // Yeni isVisible prop'u
            />
          )}
          <OrbitControls enableRotate={false} />
        </Canvas>
      </Box>
    </>
  );
}

export default SimulationTest;
