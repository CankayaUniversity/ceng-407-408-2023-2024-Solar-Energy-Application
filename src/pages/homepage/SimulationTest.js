import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import * as THREE from "three";
import {
  Button,
  Stack,
  Box,
  Grid,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
} from "@mui/material";
import { AddPanelArea } from "../../components/AddPanelArea";
import { loadOriginalModel } from "../../components/LoadOriginalModel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

//editpanelsde hep sonuncuyu ed,tlemeye çalışıyor ondan aşağıdaki paneller yukarı fırtıyor
//sadece seçilen batch indexli panel için edit yapmalı

//en sonuncu batch'in modelgroupref olarak gidiyor hep seçilen batch'i mdoelgroupref olarak yollarsak tamamdır

export function pointInPolygon(point, polygon) {
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

function CameraControlled() {
  const { camera } = useThree();

  useEffect(() => {
    const initialDistance = 600;
    const maxDistance = 1000;
    const minDistance = 200;

    camera.position.z = initialDistance;

    const updateCameraPosition = () => {
      if (camera.position.z > maxDistance) {
        camera.position.z = maxDistance;
      } else if (camera.position.z < minDistance) {
        camera.position.z = minDistance;
      }
    };

    const handleMouseWheel = (event) => {
      const canvasElement = document.getElementById("simulation-canvas");

      if (canvasElement && canvasElement.contains(event.target)) {
        camera.position.z -= event.deltaY * 0.1;
        updateCameraPosition();
        event.preventDefault();
      }
    };

    document.addEventListener("wheel", handleMouseWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, [camera]);

  return null;
}

function RaycasterComponent({
  handlePanelClick,
  setSelectedBatch,
  batchGroups,
  setAddPanelStart,
  setAddPanelEnd,
  setBatchEditing,
}) {
  const { scene, camera, gl } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    const onMouseClick = (event) => {
      const canvasElement = document.getElementById("simulation-canvas");
      if (!canvasElement.contains(event.target)) return;
      const rect = gl.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(
        scene.children,
        true
      );
      console.log("intersects:", intersects);

      if (intersects.length > 0) {
        let intersectedObject;
        for (let i = 0; i < intersects.length; i++) {
          let obj = intersects[i].object;
          console.log("intersectedObject userData:", obj.userData);
          while (
            obj &&
            (!obj.userData || !obj.userData.isPanel) &&
            obj.parent
          ) {
            obj = obj.parent;
          }
          if (obj && obj.userData && obj.userData.isPanel) {
            intersectedObject = obj;
            break;
          }
        }
        console.log("intersectedObject:", intersectedObject);
        if (intersectedObject) {
          setBatchEditing(true);
          handlePanelClick(intersectedObject);
          const batchIndex = intersectedObject.userData.batchIndex;
          setAddPanelStart(intersectedObject.userData.startPosition);
          setAddPanelEnd(intersectedObject.userData.currentPosition);
          console.log("batchIndex:", batchIndex);
          console.log("batchGroups:", batchGroups);
          const batchPanels = batchGroups[batchIndex];
          if (batchPanels) {
            setSelectedBatch(batchPanels);
          } else {
            console.error(`Batch group not found for index: ${batchIndex}`);
          }
        } else {
          setBatchEditing(false);
        }
      } else {
        setSelectedBatch([]);
      }
    };

    window.addEventListener("click", onMouseClick);

    return () => {
      window.removeEventListener("click", onMouseClick);
    };
  }, [scene, camera, handlePanelClick, setSelectedBatch, batchGroups]);

  return null;
}

function SimulationTest({ screenshot }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [showModelPreview, setShowModelPreview] = useState(false);
  const [addPanelMode, setAddPanelMode] = useState(false);
  const [panelPosition, setPanelPosition] = useState(new THREE.Vector3());
  const [panels, setPanels] = useState([]);
  const [isCancelled, setIsCancelled] = useState(false);
  const [roofSelectionActive, setRoofSelectionActive] = useState(false);
  const [selectedRoofPoints, setSelectedRoofPoints] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isPanelPlaced, setIsPanelPlaced] = useState(false);
  const [batchAddPanelMode, setBatchAddPanelMode] = useState(false);
  const [orientationMode, setOrientationMode] = useState(false);
  const [orientationAngle, setOrientationAngle] = useState(90);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [obstaclesPoints, setObstaclesPoints] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [occupiedPositions, setOccupiedPositions] = useState([]);
  const placedPanelPositionsRef = useRef([]);
  const modelGroupRef = useRef(new THREE.Group()); // Add this line
  const [batchGroups, setBatchGroups] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [batchEditing, setBatchEditing] = useState(false); // Batch editing state
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0); // Current batch index
  const [addPanelStart, setAddPanelStart] = useState(null);
  const [addPanelEnd, setAddPanelEnd] = useState(null);
  const [editPanel, setEditPanel] = useState(false);
  
  const handleOrientationToggle = () => {
    setOrientationMode(!orientationMode);
  };

  const handleOrientationChange = (event) => {
    setOrientationAngle(Number(event.target.value));
  };

  const handleRotationChange = (event) => {
    setRotationAngle(Number(event.target.value));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "+" || event.key === "=") {
        setRotationAngle((prev) => Math.min(prev + 1, 360));
      } else if (event.key === "-") {
        setRotationAngle((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleAddPanelMode = () => setAddPanelMode(!addPanelMode);

  const canvasRef = useRef();

  useEffect(() => {
    loadOriginalModel((originalModel) => {
      const modelClone = originalModel.clone();
    });
  }, []);

  const toggleRoofSelection = () =>
    setRoofSelectionActive(!roofSelectionActive);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false);
  };

  const panelSize = { width: 1, height: 1 };

  const calculateGridPositions = (selectedRoofPoints, panelSize) => {
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

    const positions = [];
    for (let x = minX; x <= maxX; x += panelSize.width) {
      for (let y = minY; y <= maxY; y += panelSize.height) {
        positions.push(new THREE.Vector3(x, y, 0));
      }
    }

    return positions.filter((position) =>
      pointInPolygon(position, selectedRoofPoints)
    );
  };

  const gridPositions = useMemo(() => {
    if (batchAddPanelMode) {
      return calculateGridPositions(selectedRoofPoints, panelSize);
    }
    return [];
  }, [batchAddPanelMode, selectedRoofPoints]);

  const handlePanelPlacement = (position) => {
    if (
      panels.some(
        (panel) =>
          Math.abs(panel.x - position.x) < 1 &&
          Math.abs(panel.y - position.y) < 1
      )
    ) {
      setAlertMessage("Panel placement overlaps with existing panels.");
      setAlertOpen(true);
      return;
    }

    if (!pointInPolygon(position, selectedRoofPoints)) {
      setAlertMessage(
        "Panel can only be placed within the selected roof area."
      );
      setAlertOpen(true);
      return;
    }

    setPanels((prev) => [...prev, position]);
  };

  const placePanel = (position) => {
    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      setObstaclesPoints(points);
      if (pointInPolygon(position, points)) {
        console.warn("Panel can not placed on obstacles.");
        return;
      }
      if (!pointInPolygon(position, selectedRoofPoints)) {
        console.warn("Panel can only be placed within the selected area.");
        return;
      }
      if (!isCancelled) {
        setPanels([...panels, position]);
        setIsCancelled(false);
        setIsPanelPlaced(true);
      }
      setAddPanelMode(false);
    }

    if (!pointInPolygon(position, selectedRoofPoints)) {
      console.warn("Panel can only be placed within the selected area.");
      return;
    }

    if (batchAddPanelMode) {
      const gridPositions = calculateGridPositions(
        selectedRoofPoints,
        panelSize
      );
      const newPanels = gridPositions.filter(
        (gridPosition) =>
          !occupiedPositions.some(
            (occupiedPosition) =>
              Math.abs(occupiedPosition.x - gridPosition.x) < 1 &&
              Math.abs(occupiedPosition.y - gridPosition.y) < 1
          )
      );
      setPanels((prev) => [...prev, ...newPanels]);
      setOccupiedPositions((prev) => [...prev, ...newPanels]);
      setCurrentBatch((prev) => [...prev, ...newPanels]);
      placedPanelPositionsRef.current = [
        ...placedPanelPositionsRef.current,
        ...newPanels,
      ];
      setBatchAddPanelMode(false);
    } else {
      if (!isCancelled) {
        setPanels([...panels, position]);
        setOccupiedPositions((prev) => [...prev, position]);
        setCurrentBatch((prev) => [...prev, position]);
        setIsCancelled(false);
      }
      setAddPanelMode(false);
    }
  };

  const handleCancelRoofSelection = () => {
    setRoofSelectionActive(false);
    setSelectedRoofPoints([]);
  };

  // useEffect(() => {
  //   if (batchGroups.length > 0) {
  //     console.log("batchindex değişti")
  //     setCurrentBatchIndex(batchGroups.length - 1); // Update current batch index after batchGroups update
  //   }
  // }, [batchGroups]);

  const handleBatchAddFinish = (newPanels) => {
    const positions = newPanels.current.map((panel) => panel.position);
    // İlk olarak `currentBatch`'i `batchGroups`'a ekleyelim
    console.log("newpanels", newPanels);
    setBatchGroups((prev) => [...prev, newPanels.current]);

    // `currentBatchIndex`'i güncelle
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);

    // Sonra diğer işlemleri yapalım
    setPanels((prev) => [...prev, ...positions]);
    setOccupiedPositions((prev) => [...prev, ...positions]);

    // `currentBatch`'i sıfırla
    setCurrentBatch([]);
    setBatchAddPanelMode(false);

    // Yeni batch'in `occupiedPositions`'ını ekleyin
    // const newOccupiedPositions = newPanels.current.map(
    //   (panel) => panel.position
    // );
    // setOccupiedPositions((prev) => [...prev, ...newOccupiedPositions]);
  };

  const handlePanelClick = (panel) => {
    const batchIndex = panel.userData.batchIndex;
    console.log("handlepanelclickdeyim ve batchgroup:", batchGroups);
    console.log("handlepanelclickdeyim ve batchindex:", batchIndex);

    const batchPanels = batchGroups[batchIndex];
    modelGroupRef.current.clear(); // Clear existing panels in modelGroupRef

    if (batchPanels) {
      setSelectedBatch(batchPanels);
      setBatchEditing(true); // Enable batch editing
      modelGroupRef.current.clear(); // Clear existing panels in modelGroupRef
      console.log("önemli modelgroupref", modelGroupRef.current);
      batchPanels.forEach((panel) => modelGroupRef.current.add(panel)); // Add selected batch panels to modelGroupRef
      console.log("önemli modelgroupsssss", modelGroupRef.current);
    } else {
      console.error(`Batch group not found for index: ${batchIndex}`);
    }
  };

  const handleBatchEditingFinish = (newPanels) => {
    const positions = newPanels.current.map((panel) => panel.position);
    const index = newPanels.current[0].userData.batchIndex;
    console.log("newpanels", newPanels);
    setBatchGroups((prev) => [...prev, newPanels.current]);

    // `currentBatchIndex`'i güncelle
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);

    // Sonra diğer işlemleri yapalım
    setPanels((prev) => {
      const updatedPanels = [...prev];
      updatedPanels[index] = positions;
      return updatedPanels;
    });    
    
    setOccupiedPositions((prev) => [...prev, ...positions]);

    // `currentBatch`'i sıfırla
    setCurrentBatch([]);

  };

  useEffect(() => {
    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      setObstaclesPoints(points);
      console.log("poinyssssss", points);
      console.log("obstaclepoints: ", obstaclesPoints);
    }
  }, [selectionStart, selectionEnd]);


  const savePanels = (newPanels) => {
    setPanels((prevPanels) => [...prevPanels, ...newPanels]);
  };

  return (
    <>
      <Box
        sx={{
          overflow: "hidden",
          position: "relative",
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid
          container
          direction="row"
          sx={{
            position: "absolute",
            zIndex: 100,
            top: "10px",
            left: "10px",
            width: "fit-content",
          }}
          spacing={1}
        >
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setRoofSelectionActive(!roofSelectionActive)}
            >
              {roofSelectionActive ? "Finish Selecting" : "Select Roof Area"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleCancelRoofSelection}>
              Cancel Select Roof Area
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleSelectModeToggle}>
              {isSelecting ? "Cancel" : "Select Obstacles"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setAddPanelMode(!addPanelMode)}
            >
              {addPanelMode ? "Cancel" : "Add Solar Panels"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => {
                setIsCancelled(true);
                setAddPanelMode(false);
                setShowModelPreview(false);
                setPanelPosition(new THREE.Vector3());
                if (panels.length > 0) {
                  setPanels(panels.slice(0, -1));
                }
              }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => {
                if (batchAddPanelMode) {
                  handleBatchAddFinish(placedPanelPositionsRef);
                }
                setBatchAddPanelMode(!batchAddPanelMode);
              }}
            >
              {batchAddPanelMode ? "Finish Batch Add" : "Batch Add Panels"}
            </Button>
          </Grid>
          <Grid item>
            <Accordion
              sx={{ width: "fit-content", boxShadow: "none", border: "none" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  borderRadius: 1,
                  minHeight: "36.5px",
                  "& .MuiAccordionSummary-content": {
                    margin: 0,
                  },
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                <Typography>Adjust Orientation</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: "#f1f1f1" }}>
                <TextField
                  margin="dense"
                  label="Orientation Angle"
                  type="number"
                  fullWidth
                  value={orientationAngle}
                  onChange={handleOrientationChange}
                  inputProps={{ min: 0, max: 180 }}
                />
                <TextField
                  margin="dense"
                  label="Rotation Angle"
                  type="number"
                  fullWidth
                  value={rotationAngle}
                  onChange={handleRotationChange}
                  inputProps={{ min: 0, max: 360 }}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => {
                if (!batchEditing) {
                  setEditPanel(!editPanel);
                  handleBatchEditingFinish(placedPanelPositionsRef)
                } else {
                  setBatchEditing(false);
                }
              }}
            >
              {editPanel ? "Finish Edit Panels" : "Edit Panels"}
            </Button>
          </Grid>
        </Grid>
        <Stack>
          <Canvas
            ref={canvasRef}
            style={{
              width: "55vw",
              height: "80vh",
              border: "2px solid #000",
            }}
            gl={{ antialias: true }}
            shadows
            dpr={[1, 2]}
            camera={{ fov: 75 }}
            id="simulation-canvas"
          >
            <ambientLight intensity={1} />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={false}
            />
            <CameraControlled />
            {editPanel && (
              <RaycasterComponent
                handlePanelClick={handlePanelClick}
                setSelectedBatch={setSelectedBatch}
                batchGroups={batchGroups}
                setAddPanelStart={setAddPanelStart}
                setAddPanelEnd={setAddPanelEnd}
                setBatchEditing={setBatchEditing}
              />
            )}
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
              gridPositions={gridPositions}
              handlePanelClick={handlePanelClick} // Pass handlePanelClick to Experience
            />
            {(batchAddPanelMode || batchEditing) && (
              <AddPanelArea
                selectedRoofPoints={selectedRoofPoints}
                orientationAngle={(orientationAngle * Math.PI) / 180}
                rotationAngle={(rotationAngle * Math.PI) / 180}
                points={obstaclesPoints}
                occupiedPositions={occupiedPositions}
                placedPanelPositionsRef={placedPanelPositionsRef}
                handlePanelClick={handlePanelClick} // Pass panel click handler
                batchGroups={batchGroups} // Pass batchGroups
                currentBatchIndex={currentBatchIndex} // Pass currentBatchIndex
                addPanelStart={addPanelStart}
                addPanelEnd={addPanelEnd}
                savePanels={savePanels} // Pass savePanels function
                modelGroupRef={modelGroupRef} // Pass modelGroupRef
                batchAddPanelMode={batchAddPanelMode}
              />
            )}
            {addPanelMode && (
              <AddPanel
                isCancelled={isCancelled}
                position={panelPosition}
                isVisible={addPanelMode}
              />
            )}
          </Canvas>
        </Stack>
      </Box>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert
          onClose={() => setAlertOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SimulationTest;
