import React, { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import * as THREE from "three";
import { Button, Grid, Box, Snackbar, Alert } from "@mui/material";

function CameraControlled() {
  const { camera } = useThree();

  useEffect(() => {
    const initialDistance = 500;
    const maxDistance = 500;
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

      // Check if the mouse is over the canvas
      if (canvasElement && canvasElement.contains(event.target)) {
        camera.position.z -= event.deltaY * 0.1;
        updateCameraPosition();
        event.preventDefault(); // Prevents scrolling on the page when zooming on the canvas
      }
    };

    document.addEventListener("wheel", handleMouseWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleMouseWheel);
    };
  }, [camera]);

  return null;
}

function pointInPolygon(point, polygon) {
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
  const [addPanelMode, setAddPanelMode] = useState(false);
  const [panelPosition, setPanelPosition] = useState(new THREE.Vector3());
  const [panels, setPanels] = useState([]);
  const [isCancelled, setIsCancelled] = useState(false);
  const [roofSelectionActive, setRoofSelectionActive] = useState(false);
  const [selectedRoofPoints, setSelectedRoofPoints] = useState([]);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [draggingPanelPosition, setDraggingPanelPosition] = useState(null);

  const [roofSelections, setRoofSelections] = useState([]);
  const interactionActive = isSelecting || roofSelectionActive || addPanelMode;


  const canvasRef = useRef();

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (draggingPanelPosition) {
        setPanelPosition({
          x: event.clientX,
          y: event.clientY,
          z: draggingPanelPosition.z,
        });
      }
    };

    
    const handleMouseUp = () => {
      if (draggingPanelPosition && isCancelled) {
        setPanelPosition(new THREE.Vector3());
      }
      setDraggingPanelPosition(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingPanelPosition, isCancelled]);

  const handleMouseDown = () => {
    if (addPanelMode) {
      setDraggingPanelPosition(panelPosition);
    }
  };

  const toggleAddPanelMode = () => setAddPanelMode(!addPanelMode);
  const toggleRoofSelection = () => setRoofSelectionActive(!roofSelectionActive);
  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false);
  };

  const handleAddPanelClick = () => {
    setIsCancelled(false);
    setShowModelPreview(!showModelPreview);
    setAddPanelMode(!addPanelMode);
  };

  const panelWidth = 17;
  const panelHeight = 25;

  const panelIntersects = (newPanelPosition) => {
    return panels.some((panel) =>
      Math.abs(panel.x - newPanelPosition.x) < panelWidth &&
      Math.abs(panel.y - newPanelPosition.y) < panelHeight
    );
  };

  const placePanel = (position) => {
    if (panelIntersects(position)) {
      setAlertOpen(true);
      return;
    }

    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      if (pointInPolygon(position, points)) {
        console.warn("Panel cannot be placed on obstacles.");
        return;
      }
    }

    if (!pointInPolygon(position, selectedRoofPoints)) {
      console.warn("Panel can only be placed within the selected area.");
      return;
    }

    if (!isCancelled) {
      setPanels((prevPanels) => [...prevPanels, position]);
      setIsCancelled(false);
    }
    setAddPanelMode(false);
  };
  

  const handleCancel = () => {
    setPanels([]);
    setPanelPosition(new THREE.Vector3());
    setShowModelPreview(false);
    setAddPanelMode(false);
    setIsCancelled(true);
    handleCancelRoofSelection();
    setDraggingPanelPosition(null);
  };

  const handleFinishAddingPanels = () => {
    if (addPanelMode) {
      setAddPanelMode(false);
      setIsCancelled(true);
    }
  };

  const handleCancelRoofSelection = () => {
    setRoofSelectionActive(false);
    setSelectedRoofPoints([]);
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
          alignItems: "center"
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
            <Button variant="contained" onClick={() => setRoofSelectionActive(!roofSelectionActive)}>
              {roofSelectionActive ? "Finish Selecting" : "Select Roof Area"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleCancelRoofSelection}>
              Cancel Select Roof Area
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => setIsSelecting(!isSelecting)}>
              {isSelecting ? "Cancel" : "Select Obstacles"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => setAddPanelMode(!addPanelMode)}>
              {addPanelMode ? "Cancel" : "Add Solar Panels"}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={() => {
              setIsCancelled(true);
              setAddPanelMode(false);
              setShowModelPreview(false);
              setPanelPosition(new THREE.Vector3());
              if (panels.length > 0) {
                setPanels(panels.slice(0, -1));
              }
            }}>
              Cancel
            </Button>
          </Grid>
        </Grid>

        <Canvas
          id="simulation-canvas"
          ref={canvasRef}
          style={{
            width: "55vw",
            height: "80vh",
            border: "2px solid #000"
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 1]} intensity={1} />
          <CameraControlled />
          <Experience
            roofImage={screenshot}
            isSelecting={isSelecting}
            addPanelMode={addPanelMode}
            setPanelPosition={setPanelPosition}
            onPanelPlace={(position) => {
              if (panels.some(panel => {
                const panelWidth = 17;
                const panelHeight = 25;
                return (
                  Math.abs(panel.x - position.x) < panelWidth &&
                  Math.abs(panel.y - position.y) < panelHeight
                );
              })) {
                setAlertOpen(true);
                return;
              }
              setPanels(prev => [...prev, position]);
              setIsCancelled(false);
              setAddPanelMode(false);
            }}
            roofSelectionActive={roofSelectionActive}
            setSelectedRoofPoints={setSelectedRoofPoints}
            selectedRoofPoints={selectedRoofPoints}
            selectionStart={selectionStart}
            setSelectionStart={setSelectionStart}
            selectionEnd={selectionEnd}
            setSelectionEnd={setSelectionEnd}
          />
          {addPanelMode && (
            <AddPanel
              position={panelPosition}
              isVisible={addPanelMode}
              onMouseDown={() => setPanelPosition(panelPosition)}
            />
          )}
          <OrbitControls 
          enableZoom={false}
          enableRotate={!interactionActive}
          enablePan={!interactionActive}
           />
        </Canvas>
      </Box>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity="error" sx={{ width: "100%" }}>
          Not available
        </Alert>
      </Snackbar>
    </>
  );
}

export default SimulationTest;