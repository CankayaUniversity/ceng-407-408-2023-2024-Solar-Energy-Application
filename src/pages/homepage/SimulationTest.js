import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import { Vector3 } from "three";
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
import { useMemo } from "react";
import { AddPanelArea } from "../../components/AddPanelArea";
import { loadOriginalModel } from "../../components/LoadOriginalModel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function CameraControlled() {
  const { camera } = useThree();

  useEffect(() => {
    const initialDistance = 600;
    const maxDistance = 600;
    const minDistance = 600;

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
export function pointInPolygon(point, polygon) {
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

/**
 * Represents the SimulationTest component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.screenshot - The screenshot to be displayed.
 * @returns {JSX.Element} The SimulationTest component.
 */
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
  const [isPanelPlaced, setIsPanelPlaced] = useState(false); // New state variable
  const [batchAddPanelMode, setBatchAddPanelMode] = useState(false);
  const [orientationMode, setOrientationMode] = useState(false);
  const [orientationAngle, setOrientationAngle] = useState(90);
  const [rotationAngle, setRotationAngle] = useState(0); // New state for rotation angle
  const [obstaclesPoints, setObstaclesPoints] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOrientationToggle = () => {
    setOrientationMode(!orientationMode);
  };

  const handleOrientationChange = (event) => {
    setOrientationAngle(Number(event.target.value)); // Derece cinsinden değeri doğrudan güncelle
  };

  const handleRotationChange = (event) => {
    setRotationAngle(Number(event.target.value)); // Update the rotation angle
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "+" || event.key === "=") {
        // Increase rotation angle
        setRotationAngle((prev) => Math.min(prev + 1, 360));
      } else if (event.key === "-") {
        // Decrease rotation angle
        setRotationAngle((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Güneş paneli ekleme modunu ve önizlemeyi kontrol edecek fonksiyonlar
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
    setAddPanelMode(false); // Seçim moduna geçildiğinde, panel ekleme modunu kapat
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

  const handlePanelPlacement = (position) => {
    // Check if panel is placed over another panel
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

    // Check if panel is placed outside selected roof area
    if (!pointInPolygon(position, selectedRoofPoints)) {
      setAlertMessage(
        "Panel can only be placed within the selected roof area."
      );
      setAlertOpen(true);
      return;
    }

    // If all checks pass, place the panel
    setPanels((prev) => [...prev, position]);
  };

  const placePanel = (position) => {
    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      setObstaclesPoints(points);
      console.log("points", obstaclesPoints);
      if (pointInPolygon(position, points)) {
        console.warn("Panel can not placed on obstacles.");
        return; // Seçilen alanın dışındaysa, işlemi durdur
      }
      if (!pointInPolygon(position, selectedRoofPoints)) {
        console.warn("Panel can only be placed within the selected area.");
        return; // Seçilen alanın dışındaysa, işlemi durdur
      }
      if (!isCancelled) {
        setPanels([...panels, position]);
        setIsCancelled(false);
        console.log("yada buradayım");
        setIsPanelPlaced(true); // Set to true after placing the panel
      }
      setAddPanelMode(false);
    }

    if (!pointInPolygon(position, selectedRoofPoints)) {
      console.warn("Panel can only be placed within the selected area.");
      return; // Seçilen alanın dışındaysa, işlemi durdur
    }

    if (batchAddPanelMode) {
      console.log("batchaddpanelmoddayım bro");
      // Use the calculateGridPositions function to get all the positions where panels should be placed
      const gridPositions = calculateGridPositions(
        selectedRoofPoints,
        panelSize
      );
      setPanels([...panels, ...gridPositions]);
      setBatchAddPanelMode(false);
    } else {
      console.log("addpanel placedeyim");
      if (!isCancelled) {
        setPanels([...panels, position]);
        setIsCancelled(false);
        console.log("buradayım");
      }
      setAddPanelMode(false); // Panel yerleştirildikten sonra modu kapat
    }
  };

  const handleCancelRoofSelection = () => {
    setRoofSelectionActive(false);
    setSelectedRoofPoints([]);
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

  useEffect(() => {
    console.log("güncellendi", isCancelled);
  }, [isCancelled]);
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
              onClick={() => setBatchAddPanelMode(!batchAddPanelMode)}
            >
              {batchAddPanelMode ? "Finish Batch Add" : "Batch Add Panels"}
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
              onClick={() => setBatchAddPanelMode(!batchAddPanelMode)}
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
        </Grid>
        <Stack>
          <Canvas
            style={{
              width: "55vw",
              height: "80vh",
              border: "2px solid #000",
            }}
          >
            <ambientLight intensity={1} />
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
              <AddPanelArea
                selectedRoofPoints={selectedRoofPoints}
                orientationAngle={(orientationAngle * Math.PI) / 180}
                rotationAngle={(rotationAngle * Math.PI) / 180} // Pass the rotation angle
                points={obstaclesPoints}
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
          Not available
        </Alert>
      </Snackbar>
    </>
  );
}

export default SimulationTest;
