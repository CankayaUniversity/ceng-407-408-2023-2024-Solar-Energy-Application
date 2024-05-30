import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button, Grid, Box } from "@mui/material";
import { SOLARPANEL } from "./../../api/api";
import { useParams } from 'react-router-dom';


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
      const canvasElement = document.getElementById("display-canvas");

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

const ProjectScreen = ({ solarPanelID }) => {
  const [panels, setPanels] = useState([]);
  const [image, setImage] = useState(null);
  const [currentCenter, setCurrentCenter] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(null);
  const [roofTexture, setRoofTexture] = useState(null);
  const planeRef = useRef();
  const { solarPanel } = useParams();



  const modelRef = useRef();
  const textureRef = useRef();
  const getPanels = async () => {
    let response, error;
    [response, error] = await SOLARPANEL.getPanels(solarPanel);
    if (response) {
      console.log("res", response);
       setImage(response.roofImage);
      loadModelFromJSON(response.panelsToJSON);
    } else {
      console.log("err", error);
    }
  };

  const loadModelFromJSON = (modelJSON) => {
    const loader = new THREE.ObjectLoader();
    modelJSON.forEach(panel => {
      const object = loader.parse(panel.data);
      if (textureRef.current) {
        object.traverse((child) => {
          if (child.isMesh) {
            child.material.map = textureRef.current;
            child.material.needsUpdate = true;
          }
        });
      }
  
      if (modelRef.current) {
        modelRef.current.add(object);
      }
    });
    
    
  };

  useEffect(() => {
    getPanels();
  }, []);

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(image, (texture) => {
      setRoofTexture(texture);
    });
  }, [image]);

  return (
    
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
        {/* Ekstra kontrol düğmeleri buraya eklenebilir */}
      </Grid>
      <Canvas
        style={{
          width: "55vw",
          height: "80vh",
          border: "2px solid #000",
        }}
        gl={{ antialias: true }}
        shadows
        dpr={[1, 2]}
        camera={{ fov: 75 }}
        id="display-canvas"
        onCreated={({ scene }) => {
          modelRef.current = scene;
        }}
      >
        <ambientLight intensity={1} />
        {roofTexture && (
        <mesh ref={planeRef} position={[0, 0, 0]}>
          <planeGeometry
            args={[window.innerWidth / 2, window.innerHeight, 1, 1]}
          />
          <meshBasicMaterial map={roofTexture} />
        </mesh>
      )}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={false}
        />
        <CameraControlled />
      </Canvas>
    </Box>
  );
};

export default ProjectScreen;
