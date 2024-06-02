import React, { useEffect, useState, useRef, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Experience } from "../../components/Experience";
import { AddPanel } from "../../components/AddPanel";
import roofImage from "../../assets/images/roof.jpg";
import reportImage from "../../assets/images/card1.jpeg";
import * as THREE from "three";
import "jspdf-autotable";
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
  InputLabel,
} from "@mui/material";

let redPixels3D = [];
export function setRedPixels(pixels) {
  redPixels3D = pixels;
  console.log("redPixels3Dilk", redPixels3D);
}

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

function CameraControlled({ handleCancel, isCancelled, sceneRef, cameraRef }) {
  const { camera, scene } = useThree();

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

  useEffect(() => {
    if (isCancelled) {
      handleCancel(scene);
    }
  }, [isCancelled]);

  useEffect(() => {
    sceneRef.current = scene;
    cameraRef.current = camera;
  }, []);

  return null;
}

function RaycasterComponent({
  handlePanelClick,
  setSelectedBatch,
  batchGroups,
  setAddPanelStart,
  setAddPanelEnd,
  setBatchEditing,
  setSingleEditing,
  setIsSingle,
  singleEditing,
}) {
  const { scene, camera, gl } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    if (!singleEditing) {
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
            if (intersectedObject.userData.isSingle) {
              console.log("selam");
              setIsSingle(true);
              handlePanelClick(intersectedObject);
            } else {
              handlePanelClick(intersectedObject);
              setBatchEditing(true);
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
            }
          }
        } else {
          setSelectedBatch([]);
        }
      };

      window.addEventListener("click", onMouseClick);

      return () => {
        window.removeEventListener("click", onMouseClick);
      };
    }
  }, [
    scene,
    camera,
    handlePanelClick,
    setSelectedBatch,
    batchGroups,
    singleEditing,
  ]);

  return null;
}

/**
 * Represents the SimulationTest component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.screenshot - The screenshot to be displayed.
 * @returns {JSX.Element} The SimulationTest component.
 */
function SimulationTest({
  screenshot,
  currentCenter,
  currentZoom,
  customerDetails,
  formData,
  setFormData,
}) {
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
  const modelRef = useRef();
  const [batchGroups, setBatchGroups] = useState([]);
  const [currentBatch, setCurrentBatch] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState([]);
  const [batchEditing, setBatchEditing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [addPanelStart, setAddPanelStart] = useState(null);
  const [addPanelEnd, setAddPanelEnd] = useState(null);
  const [editPanel, setEditPanel] = useState(false);
  const [singleEditing, setSingleEditing] = useState(false);
  const [isSingle, setIsSingle] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modelPath, setModelPath] = useState("s1.glb");
  const [selectionBoxWorked, setSelectionBoxWorked] = useState(false);
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();

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

  useEffect(() => {
    console.log("formData", formData);
    console.log("custoemrdeta",customerDetails)
    loadOriginalModel(modelPath, (originalModel) => {
      console.log("original", originalModel);

      // Model ile ilgili işlemleriniz
    });
  }, [modelPath]);

  useEffect(() => {
    console.log("panels:", panels);
    if (panels.length != 0) {
      const panelsToJSON = panels.map((panel) => panel.toJSON());
      console.log("panelstojson", panelsToJSON);
      setFormData((prevState) => ({
        ...prevState,
        solarPanel: {
          ...prevState.solarPanel,
          panelsToJSON,
        },
      }));
    }
  }, [panels]);

  const toggleRoofSelection = () =>
    setRoofSelectionActive(!roofSelectionActive);

  const handleSelectModeToggle = () => {
    setIsSelecting(!isSelecting);
    setAddPanelMode(false);
  };

  const panelSize = { width: 1.7, height: 3.4 };

  const getPanelCorners = (position) => {
    const baseModelWidth = 8; // Base model width
    const baseModelHeight = 6.5; // Base model height

    const scaleX = 1.7; // Horizontal scaling
    const scaleY = 3.4; // Vertical scaling
    const modelWidth = baseModelWidth * scaleX;
    const modelHeight = baseModelHeight * scaleY;

    const corners = [
      new THREE.Vector3(-modelWidth / 2, -modelHeight / 2, 0).add(position),
      new THREE.Vector3(modelWidth / 2, -modelHeight / 2, 0).add(position),
      new THREE.Vector3(modelWidth / 2, modelHeight / 2, 0).add(position),
      new THREE.Vector3(-modelWidth / 2, modelHeight / 2, 0).add(position),
    ];

    return corners;
  };

  const handleCancel = (scene) => {
    if (modelRef.current) {
      console.log("cancel if");
      scene.remove(modelRef.current);
      setIsCancelled(false);
    }
  };

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

  const baseModelWidth = 8; // Base model width
  const baseModelHeight = 6.5; // Base model height

  const scaleX = 1.7; // Horizontal scaling
  const scaleY = 3.4; // Vertical scaling
  const modelWidth = baseModelWidth * scaleX;
  const modelHeight = baseModelHeight * scaleY;

  const paddedModelWidth = modelWidth * 0.5;
  const paddedModelHeight = modelHeight * 0.4;
  // Create a grid from red pixels
  const gridSize = paddedModelWidth;
  const redPixelGrid = useMemo(
    () => createGrid(redPixels3D, gridSize),
    [redPixels3D, gridSize]
  );

  const placePanel = (position) => {
    const corners = [
      new THREE.Vector3(-modelWidth / 2, -modelHeight / 2, 0).add(position),
      new THREE.Vector3(modelWidth / 2, -modelHeight / 2, 0).add(position),
      new THREE.Vector3(modelWidth / 2, modelHeight / 2, 0).add(position),
      new THREE.Vector3(-modelWidth / 2, modelHeight / 2, 0).add(position),
    ];

    if (selectionStart != null && selectionEnd != null) {
      let topRight = { x: selectionEnd.x, y: selectionStart.y, z: 0 };
      let bottomLeft = { x: selectionStart.x, y: selectionEnd.y, z: 0 };
      let points = [selectionStart, topRight, selectionEnd, bottomLeft];
      setObstaclesPoints(points);
      if (pointInPolygon(position, points)) {
        console.warn("Panel cannot be placed on obstacles.");
        return;
      }
      if (
        isCollisionWithGrid(position, redPixelGrid, gridSize) ||
        !pointInPolygon(position, selectedRoofPoints)
      ) {
        console.warn("Panel can only be placed within the selected area.");
        return;
      }

      if (
        occupiedPositions.some(
          (occupiedPosition) =>
            occupiedPosition && // Check if occupiedPosition is not undefined
            corners.some(
              (corner) =>
                Math.abs(occupiedPosition.x - corner.x) < paddedModelWidth &&
                Math.abs(occupiedPosition.y - corner.y) < paddedModelHeight
            )
        )
      ) {
        console.warn("You cannot place a panel on top of another panel.");
        return;
      }
      if (!isCancelled && modelRef.current) {
        if (singleEditing) {
          setPanels([...panels, modelRef.current]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setSingleEditing(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        } else {
          setPanels([...panels, modelRef.current]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setAddPanelMode(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        }
      }
    } else {
      if (!pointInPolygon(position, selectedRoofPoints)) {
        console.warn("Panel can only be placed within the selected area.");
        return;
      }
      if (isCollisionWithGrid(position, redPixelGrid, gridSize)) {
        console.warn("Panel cannot be placed on red pixels.");
        return;
      }
      if (
        occupiedPositions.some(
          (occupiedPosition) =>
            occupiedPosition && // Check if occupiedPosition is not undefined
            corners.some(
              (corner) =>
                Math.abs(occupiedPosition.x - corner.x) < paddedModelWidth &&
                Math.abs(occupiedPosition.y - corner.y) < paddedModelHeight
            )
        )
      ) {
        console.warn("You cannot place a panel on top of another panel.");
        return;
      }
      if (!isCancelled && modelRef.current) {
        if (singleEditing) {
          setPanels([...panels, modelRef.current]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setSingleEditing(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        } else {
          setPanels([...panels, modelRef.current]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setAddPanelMode(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        }
      }
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
    const batchCorners = newPanels.current.flatMap((panel) =>
      getPanelCorners(panel.position)
    );

    setCurrentBatchIndex((prevIndex) => prevIndex + 1);

    setPanels((prev) => [...prev, ...newPanels.current]);
    setOccupiedPositions((prev) => [...prev, ...batchCorners]);

    setCurrentBatch([]);
    setBatchAddPanelMode(false);
  };

  const handlePanelClick = (panel) => {
    if (isSingle) {
      modelRef.current = panel;
      setSingleEditing(true);

      // Tekli panelin mevcut pozisyonunu occupiedPositions'dan çıkar
      const corners = getPanelCorners(panel.position);
      setOccupiedPositions((prev) =>
        prev.filter(
          (occupiedPosition) =>
            !corners.some(
              (corner) =>
                Math.abs(occupiedPosition.x - corner.x) < panelSize.width &&
                Math.abs(occupiedPosition.y - corner.y) < panelSize.height
            )
        )
      );

      setIsSingle(false);
    } else if (panel.userData.startPosition) {
      const batchIndex = panel.userData.batchIndex;
      const batchPanels = batchGroups[batchIndex];
      modelGroupRef.current.clear();

      if (batchPanels) {
        setSelectedBatch(batchPanels);
        setBatchEditing(true);
        modelGroupRef.current.clear();

        // Batch'in mevcut pozisyonlarını sakla
        const batchPositions = batchPanels.flatMap((panel) =>
          getPanelCorners(panel.position)
        );

        // Yalnızca bu batch'e ait pozisyonları occupiedPositions'dan çıkar
        setOccupiedPositions((prev) =>
          prev.filter(
            (occupiedPosition) =>
              !batchPositions.some(
                (corner) =>
                  Math.abs(occupiedPosition.x - corner.x) < panelSize.width &&
                  Math.abs(occupiedPosition.y - corner.y) < panelSize.height
              )
          )
        );

        batchPanels.forEach((panel) => modelGroupRef.current.add(panel));
      } else {
        console.error(`Batch group not found for index: ${batchIndex}`);
      }
    }
  };

  const handleBatchEditingFinish = (newPanels) => {
    const positions = newPanels.current.map((panel) => panel.position);
    const index = newPanels.current[0].userData.batchIndex;
    console.log("newpanels", newPanels);
    const batchCorners = newPanels.current.flatMap((panel) =>
      getPanelCorners(panel.position)
    );

    setBatchGroups((prev) => {
      const updatedBatchGroups = [...prev];
      updatedBatchGroups[index] = newPanels.current;
      return updatedBatchGroups;
    });
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);

    if (selectionBoxWorked) {
      setPanels((prev) => {
        const updatedPanels = prev.filter(
          (panel) => panel.userData.batchIndex !== index
        );
        return [...updatedPanels, ...newPanels.current];
      });

      setSelectionBoxWorked(false);
    } else {
      // panels dizisinde eski batch panellerini güncelle
      setPanels((prev) => {
        const updatedPanels = [...prev];
        const newBatchPanels = newPanels.current;
        newBatchPanels.forEach((panel) => {
          const existingPanelIndex = updatedPanels.findIndex(
            (p) => p.uuid === panel.uuid
          );
          if (existingPanelIndex !== -1) {
            updatedPanels[existingPanelIndex] = panel;
          }
        });
        return updatedPanels;
      });
    }

    setOccupiedPositions((prev) => [...prev, ...batchCorners]);

    // `currentBatch`'i sıfırla
    setCurrentBatch([]);

    setBatchEditing(false);
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

  const calculateEnergy = () => {
    // Toplam panel sayısını hesapla
    const totalPanels = panels.length;

    const averageMonthlyEnergyPerPanel = 30; // Panel başına aylık ortalama enerji üretimi (kWh)
    const totalMonthlyEnergy = totalPanels * averageMonthlyEnergyPerPanel; // Toplam aylık enerji üretimi
    const adjustedMonthlyEnergy = totalMonthlyEnergy * formData.cosine_factor; // Ayar faktörü uygulanmış aylık enerji üretimi
    const totalEnergySavings =
      adjustedMonthlyEnergy *
      (formData.consumption / formData.consumption_period); // Nihai toplam enerji tasarrufu

    return totalEnergySavings;
  };

  const generatePDF = async () => {
    const canvasElement = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
    renderer.render(sceneRef.current, cameraRef.current);

    const dataURL = canvasElement.toDataURL("image/png");

    const totalEnergy = calculateEnergy();
    const totalPanels = panels.length;
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
      ["Customer Name", customerDetails.name || "N/A"],
      ["Customer Phone", customerDetails.phone || "N/A"],
      ["Customer E-mail", customerDetails.email || "N/A"],
    ];
    doc.autoTable({
      startY: 34,
      body: companyInfo,
      theme: "striped",
    });

    // Report Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Energy Report", 14, doc.autoTable.previous.finalY + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const reportInfo = [
      ["Total Panels", totalPanels],
      ["Total Energy", `${totalEnergy.toFixed(2)} kWh`],
    ];
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 14,
      body: reportInfo,
      theme: "striped",
    });

    // Net Parameters
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Net Parameters", 14, doc.autoTable.previous.finalY + 10);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const netParameters = [
      ["Cosine Factor", formData.cosine_factor],
      ["Consumption", formData.consumption],
      ["Consumption Period", formData.consumption_period],
    ];
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 14,
      body: netParameters,
      theme: "striped",
    });

    // Ekran görüntüsünü PDF'e ekleyin
    doc.addImage(
      dataURL,
      "PNG",
      15,
      doc.autoTable.previous.finalY + 20,
      180,
      100
    );

    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This document is generated automatically by the Solar App.",
      14,
      290
    );

    // Generate the PDF
    doc.save("Energy Report.pdf");
  };

  return (
    <>
      <Box
        sx={{
          overflow: "hidden",
          position: "relative",
          width: "100%",
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
              onClick={() => {
                if (addPanelMode) {
                  setIsCancelled(true);
                  setAddPanelMode(false);
                } else {
                  setAddPanelMode(!addPanelMode);
                }
              }}
            >
              {addPanelMode ? "Cancel" : "Add Solar Panel"}
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
                if (!editPanel) {
                  setEditPanel(true);
                } else {
                  if (batchEditing) {
                    handleBatchEditingFinish(placedPanelPositionsRef);
                  }
                  setEditPanel(false);
                }
              }}
            >
              {editPanel ? "Finish Editing Panels" : "Edit Panels"}
            </Button>
          </Grid>

          <Grid item>
            <FormControl
              variant="outlined"
              sx={{
                width: "fit-content",
                boxShadow: "none",
                border: "none",
                minWidth: "200px",
              }}
            >
              <Select
                value={modelPath}
                onChange={handleModelChange}
                displayEmpty
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
                  backgroundColor: "#1976d2",
                  color: "white",
                  height: "36.5px",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1565c0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2",
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                  "& .MuiList-root": {
                    backgroundColor: "#1976d2",
                    color: "white",
                  },
                  "& .MuiListItem-root": {
                    backgroundColor: "#1976d2",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  },
                }}
              >
                <MenuItem value="s1.glb">Model 1</MenuItem>
                <MenuItem value="s2.glb">Model 2</MenuItem>
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
              backgroundColor: "black",
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
            <CameraControlled
              handleCancel={handleCancel}
              isCancelled={isCancelled}
              sceneRef={sceneRef}
              cameraRef={cameraRef}
            />
            {editPanel && (
              <RaycasterComponent
                handlePanelClick={handlePanelClick}
                setSelectedBatch={setSelectedBatch}
                batchGroups={batchGroups}
                setAddPanelStart={setAddPanelStart}
                setAddPanelEnd={setAddPanelEnd}
                setBatchEditing={setBatchEditing}
                setSingleEditing={setSingleEditing}
                setIsSingle={setIsSingle}
                singleEditing={singleEditing}
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
              singleEditing={singleEditing}
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
                modelGroupRef={modelGroupRef} // Pass modelGroupRef
                batchAddPanelMode={batchAddPanelMode}
                modelPath={modelPath}
                redPixels3D={redPixels3D}
                currentZoom={currentZoom}
                setSelectionBoxWorked={setSelectionBoxWorked}
              />
            )}
            {(addPanelMode || singleEditing) && (
              <AddPanel
                isCancelled={isCancelled}
                position={panelPosition}
                modelPath={modelPath}
                modelReference={modelRef}
                currentIndex={currentIndex}
                singleEditing={singleEditing}
                rotationAngle={(rotationAngle * Math.PI) / 180}
                orientationAngle={(orientationAngle * Math.PI) / 180}
                currentZoom={currentZoom}
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
