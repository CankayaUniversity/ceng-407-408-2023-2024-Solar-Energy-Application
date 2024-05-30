import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import reportImage from"../../assets/images/cardblog2.png";
import * as THREE from "three";
import 'jspdf-autotable';
import { AddPanelArea } from "../../components/AddPanelArea";
import { loadOriginalModel } from "../../components/LoadOriginalModel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  Select,
  MenuItem, 
  FormControl, 
  InputLabel
} from "@mui/material";




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
    const initialDistance = 500;
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

/**
 * Represents the SimulationTest component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.screenshot - The screenshot to be displayed.
 * @returns {JSX.Element} The SimulationTest component.
 */
function SimulationTest({ screenshot, currentCenter, currentZoom, projectData,customerDetails }) {
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
  const modelGroupRef = useRef(new THREE.Group());
  const [batchGroups, setBatchGroups] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [batchEditing, setBatchEditing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [addPanelStart, setAddPanelStart] = useState(null);
  const [addPanelEnd, setAddPanelEnd] = useState(null);
  const [editPanel, setEditPanel] = useState(false);
  const [modelPath, setModelPath] = useState('s2.glb');

  const handleModelChange = (event) => {
    console.log("Model path changed to:", event.target.value);
    setModelPath(event.target.value);
  };

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
    console.log("Model path in useEffect:", modelPath);
    loadOriginalModel(modelPath, (originalModel) => {
      console.log('original', originalModel);

      // Model ile ilgili işlemleriniz
    });
  }, [modelPath]);

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

  const handleBatchAddFinish = (newPanels) => {
    const positions = newPanels.current.map((panel) => panel.position);
    console.log("newpanels", newPanels);
    setBatchGroups((prev) => [...prev, newPanels.current]);
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);
    setPanels((prev) => [...prev, ...positions]);
    setOccupiedPositions((prev) => [...prev, ...positions]);
    setCurrentBatch([]);
    setBatchAddPanelMode(false);
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
    setBatchGroups((prev) => {
      const updatedBatchGroups = [...prev];
      updatedBatchGroups[index] = newPanels.current;
      return updatedBatchGroups;
    });
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);
    setPanels((prev) => {
      const updatedPanels = [...prev];
      updatedPanels[index] = positions;
      return updatedPanels;
    });    
    setOccupiedPositions((prev) => [...prev, ...positions]);
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

  const calculateEnergy = () => {
    // Toplam panel sayısını hesapla
    const totalPanels = batchGroups.reduce((total, batch) => total + batch.length, 0)+panels.length;
    
    const energyPerPanel = 300; // Örnek olarak panel başına enerji üretimi (kWh)
    const totalEnergy = totalPanels * energyPerPanel; // Toplam enerji üretimi
    const adjustedEnergy = totalEnergy * projectData.cosine_factor; // Ayar faktörü uygulanmış enerji üretimi
    const total = adjustedEnergy * (projectData.consumption / projectData.consumption_period); // Nihai toplam enerji tasarrufu
    return total;
  };
  

  /*
const calculateEnergy = () => {
    // Tekli eklenen panellerin sayısı
    const singlePanelsCount = panels.length;
  
    // Batch gruplarındaki panellerin sayısı
    const batchPanelsCount = batchGroups.reduce((total, batch) => total + batch.length, 0);
  
    // Toplam panel sayısını hesapla
    const totalPanels = singlePanelsCount + batchPanelsCount;
  
    const energyPerPanel = 300; // Örnek olarak panel başına enerji üretimi (kWh)
    const totalEnergy = totalPanels * energyPerPanel; // Toplam enerji üretimi
    const adjustedEnergy = totalEnergy * projectData.cosine_factor; // Ayar faktörü uygulanmış enerji üretimi
    const total = adjustedEnergy * (projectData.consumption / projectData.consumption_period); // Nihai toplam enerji tasarrufu
  
    return total;
  };
  */
  
  


  
  const generatePDF = () => {
    const totalEnergy = calculateEnergy();
    const totalPanels = batchGroups.reduce((total, batch) => total + batch.length, 0);
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Solar App Energy Report", 105, 20, null, null, "center");
  
    // Company Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Company Information", 14, 30);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const companyInfo = [
      ["Company Name", customerDetails?.company_name || "N/A"],
      ["Address", customerDetails?.address || "N/A"],
      ["Phone", customerDetails?.phone || "N/A"],
      ["E-mail", customerDetails?.email || "N/A"]
    ];
    doc.autoTable({
      startY: 34,
      body: companyInfo,
      theme: 'striped'
    });
  
    // Report Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Energy Report", 14, doc.autoTable.previous.finalY + 10);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const reportInfo = [
      ["Total Panels", totalPanels],
      ["Total Energy", `${totalEnergy.toFixed(2)} kWh`]
    ];
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 14,
      body: reportInfo,
      theme: 'striped'
    });
  
    // Net Parameters
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Net Parameters", 14, doc.autoTable.previous.finalY + 10);
  
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const netParameters = [
      ["Cosine Factor", projectData.cosine_factor],
      ["Consumption", projectData.consumption],
      ["Consumption Period", projectData.consumption_period]
    ];
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 14,
      body: netParameters,
      theme: 'striped'
    });
  
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This document is generated automatically by the Solar App.",
      14,
      290
    );
  
    // Add external image
    const img = new Image();
    img.src = reportImage;
    img.onload = function() {
      doc.addImage(img, 'PNG', 15, doc.autoTable.previous.finalY + 20, 180, 100);
      
      // Generate the PDF
      doc.save('Energy Report.pdf');
    };
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
          
          <Grid item>
            <FormControl variant="outlined" sx={{ minWidth: "200px" }}>
              <InputLabel id="model-select-label" sx={{ color: "#1976d2" }}>Model</InputLabel>
              <Select
                labelId="model-select-label"
                value={modelPath}
                onChange={handleModelChange}
                label="Model"
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    height: "40px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2",
                  },
                }}
              >
                <MenuItem value="s1.glb">Model S1</MenuItem>
                <MenuItem value="s2.glb">Model S2</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={generatePDF}>
              Generate PDF
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
              currentCenter={currentCenter}
              currentZoom={currentZoom}
            />
            {(batchAddPanelMode || batchEditing) && modelPath && (
              <AddPanelArea
                selectedRoofPoints={selectedRoofPoints}
                orientationAngle={(orientationAngle * Math.PI) / 180}
                rotationAngle={(rotationAngle * Math.PI) / 180}
                points={obstaclesPoints}
                occupiedPositions={occupiedPositions}
                placedPanelPositionsRef={placedPanelPositionsRef}
                handlePanelClick={handlePanelClick}
                batchGroups={batchGroups}
                currentBatchIndex={currentBatchIndex}
                addPanelStart={addPanelStart}
                addPanelEnd={addPanelEnd}
                savePanels={savePanels}
                modelGroupRef={modelGroupRef}
                batchAddPanelMode={batchAddPanelMode}
                modelPath={modelPath}
                currentZoom={currentZoom}

              />
            )}
            {addPanelMode && (
              <AddPanel
                isCancelled={isCancelled}
                position={panelPosition}
                isVisible={addPanelMode}
                modelPath={modelPath}
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
