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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { AddPanelArea } from "../../components/AddPanelArea";
import { loadOriginalModel } from "../../components/LoadOriginalModel";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

let redPixels = [];
export function setRedPixels(pixels) {
  redPixels = pixels;
}

//cancel'e bakılacak

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

function CameraControlled({ handleCancel, isCancelled }) {
  const { camera, scene } = useThree();

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

  useEffect(() => {
    if (isCancelled) {
      handleCancel(scene);
    }
  }, [isCancelled]);

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
function SimulationTest({ screenshot, currentCenter, currentZoom }) {
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
  const [batchEditing, setBatchEditing] = useState(false); // Batch editing state
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0); // Current batch index
  const [addPanelStart, setAddPanelStart] = useState(null);
  const [addPanelEnd, setAddPanelEnd] = useState(null);
  const [editPanel, setEditPanel] = useState(false);
  const [singleEditing, setSingleEditing] = useState(false);
  const [isSingle, setIsSingle] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modelPath, setModelPath] = useState("s2.glb");

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
      console.log("original", originalModel);

      // Model ile ilgili işlemleriniz
    });
  }, [modelPath]);

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

  const placePanel = (position) => {
    const baseModelWidth = 8; // Base model width
    const baseModelHeight = 6.5; // Base model height

    const scaleX = 1.7; // Horizontal scaling
    const scaleY = 3.4; // Vertical scaling
    const modelWidth = baseModelWidth * scaleX;
    const modelHeight = baseModelHeight * scaleY;

    const paddedModelWidth = modelWidth;
    const paddedModelHeight = modelHeight;

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
        console.warn("Panel can not placed on obstacles.");
        return;
      }
      if (!pointInPolygon(position, selectedRoofPoints)) {
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
        console.warn("You can not replace a panel to another panels top.");
        return;
      }
      if (!isCancelled) {
        //Ayar çekilecek
        if (singleEditing) {
          setPanels([...panels, position]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setSingleEditing(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        } else {
          setPanels([...panels, position]);
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
        console.warn("You can not replace a panel to another panels top.");
        console.log("occupied'a yakalandım", occupiedPositions);
        return;
      }
      if (!isCancelled) {
        //Ayar çekilecek
        if (singleEditing) {
          console.log("selams");
          setPanels([...panels, position]);
          setIsCancelled(false);
          setIsPanelPlaced(true);
          setSingleEditing(false);
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setOccupiedPositions((prev) => [...prev, ...corners]);
        } else {
          console.log("burdayıms");

          setPanels([...panels, position]);
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

    setPanels((prev) => [...prev, ...positions]);
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
    } else if(panel.userData.startPosition) {
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

    // `currentBatchIndex`'i güncelle
    setCurrentBatchIndex((prevIndex) => prevIndex + 1);

    // Sonra diğer işlemleri yapalım
    setPanels((prev) => {
      const updatedPanels = [...prev];
      updatedPanels[index] = positions;
      return updatedPanels;
    });

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
            <FormControl variant="outlined" sx={{ minWidth: "200px" }}>
              <InputLabel id="model-select-label" sx={{ color: "#1976d2" }}>
                Model
              </InputLabel>
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
                    backgroundColor: "#1976d2", // Arka plan rengini mavi yapıyoruz
                    color: "white", // Yazı rengini beyaz yapıyoruz
                    height: "40px", // Yüksekliği daha ince yapıyoruz
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2", // Kenar rengini mavi yapıyoruz
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1976d2", // Hover durumunda kenar rengi
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    color: "white", // İkon rengini beyaz yapıyoruz
                  },
                  "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1976d2", // Odaklandığında kenar rengini mavi yapıyoruz
                  },
                }}
              >
                <MenuItem value="s1.glb">Model S1</MenuItem>
                <MenuItem value="s2.glb">Model S2</MenuItem>
              </Select>
            </FormControl>
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
            <CameraControlled
              handleCancel={handleCancel}
              isCancelled={isCancelled}
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
              gridPositions={gridPositions} // Pass the calculated positions
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
                handlePanelClick={handlePanelClick} // Pass panel click handler
                batchGroups={batchGroups} // Pass batchGroups
                currentBatchIndex={currentBatchIndex} // Pass currentBatchIndex
                addPanelStart={addPanelStart}
                addPanelEnd={addPanelEnd}
                modelGroupRef={modelGroupRef} // Pass modelGroupRef
                batchAddPanelMode={batchAddPanelMode}
                modelPath={modelPath}
                redPixels={redPixels}
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
